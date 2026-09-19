"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import { saveProgressSchema, type SaveProgressInput } from "@/lib/validations/progress";
import type { ActionResponse, ReadingProgressData } from "@/types";

/**
 * Retrieves the authenticated user's reading progress for the specified book.
 * If no progress record exists yet, defaults to page 1.
 */
export async function getReadingProgressAction(
  bookSlug: string
): Promise<ActionResponse<ReadingProgressData>> {
  try {
    const cleanSlug = typeof bookSlug === "string" ? bookSlug.trim() : "";
    if (!cleanSlug || cleanSlug.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(cleanSlug)) {
      return {
        success: false,
        error: "অবৈধ বইয়ের তথ্য প্রদান করা হয়েছে।",
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস। অনুগ্রহ করে লগইন করুন।",
      };
    }

    const verification = await verifyUserBookAccess(user.id, cleanSlug);
    if (!verification.authorized || !verification.book) {
      return {
        success: false,
        error: "বইটি পড়ার অনুমতি নেই।",
      };
    }

    const book = verification.book;

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      select: {
        currentPage: true,
        totalPages: true,
        progressPercentage: true,
        lastReadAt: true,
      },
    });

    if (!progress) {
      return {
        success: true,
        data: {
          currentPage: 1,
          totalPages: book.totalPages || 384,
          progressPercentage: 0,
          lastReadAt: new Date(),
        },
      };
    }

    return {
      success: true,
      data: {
        currentPage: progress.currentPage,
        totalPages: progress.totalPages,
        progressPercentage: progress.progressPercentage,
        lastReadAt: progress.lastReadAt,
      },
    };
  } catch (error: unknown) {
    console.error("[getReadingProgressAction Error]:", error);
    return {
      success: false,
      error: "রিডিং প্রগ্রেস লোড করা সম্ভব হয়নি।",
    };
  }
}

/**
 * Saves or updates the authenticated user's reading progress.
 * Strictly verifies authentication, active account, and BookAccess.
 */
export async function saveReadingProgressAction(
  rawInput: SaveProgressInput
): Promise<ActionResponse<ReadingProgressData>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস।",
      };
    }

    const validation = saveProgressSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "ভুল তথ্য প্রদান করা হয়েছে।",
      };
    }

    const { bookSlug, currentPage, totalPages } = validation.data;

    // Strict access check
    const verification = await verifyUserBookAccess(user.id, bookSlug);
    if (!verification.authorized || !verification.book) {
      return {
        success: false,
        error: "রিডিং প্রগ্রেস সংরক্ষণের অনুমতি নেই।",
      };
    }

    const book = verification.book;

    // Validate page range
    if (currentPage > totalPages) {
      return {
        success: false,
        error: `পৃষ্ঠা নম্বর ${totalPages}-এর বেশি হতে পারে না।`,
      };
    }

    // Calculate progress percentage (0 - 100%)
    const progressPercentage = Math.min(
      100,
      Math.max(0, +((currentPage / totalPages) * 100).toFixed(2))
    );

    const now = new Date();

    const saved = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      update: {
        currentPage,
        totalPages,
        progressPercentage,
        lastReadAt: now,
      },
      create: {
        userId: user.id,
        bookId: book.id,
        currentPage,
        totalPages,
        progressPercentage,
        lastReadAt: now,
      },
      select: {
        currentPage: true,
        totalPages: true,
        progressPercentage: true,
        lastReadAt: true,
      },
    });

    return {
      success: true,
      data: saved,
    };
  } catch (error: unknown) {
    console.error("[saveReadingProgressAction Error]:", error);
    return {
      success: false,
      error: "প্রগ্রেস সংরক্ষণ করতে সমস্যা হয়েছে।",
    };
  }
}
