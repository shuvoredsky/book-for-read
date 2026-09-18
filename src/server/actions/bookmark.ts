"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import {
  createBookmarkSchema,
  deleteBookmarkSchema,
  type CreateBookmarkInput,
  type DeleteBookmarkInput,
} from "@/lib/validations/bookmark";
import type { ActionResponse, BookmarkItem } from "@/types";

const MAX_BOOKMARKS_PER_USER = 3;

/**
 * Retrieves all bookmarks belonging to the authenticated user for the given book.
 */
export async function getBookmarksAction(
  bookSlug: string
): Promise<ActionResponse<BookmarkItem[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস। অনুগ্রহ করে লগইন করুন।",
      };
    }

    const verification = await verifyUserBookAccess(user.id, bookSlug);
    if (!verification.authorized || !verification.book) {
      return {
        success: false,
        error: "বইটি পড়ার অনুমতি নেই।",
      };
    }

    const book = verification.book;

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        bookId: book.id,
      },
      orderBy: {
        pageNumber: "asc",
      },
      select: {
        id: true,
        pageNumber: true,
        label: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: bookmarks,
    };
  } catch (error: unknown) {
    console.error("[getBookmarksAction Error]:", error);
    return {
      success: false,
      error: "বুকমার্ক তালিকা লোড করা সম্ভব হয়নি।",
    };
  }
}

/**
 * Creates a new bookmark for the current user and page.
 * Server-side enforces:
 * 1. Active authentication & BookAccess
 * 2. Maximum limit of 3 bookmarks
 * 3. Duplicate page prevention
 */
export async function createBookmarkAction(
  rawInput: CreateBookmarkInput
): Promise<ActionResponse<BookmarkItem>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস।",
      };
    }

    const validation = createBookmarkSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "ভুল তথ্য প্রদান করা হয়েছে।",
      };
    }

    const { bookSlug, pageNumber, label } = validation.data;

    // Strict access check
    const verification = await verifyUserBookAccess(user.id, bookSlug);
    if (!verification.authorized || !verification.book) {
      return {
        success: false,
        error: "বুকমার্ক যুক্ত করার অনুমতি নেই।",
      };
    }

    const book = verification.book;

    // Page range check
    if (pageNumber > book.totalPages) {
      return {
        success: false,
        error: `পৃষ্ঠা নম্বর ${book.totalPages}-এর বেশি হতে পারে না।`,
      };
    }

    // 1. Enforce Server-side Bookmark Limit (Max 3)
    const currentCount = await prisma.bookmark.count({
      where: {
        userId: user.id,
        bookId: book.id,
      },
    });

    if (currentCount >= MAX_BOOKMARKS_PER_USER) {
      return {
        success: false,
        error: `আপনি সর্বোচ্চ ${MAX_BOOKMARKS_PER_USER}টি bookmark রাখতে পারবেন।`,
      };
    }

    // 2. Prevent Duplicates
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_bookId_pageNumber: {
          userId: user.id,
          bookId: book.id,
          pageNumber,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "এই page-টি ইতোমধ্যে bookmark করা আছে।",
      };
    }

    // 3. Create Bookmark
    const newBookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        bookId: book.id,
        pageNumber,
        label: label?.trim() || `পৃষ্ঠা ${pageNumber}`,
      },
      select: {
        id: true,
        pageNumber: true,
        label: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: `পৃষ্ঠা ${pageNumber} সফলভাবে বুকমার্ক করা হয়েছে।`,
      data: newBookmark,
    };
  } catch (error: unknown) {
    console.error("[createBookmarkAction Error]:", error);
    return {
      success: false,
      error: "বুকমার্ক সংরক্ষণ করতে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Deletes a bookmark belonging exclusively to the authenticated user.
 */
export async function deleteBookmarkAction(
  rawInput: DeleteBookmarkInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস।",
      };
    }

    const validation = deleteBookmarkSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "ভুল তথ্য প্রদান করা হয়েছে।",
      };
    }

    const { bookmarkId } = validation.data;

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: { id: true, userId: true },
    });

    if (!bookmark) {
      return {
        success: false,
        error: "বুকমার্কটি পাওয়া যায়নি।",
      };
    }

    if (bookmark.userId !== user.id) {
      return {
        success: false,
        error: "এই বুকমার্কটি মুছে ফেলার অনুমতি আপনার নেই।",
      };
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    return {
      success: true,
      message: "বুকমার্ক মুছে ফেলা হয়েছে।",
      data: { id: bookmarkId },
    };
  } catch (error: unknown) {
    console.error("[deleteBookmarkAction Error]:", error);
    return {
      success: false,
      error: "বুকমার্ক মুছে ফেলতে সমস্যা হয়েছে।",
    };
  }
}
