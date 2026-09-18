"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const rejectPaymentSchema = z.object({
  paymentId: z.string().min(1, "পেমেন্ট আইডি আবশ্যক"),
  adminNote: z
    .string()
    .min(3, "বাতিল করার কারণ বা এডমিন নোট লিখুন (কমপক্ষে ৩ অক্ষর)")
    .max(500, "এডমিন নোট ৫০০ অক্ষরের মধ্যে হতে হবে"),
});

/**
 * Approve a pending payment atomically inside a transaction.
 * 1. Validates admin permission
 * 2. Checks payment is strictly PENDING
 * 3. Updates Payment -> APPROVED
 * 4. Grants or reactivates BookAccess (idempotent, prevents duplicate access)
 * 5. Creates AuditLog entry
 */
export async function approvePaymentAction(
  paymentId: string
): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    const admin = await requireAdmin();

    if (!paymentId || typeof paymentId !== "string") {
      return {
        success: false,
        error: "অবৈধ পেমেন্ট আইডি",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Re-fetch and verify payment state
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          userId: true,
          status: true,
          amount: true,
          transactionId: true,
          paymentMethod: true,
        },
      });

      if (!payment) {
        throw new Error("NOT_FOUND: পেমেন্ট রেকর্ডটি পাওয়া যায়নি।");
      }

      if (payment.status !== "PENDING") {
        throw new Error(
          `ALREADY_PROCESSED: এই পেমেন্টটি ইতিমধ্যে পর্যালোচনা করা হয়েছে (বর্তমান স্ট্যাটাস: ${payment.status})।`
        );
      }

      // Step 2: Fetch default active book
      const book = await tx.book.findFirst({
        where: { isActive: true },
        select: { id: true, title: true },
      });

      if (!book) {
        throw new Error("BOOK_NOT_FOUND: সক্রিয় বইয়ের তথ্য পাওয়া যায়নি।");
      }

      // Step 3: Update Payment to APPROVED
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: admin.id,
        },
      });

      // Step 4: Grant or update BookAccess (Idempotent)
      const existingAccess = await tx.bookAccess.findUnique({
        where: {
          userId_bookId: {
            userId: payment.userId,
            bookId: book.id,
          },
        },
      });

      if (existingAccess) {
        if (existingAccess.status !== "ACTIVE") {
          await tx.bookAccess.update({
            where: { id: existingAccess.id },
            data: {
              status: "ACTIVE",
              paymentId: payment.id,
              grantedAt: new Date(),
              revokedAt: null,
            },
          });
        }
      } else {
        await tx.bookAccess.create({
          data: {
            userId: payment.userId,
            bookId: book.id,
            paymentId: payment.id,
            status: "ACTIVE",
            grantedAt: new Date(),
          },
        });
      }

      // Step 5: Write Audit Log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PAYMENT_APPROVED",
          target: `Payment:${payment.id}`,
          metadata: {
            userId: payment.userId,
            transactionId: payment.transactionId,
            paymentMethod: payment.paymentMethod,
            amount: payment.amount,
            bookId: book.id,
            bookTitle: book.title,
          },
        },
      });

      return updatedPayment;
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "পেমেন্ট সফলভাবে অনুমোদিত হয়েছে এবং ব্যবহারকারীকে বইয়ের এক্সেস দেওয়া হয়েছে।",
      data: { paymentId: result.id },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.startsWith("NOT_FOUND:") || error.message.startsWith("ALREADY_PROCESSED:") || error.message.startsWith("BOOK_NOT_FOUND:")) {
        return {
          success: false,
          error: error.message.split(": ")[1] || error.message,
        };
      }
    }
    console.error("Payment approval error:", error);
    return {
      success: false,
      error: "পেমেন্ট অনুমোদন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}

/**
 * Reject a pending payment with a required admin note.
 * 1. Validates admin permission and note
 * 2. Checks payment is strictly PENDING
 * 3. Updates Payment -> REJECTED with adminNote
 * 4. Does NOT grant BookAccess
 * 5. Creates AuditLog entry
 */
export async function rejectPaymentAction(
  paymentId: string,
  adminNote: string
): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    const admin = await requireAdmin();

    const parsed = rejectPaymentSchema.safeParse({ paymentId, adminNote });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ তথ্য",
      };
    }

    const { paymentId: validPaymentId, adminNote: validNote } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Verify payment state
      const payment = await tx.payment.findUnique({
        where: { id: validPaymentId },
        select: {
          id: true,
          userId: true,
          status: true,
          amount: true,
          transactionId: true,
        },
      });

      if (!payment) {
        throw new Error("NOT_FOUND: পেমেন্ট রেকর্ডটি পাওয়া যায়নি।");
      }

      if (payment.status !== "PENDING") {
        throw new Error(
          `ALREADY_PROCESSED: এই পেমেন্টটি ইতিমধ্যে পর্যালোচনা করা হয়েছে (বর্তমান স্ট্যাটাস: ${payment.status})।`
        );
      }

      // Step 2: Update Payment to REJECTED
      const updatedPayment = await tx.payment.update({
        where: { id: validPaymentId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: admin.id,
          adminNote: validNote.trim(),
        },
      });

      // Step 3: Write Audit Log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PAYMENT_REJECTED",
          target: `Payment:${payment.id}`,
          metadata: {
            userId: payment.userId,
            transactionId: payment.transactionId,
            reason: validNote.trim(),
          },
        },
      });

      return updatedPayment;
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "পেমেন্টটি সফলভাবে বাতিল করা হয়েছে।",
      data: { paymentId: result.id },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.startsWith("NOT_FOUND:") || error.message.startsWith("ALREADY_PROCESSED:")) {
        return {
          success: false,
          error: error.message.split(": ")[1] || error.message,
        };
      }
    }
    console.error("Payment rejection error:", error);
    return {
      success: false,
      error: "পেমেন্ট বাতিল করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}
