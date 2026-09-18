"use server";

import { getCurrentUser } from "@/server/auth";
import prisma from "@/lib/prisma";
import {
  paymentSubmissionSchema,
  type PaymentSubmissionInput,
} from "@/lib/validations/payment";
import type { ActionResponse } from "@/types";

export async function submitPaymentAction(
  data: PaymentSubmissionInput
): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    // 1. Authenticate user strictly from server session
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।",
      };
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        error: "আপনার একাউন্টটি স্থগিত রয়েছে। সাপোর্টে যোগাযোগ করুন।",
      };
    }

    // 2. Validate input schema
    const parsed = paymentSubmissionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ পেমেন্ট ডাটা",
      };
    }

    const { paymentMethod, transactionId, senderNumber, amount, note } =
      parsed.data;
    const cleanTxId = transactionId.trim().toUpperCase();
    const cleanSenderNumber = senderNumber.trim();

    // 3. Fetch active book
    const book = await prisma.book.findFirst({
      where: { isActive: true },
      select: { id: true, price: true, title: true },
    });

    if (!book) {
      return {
        success: false,
        error: "বইটির তথ্য পাওয়া যায়নি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।",
      };
    }

    // 4. Atomic Database Transaction: Guard checks and creation
    const result = await prisma.$transaction(async (tx) => {
      // Check 4a: Does user already have ACTIVE BookAccess?
      const existingAccess = await tx.bookAccess.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });

      if (existingAccess && existingAccess.status === "ACTIVE") {
        throw new Error(
          "ALREADY_HAS_ACCESS: আপনার একাউন্টে ইতিমধ্যে এই বইটির সক্রিয় এক্সেস রয়েছে।"
        );
      }

      // Check 4b: Does user already have a PENDING payment?
      const pendingPayment = await tx.payment.findFirst({
        where: {
          userId: user.id,
          status: "PENDING",
        },
      });

      if (pendingPayment) {
        throw new Error(
          "PENDING_EXISTS: আপনার একটি পেমেন্ট ইতিমধ্যে যাচাইয়ের অপেক্ষায় রয়েছে।"
        );
      }

      // Check 4c: Is this transactionId already used anywhere in the system?
      const duplicateTx = await tx.payment.findUnique({
        where: {
          transactionId: cleanTxId,
        },
      });

      if (duplicateTx) {
        throw new Error(
          "DUPLICATE_TX: এই ট্রানজেকশন আইডিটি (TxID) ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে সঠিক TxID দিন।"
        );
      }

      // Create new Payment record with PENDING status
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: book.price || amount,
          paymentMethod,
          transactionId: cleanTxId,
          senderNumber: cleanSenderNumber,
          status: "PENDING",
          adminNote: note ? `User Note: ${note.trim()}` : null,
        },
      });

      return payment;
    });

    return {
      success: true,
      message: "পেমেন্ট তথ্য সফলভাবে জমা দেওয়া হয়েছে!",
      data: {
        paymentId: result.id,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.startsWith("ALREADY_HAS_ACCESS:")) {
        return {
          success: false,
          error: error.message.replace("ALREADY_HAS_ACCESS: ", ""),
        };
      }
      if (error.message.startsWith("PENDING_EXISTS:")) {
        return {
          success: false,
          error: error.message.replace("PENDING_EXISTS: ", ""),
        };
      }
      if (error.message.startsWith("DUPLICATE_TX:")) {
        return {
          success: false,
          error: error.message.replace("DUPLICATE_TX: ", ""),
        };
      }
    }

    console.error("Payment submission error:", error);
    return {
      success: false,
      error: "পেমেন্ট তথ্য জমা নিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}
