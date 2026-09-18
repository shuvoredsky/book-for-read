import { Metadata } from "next";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { Prisma, AccessStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AccessTable } from "@/components/admin/access-table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বইয়ের এক্সেস নিয়ন্ত্রণ (Book Access Control)",
  description: "ব্যবহারকারীদের সক্রিয় ও বাতিলকৃত বুক এক্সেস ম্যানেজমেন্ট",
};

interface AdminAccessPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AdminAccessPage({
  searchParams,
}: AdminAccessPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const search = (params.search || "").trim();
  const statusFilter = (params.status || "ALL").toUpperCase();

  // Construct dynamic Prisma where clause
  const where: Prisma.BookAccessWhereInput = {};

  if (["ACTIVE", "REVOKED"].includes(statusFilter)) {
    where.status = statusFilter as AccessStatus;
  }

  if (search) {
    where.OR = [
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          username: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          email: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  // Query counts and paginated dataset in parallel
  const [totalCount, accessList, activeCount, revokedCount] = await Promise.all([
    prisma.bookAccess.count({ where }),
    prisma.bookAccess.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { grantedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            email: true,
          },
        },
        book: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }),
    prisma.bookAccess.count({ where: { status: "ACTIVE" } }),
    prisma.bookAccess.count({ where: { status: "REVOKED" } }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            বইয়ের এক্সেস নিয়ন্ত্রণ (Book Access)
          </h1>
          <p className="text-sm text-muted-foreground">
            ব্যবহারকারীদের রিডার এক্সেস স্ট্যাটাস পর্যালোচনা, ম্যানুয়াল এক্সেস প্রদান ও প্রয়োজনে এক্সেস বাতিল (Revoke) করুন।
          </p>
        </div>

        {/* Status Count Pills */}
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" />
            সক্রিয় (Active): {activeCount}
          </Badge>
          <Badge variant="destructive" className="gap-1 text-xs">
            <ShieldAlert className="h-3 w-3" />
            বাতিল (Revoked): {revokedCount}
          </Badge>
        </div>
      </div>

      {/* Main Paginated Table */}
      <AccessTable
        accessList={accessList}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentStatus={statusFilter}
        currentSearch={search}
      />
    </div>
  );
}
