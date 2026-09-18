import prisma from "@/lib/prisma";
import type { SafeUser } from "@/types";

export interface DashboardData {
  user: SafeUser;
  book: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    totalPages: number;
    isActive: boolean;
  } | null;
  bookAccess: {
    id: string;
    status: "ACTIVE" | "REVOKED";
    grantedAt: Date;
  } | null;
  latestPayment: {
    id: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    senderNumber: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    submittedAt: Date;
    reviewedAt: Date | null;
    adminNote: string | null;
  } | null;
  readingProgress: {
    id: string;
    currentPage: number;
    totalPages: number;
    progressPercentage: number;
    lastReadAt: Date;
  } | null;
  bookmarks: Array<{
    id: string;
    pageNumber: number;
    label: string | null;
    createdAt: Date;
  }>;
}

export async function getUserDashboardData(user: SafeUser): Promise<DashboardData> {
  // 1. Fetch the default active Medical Book
  const book = await prisma.book.findFirst({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      totalPages: true,
      isActive: true,
    },
  });

  if (!book) {
    return {
      user,
      book: null,
      bookAccess: null,
      latestPayment: null,
      readingProgress: null,
      bookmarks: [],
    };
  }

  // 2. Query relations in parallel for optimal performance
  const [bookAccess, latestPayment, readingProgress, bookmarks] = await Promise.all([
    prisma.bookAccess.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      select: {
        id: true,
        status: true,
        grantedAt: true,
      },
    }),
    prisma.payment.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        submittedAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        transactionId: true,
        senderNumber: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        adminNote: true,
      },
    }),
    prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      select: {
        id: true,
        currentPage: true,
        totalPages: true,
        progressPercentage: true,
        lastReadAt: true,
      },
    }),
    prisma.bookmark.findMany({
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
    }),
  ]);

  return {
    user,
    book,
    bookAccess,
    latestPayment,
    readingProgress,
    bookmarks,
  };
}
