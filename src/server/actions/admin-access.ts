"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const revokeSchema = z.object({
  userId: z.string().min(1, "ইউজার আইডি আবশ্যক"),
  bookId: z.string().optional(),
  reason: z.string().min(2, "বাতিল করার কারণ লিখুন (কমপক্ষে ২ অক্ষর)").max(300),
});

/**
 * Grant manual BookAccess to a user.
 * 1. Checks requireAdmin()
 * 2. Idempotently creates or reactivates BookAccess with status ACTIVE
 * 3. Creates AuditLog entry
 */
export async function grantAccessAction(
  userId: string,
  bookId?: string
): Promise<ActionResponse<{ accessId: string }>> {
  try {
    const admin = await requireAdmin();

    if (!userId) {
      return { success: false, error: "ইউজার আইডি আবশ্যক" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify target user exists
      const targetUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, username: true, email: true, status: true },
      });

      if (!targetUser) {
        throw new Error("USER_NOT_FOUND: ব্যবহারকারী পাওয়া যায়নি।");
      }

      // 2. Resolve book
      const book = bookId
        ? await tx.book.findUnique({ where: { id: bookId } })
        : await tx.book.findFirst({ where: { isActive: true } });

      if (!book) {
        throw new Error("BOOK_NOT_FOUND: সক্রিয় বই পাওয়া যায়নি।");
      }

      // 3. Check existing BookAccess
      const existing = await tx.bookAccess.findUnique({
        where: {
          userId_bookId: {
            userId: targetUser.id,
            bookId: book.id,
          },
        },
      });

      let accessRecord;

      if (existing) {
        if (existing.status === "ACTIVE") {
          // Idempotent: already active
          accessRecord = existing;
        } else {
          // Reactivate revoked access
          accessRecord = await tx.bookAccess.update({
            where: { id: existing.id },
            data: {
              status: "ACTIVE",
              grantedAt: new Date(),
              revokedAt: null,
            },
          });
        }
      } else {
        // Create brand new manual BookAccess record
        accessRecord = await tx.bookAccess.create({
          data: {
            userId: targetUser.id,
            bookId: book.id,
            status: "ACTIVE",
            grantedAt: new Date(),
          },
        });
      }

      // 4. Create AuditLog
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "ACCESS_GRANTED",
          target: `BookAccess:${targetUser.id}`,
          metadata: {
            userId: targetUser.id,
            username: targetUser.username,
            bookId: book.id,
            bookTitle: book.title,
            manualGrant: true,
          },
        },
      });

      return accessRecord;
    });

    revalidatePath("/admin/access");
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "বইয়ের এক্সেস সফলভাবে সক্রিয় করা হয়েছে।",
      data: { accessId: result.id },
    };
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.startsWith("USER_NOT_FOUND:") || error.message.startsWith("BOOK_NOT_FOUND:"))) {
      return {
        success: false,
        error: error.message.split(": ")[1] || error.message,
      };
    }
    console.error("Grant access error:", error);
    return {
      success: false,
      error: "এক্সেস প্রদান করতে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Revoke BookAccess for a user.
 * 1. Checks requireAdmin()
 * 2. Updates BookAccess -> REVOKED and sets revokedAt
 * 3. Creates AuditLog entry with reason
 */
export async function revokeAccessAction(
  userId: string,
  bookId?: string,
  reason: string = "Manual revocation by admin"
): Promise<ActionResponse<{ accessId: string }>> {
  try {
    const admin = await requireAdmin();

    const parsed = revokeSchema.safeParse({ userId, bookId, reason });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ তথ্য",
      };
    }

    const { userId: validUserId, reason: validReason } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve book
      const book = bookId
        ? await tx.book.findUnique({ where: { id: bookId } })
        : await tx.book.findFirst({ where: { isActive: true } });

      if (!book) {
        throw new Error("BOOK_NOT_FOUND: সক্রিয় বই পাওয়া যায়নি।");
      }

      // 2. Find target BookAccess
      const access = await tx.bookAccess.findUnique({
        where: {
          userId_bookId: {
            userId: validUserId,
            bookId: book.id,
          },
        },
        include: {
          user: { select: { name: true, username: true, email: true } },
        },
      });

      if (!access) {
        throw new Error("NOT_FOUND: ব্যবহারকারীর কোনো এক্সেস রেকর্ড পাওয়া যায়নি।");
      }

      if (access.status === "REVOKED") {
        throw new Error("ALREADY_REVOKED: ব্যবহারকারীর এক্সেস ইতিমধ্যে বাতিল রয়েছে।");
      }

      // 3. Update BookAccess to REVOKED
      const updatedAccess = await tx.bookAccess.update({
        where: { id: access.id },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });

      // 4. Create AuditLog entry
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "ACCESS_REVOKED",
          target: `BookAccess:${access.userId}`,
          metadata: {
            userId: access.userId,
            username: access.user.username,
            bookId: book.id,
            reason: validReason.trim(),
          },
        },
      });

      return updatedAccess;
    });

    revalidatePath("/admin/access");
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "বইয়ের এক্সেস সফলভাবে বাতিল (Revoked) করা হয়েছে।",
      data: { accessId: result.id },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message.startsWith("NOT_FOUND:") ||
        error.message.startsWith("ALREADY_REVOKED:") ||
        error.message.startsWith("BOOK_NOT_FOUND:")
      ) {
        return {
          success: false,
          error: error.message.split(": ")[1] || error.message,
        };
      }
    }
    console.error("Revoke access error:", error);
    return {
      success: false,
      error: "এক্সেস বাতিল করতে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Grant access by email or username search helper
 */
export async function grantAccessByIdentifierAction(
  identifier: string
): Promise<ActionResponse<{ accessId: string }>> {
  try {
    await requireAdmin();

    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: "ইমেইল অথবা ইউজারনেম দিন" };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: clean }, { username: clean }],
      },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        error: "এই ইমেইল বা ইউজারনেম দিয়ে কোনো ব্যবহারকারী পাওয়া যায়নি।",
      };
    }

    return grantAccessAction(user.id);
  } catch (error) {
    console.error("Grant by identifier error:", error);
    return { success: false, error: "সার্ভারে সমস্যা হয়েছে।" };
  }
}
