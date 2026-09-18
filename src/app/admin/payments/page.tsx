import { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Prisma, PaymentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { PaymentsTable } from "@/components/admin/payments-table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পেমেন্ট ব্যবস্থাপনা (Payment Management)",
  description: "ইউজারদের জমা দেওয়া বিকাশ, নগদ ও রকেট পেমেন্ট পর্যালোচনা ও অনুমোদন",
};

interface AdminPaymentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const search = (params.search || "").trim();
  const statusFilter = (params.status || "ALL").toUpperCase();

  // Construct dynamic Prisma where clause
  const where: Prisma.PaymentWhereInput = {};

  if (["PENDING", "APPROVED", "REJECTED"].includes(statusFilter)) {
    where.status = statusFilter as PaymentStatus;
  }

  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: "insensitive" } },
      { senderNumber: { contains: search, mode: "insensitive" } },
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
  const [totalCount, payments, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "APPROVED" } }),
      prisma.payment.count({ where: { status: "REJECTED" } }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header and Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            পেমেন্ট পর্যালোচনা ও অনুমোদন (Payments)
          </h1>
          <p className="text-sm text-muted-foreground">
            ব্যবহারকারীদের জমা দেওয়া বিকাশ, নগদ ও রকেট পেমেন্ট ভেরিফাই করুন এবং বইয়ের এক্সেস প্রদান করুন।
          </p>
        </div>

        {/* Status Count Pills */}
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            পেন্ডিং: {pendingCount}
          </Badge>
          <Badge variant="success" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            অনুমোদিত: {approvedCount}
          </Badge>
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="h-3 w-3" />
            বাতিল: {rejectedCount}
          </Badge>
        </div>
      </div>

      {/* Main Paginated Payments Table */}
      <PaymentsTable
        payments={payments}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentStatus={statusFilter}
        currentSearch={search}
      />
    </div>
  );
}
