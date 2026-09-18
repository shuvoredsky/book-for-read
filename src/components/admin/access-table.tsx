"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { AccessActionsDialog } from "@/components/admin/access-actions-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AccessItem {
  id: string;
  userId: string;
  bookId: string;
  status: "ACTIVE" | "REVOKED";
  grantedAt: Date;
  revokedAt: Date | null;
  book: {
    title: string;
    slug: string;
  };
  user: {
    name: string;
    username: string;
    email: string;
  };
}

interface AccessTableProps {
  accessList: AccessItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentStatus: string;
  currentSearch: string;
}

export function AccessTable({
  accessList,
  totalCount,
  currentPage,
  pageSize,
  currentStatus,
  currentSearch,
}: AccessTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);
  const [selectedAccess, setSelectedAccess] = React.useState<AccessItem | null>(null);
  const [dialogMode, setDialogMode] = React.useState<"grant" | "revoke" | "manual" | null>(null);
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

  const openAction = (access: AccessItem, mode: "grant" | "revoke") => {
    setSelectedAccess(access);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const openManualGrant = () => {
    setSelectedAccess(null);
    setDialogMode("manual");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "সকল এক্সেস (All)", value: "ALL" },
            { label: "সক্রিয় (Active)", value: "ACTIVE" },
            { label: "বাতিলকৃত (Revoked)", value: "REVOKED" },
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

        {/* Right: Search & Manual Grant Button */}
        <div className="flex items-center gap-2 max-w-md w-full justify-end">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ইউজারনেম বা ইমেইল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
              খুঁজুন
            </Button>
          </form>

          <Button
            variant="gradient"
            size="sm"
            onClick={openManualGrant}
            className="h-9 text-xs gap-1.5 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            ম্যানুয়াল এক্সেস
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ব্যবহারকারী (User)</th>
                <th className="px-4 py-3.5">বইয়ের নাম (Book)</th>
                <th className="px-4 py-3.5">এক্সেস স্ট্যাটাস</th>
                <th className="px-4 py-3.5">এক্সেস শুরুর তারিখ</th>
                <th className="px-4 py-3.5">বাতিলকরণের তারিখ</th>
                <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {accessList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">কোনো এক্সেস রেকর্ড পাওয়া যায়নি</p>
                    <p className="text-xs mt-1">ব্যবহারকারীদের পেমেন্ট অনুমোদিত হলে বা ম্যানুয়ালি এক্সেস দিলে এখানে প্রদর্শিত হবে।</p>
                  </td>
                </tr>
              ) : (
                accessList.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{item.user.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        @{item.user.username} • {item.user.email}
                      </div>
                    </td>

                    {/* Book */}
                    <td className="px-4 py-3 font-medium text-foreground">
                      {item.book.title}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {item.status === "ACTIVE" ? (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <ShieldCheck className="h-3 w-3" />
                          সক্রিয় (Active)
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-[11px]">
                          <ShieldAlert className="h-3 w-3" />
                          বাতিল (Revoked)
                        </Badge>
                      )}
                    </td>

                    {/* Granted At */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(item.grantedAt)}
                    </td>

                    {/* Revoked At */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.revokedAt ? formatDate(item.revokedAt) : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openAction(item, "revoke")}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => openAction(item, "grant")}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Re-Grant
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
          <span className="text-muted-foreground">
            মোট <span className="font-semibold text-foreground">{totalCount}</span> টি রেকর্ডের মধ্যে{" "}
            <span className="font-semibold text-foreground">
              {accessList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
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

      {/* Access Dialogs */}
      <AccessActionsDialog
        access={selectedAccess}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
