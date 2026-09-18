import prisma from "@/lib/prisma";
import type { Book } from "@prisma/client";

export interface AccessVerificationResult {
  authorized: boolean;
  book: Book | null;
  reason?: "USER_INACTIVE" | "BOOK_INACTIVE" | "NO_ACCESS" | "ACCESS_REVOKED" | "BOOK_NOT_FOUND";
}

/**
 * Strictly verifies whether a user is authorized to access a given book.
 * Rules:
 * 1. User must exist and status === "ACTIVE".
 * 2. Book must exist and isActive === true.
 * 3. BookAccess must exist AND status === "ACTIVE" specifically.
 *    (Even if Payment was previously APPROVED, a REVOKED access record immediately denies entry).
 */
export async function verifyUserBookAccess(
  userId: string,
  bookSlug: string
): Promise<AccessVerificationResult> {
  if (!userId || !bookSlug) {
    return { authorized: false, book: null, reason: "NO_ACCESS" };
  }

  // 1. Fetch book
  const book = await prisma.book.findUnique({
    where: { slug: bookSlug },
  });

  if (!book) {
    return { authorized: false, book: null, reason: "BOOK_NOT_FOUND" };
  }

  if (!book.isActive) {
    return { authorized: false, book, reason: "BOOK_INACTIVE" };
  }

  // 2. Fetch user status and book access in parallel
  const [user, bookAccess] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    }),
    prisma.bookAccess.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
      select: {
        id: true,
        status: true,
      },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return { authorized: false, book, reason: "USER_INACTIVE" };
  }

  if (!bookAccess) {
    return { authorized: false, book, reason: "NO_ACCESS" };
  }

  // Strict check: status must be ACTIVE (REVOKED immediately blocks access)
  if (bookAccess.status !== "ACTIVE") {
    return { authorized: false, book, reason: "ACCESS_REVOKED" };
  }

  return {
    authorized: true,
    book,
  };
}
