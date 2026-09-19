"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { requireAdmin } from "@/server/auth";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const banUserSchema = z.object({
  userId: z.string().min(1, "ইউজার আইডি আবশ্যক"),
  reason: z.string().max(300).optional(),
});

export interface AdminUserListItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  bookAccessStatus: "ACTIVE" | "REVOKED" | "NONE";
  bookTitle?: string;
  paymentsCount: number;
  readingProgress?: {
    currentPage: number;
    totalPages: number;
    progressPercentage: number;
    lastReadAt: Date;
  } | null;
}

/**
 * Fetch paginated list of users for the admin dashboard.
 */
export async function getAdminUsersAction(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  role?: string;
}): Promise<{
  users: AdminUserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  await requireAdmin();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.UserWhereInput = {};

  if (params.search && params.search.trim()) {
    const search = params.search.trim();
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL" && (params.status === "ACTIVE" || params.status === "SUSPENDED")) {
    whereClause.status = params.status as UserStatus;
  }

  if (params.role && params.role !== "ALL" && (params.role === "USER" || params.role === "ADMIN")) {
    whereClause.role = params.role as Role;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        bookAccesses: {
          include: {
            book: {
              select: { title: true },
            },
          },
        },
        readingProgresses: {
          orderBy: { lastReadAt: "desc" },
          take: 1,
        },
        payments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const formattedUsers: AdminUserListItem[] = users.map((u) => {
    // Determine user's primary book access status
    const activeAccess = u.bookAccesses.find((a) => a.status === "ACTIVE");
    const revokedAccess = u.bookAccesses.find((a) => a.status === "REVOKED");

    let bookAccessStatus: "ACTIVE" | "REVOKED" | "NONE" = "NONE";
    let bookTitle: string | undefined = undefined;

    if (activeAccess) {
      bookAccessStatus = "ACTIVE";
      bookTitle = activeAccess.book?.title;
    } else if (revokedAccess) {
      bookAccessStatus = "REVOKED";
      bookTitle = revokedAccess.book?.title;
    }

    const progress = u.readingProgresses?.[0] || null;
    const readingProgress = progress
      ? {
          currentPage: progress.currentPage,
          totalPages: progress.totalPages,
          progressPercentage: progress.progressPercentage,
          lastReadAt: progress.lastReadAt,
        }
      : null;

    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as "USER" | "ADMIN",
      status: u.status as "ACTIVE" | "SUSPENDED",
      createdAt: u.createdAt,
      bookAccessStatus,
      bookTitle,
      paymentsCount: u.payments.length,
      readingProgress,
    };
  });

  return {
    users: formattedUsers,
    totalCount,
    page,
    pageSize,
  };
}

/**
 * Ban / Suspend a User.
 * Rules:
 * 1. Admin only.
 * 2. Cannot ban self.
 * 3. Cannot ban another ADMIN.
 * 4. Preserves BookAccess and Payment history.
 * 5. Creates AuditLog entry.
 */
export async function banUserAction(
  userId: string,
  reason: string = "Administrative suspension"
): Promise<ActionResponse<{ userId: string }>> {
  try {
    const admin = await requireAdmin();

    const parsed = banUserSchema.safeParse({ userId, reason });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ তথ্য প্রদান করা হয়েছে।",
      };
    }

    const { userId: targetUserId, reason: banReason } = parsed.data;

    // Self-ban protection
    if (targetUserId === admin.id) {
      return {
        success: false,
        error: "আপনি নিজেকে সাসপেন্ড / ব্যান করতে পারবেন না।",
      };
    }

    // Target user check
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, username: true, email: true, role: true, status: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "ব্যবহারকারী পাওয়া যায়নি।",
      };
    }

    if (targetUser.role === "ADMIN") {
      return {
        success: false,
        error: "এডমিনিস্ট্রেটর অ্যাকাউন্ট ব্যান করা সম্ভব নয়।",
      };
    }

    if (targetUser.status === "SUSPENDED") {
      return {
        success: false,
        error: "ব্যবহারকারী ইতিমধ্যে সাসপেন্ড অবস্থায় রয়েছে।",
      };
    }

    // Execute ban
    await prisma.$transaction(async (tx) => {
      // 1. Update user status to SUSPENDED
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: "SUSPENDED" },
      });

      // 2. Terminate active sessions in sessions table
      await tx.session.deleteMany({
        where: { userId: targetUserId },
      });

      // 3. Create AuditLog entry
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "USER_SUSPENDED",
          target: `User:${targetUserId}`,
          metadata: {
            userId: targetUserId,
            username: targetUser.username,
            email: targetUser.email,
            reason: banReason?.trim() || "Admin action",
          },
        },
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/access");
    revalidatePath("/admin");

    return {
      success: true,
      message: `ব্যবহারকারী @${targetUser.username} কে সফলভাবে সাসপেন্ড / ব্যান করা হয়েছে।`,
      data: { userId: targetUserId },
    };
  } catch (error: unknown) {
    console.error("Ban user error:", error);
    return {
      success: false,
      error: "ব্যবহারকারীকে ব্যান করতে সার্ভারে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Unban / Reactivate a User.
 * Rules:
 * 1. Admin only.
 * 2. Restores user status to ACTIVE.
 * 3. Restores access according to their existing BookAccess record.
 * 4. Creates AuditLog entry.
 */
export async function unbanUserAction(
  userId: string
): Promise<ActionResponse<{ userId: string }>> {
  try {
    const admin = await requireAdmin();

    if (!userId) {
      return { success: false, error: "ইউজার আইডি আবশ্যক" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, status: true },
    });

    if (!targetUser) {
      return { success: false, error: "ব্যবহারকারী পাওয়া যায়নি।" };
    }

    if (targetUser.status === "ACTIVE") {
      return { success: false, error: "ব্যবহারকারী ইতিমধ্যে সক্রিয় (ACTIVE) রয়েছে।" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user status to ACTIVE
      await tx.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      });

      // 2. Create AuditLog entry
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "USER_RESTORED",
          target: `User:${userId}`,
          metadata: {
            userId: targetUser.id,
            username: targetUser.username,
            email: targetUser.email,
            restoredBy: admin.email,
          },
        },
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/access");
    revalidatePath("/admin");

    return {
      success: true,
      message: `ব্যবহারকারী @${targetUser.username} এর অ্যাকাউন্ট সফলভাবে আনব্যান / সক্রিয় করা হয়েছে।`,
      data: { userId },
    };
  } catch (error: unknown) {
    console.error("Unban user error:", error);
    return {
      success: false,
      error: "ব্যবহারকারীকে আনব্যান করতে সার্ভারে সমস্যা হয়েছে।",
    };
  }
}
