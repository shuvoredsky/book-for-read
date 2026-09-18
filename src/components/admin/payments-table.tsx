"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PaymentActionsDialog } from "@/components/admin/payment-actions-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PaymentItem {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  senderNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date;
  reviewedAt: Date | null;
  adminNote: string | null;
  user: {
    name: string;
    username: string;
    email: string;
  };
}

interface PaymentsTableProps {
  payments: PaymentItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentStatus: string;
  currentSearch: string;
}

export function PaymentsTable({
  payments,
  totalCount,
  currentPage,
  pageSize,
  currentStatus,
  currentSearch,
}: PaymentsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentItem | null>(null);
  const [dialogMode, setDialogMode] = React.useState<"approve" | "reject" | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const updateFilters = (newParams: { status?: string; search?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.status !== undefined) {
      if (newParams.status && newParams.status !== "ALL") {
        params.set("status", newParams.status);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
    }

    if (newParams.search !== undefined) {
      if (newParams.search.trim()) {
        params.set("search", newParams.search.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
    }

    if (newParams.page !== undefined) {
      params.set("page", newParams.page.toString());
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const openAction = (payment: PaymentItem, mode: "approve" | "reject") => {
    setSelectedPayment(payment);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "সব পেমেন্ট (All)", value: "ALL" },
            { label: "পেন্ডিং (Pending)", value: "PENDING" },
            { label: "অনুমোদিত (Approved)", value: "APPROVED" },
            { label: "বাতিল (Rejected)", value: "REJECTED" },
          ].map((tab) => {
            const isSelected =
              (currentStatus === "" && tab.value === "ALL") ||
              currentStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => updateFilters({ status: tab.value })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="TxID, ইউজারনেম, ইমেইল খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
            খুঁজুন
          </Button>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ব্যবহারকারী (User)</th>
                <th className="px-4 py-3.5">মেথড</th>
                <th className="px-4 py-3.5">ট্রানজেকশন আইডি (TxID)</th>
                <th className="px-4 py-3.5">প্রেরক নম্বর</th>
                <th className="px-4 py-3.5">পরিমাণ</th>
                <th className="px-4 py-3.5">সময়</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি</p>
                    <p className="text-xs mt-1">ফিল্টার বা সার্চ পরিবর্তন করে দেখতে পারেন।</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      {/* User column */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{p.user.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          @{p.user.username} • {p.user.email}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-medium text-[11px]">
                          {p.paymentMethod}
                        </Badge>
                      </td>

                      {/* TxID */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-primary tracking-wider">
                          {p.transactionId}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-foreground">{p.senderNumber}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-bold text-foreground">
                        ৳{p.amount}
                      </td>

                      {/* Submitted At */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.submittedAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {p.status === "PENDING" && (
                          <Badge variant="warning" className="gap-1 text-[11px]">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Pending
                          </Badge>
                        )}
                        {p.status === "APPROVED" && (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {p.status === "REJECTED" && (
                          <div className="space-y-0.5">
                            <Badge variant="destructive" className="gap-1 text-[11px]">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                            {p.adminNote && (
                              <p className="text-[10px] text-muted-foreground max-w-[120px] truncate" title={p.adminNote}>
                                {p.adminNote}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {p.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => openAction(p, "approve")}
                              className="h-8 px-2.5 text-xs gap-1 shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openAction(p, "reject")}
                              className="h-8 px-2.5 text-xs gap-1"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {p.reviewedAt ? formatDate(p.reviewedAt) : "Reviewed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
          <span className="text-muted-foreground">
            মোট <span className="font-semibold text-foreground">{totalCount}</span> টি রেকর্ডের মধ্যে{" "}
            <span className="font-semibold text-foreground">
              {payments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            দেখাচ্ছে
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="h-8 text-xs gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              আগের পৃষ্ঠা
            </Button>
            <span className="text-xs font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="h-8 text-xs gap-1"
            >
              পরের পৃষ্ঠা
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <PaymentActionsDialog
        payment={selectedPayment}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
