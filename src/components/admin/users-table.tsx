"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Ban,
  UserCheck,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { UserActionsDialog } from "@/components/admin/user-actions-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { grantAccessAction, revokeAccessAction } from "@/server/actions/admin-access";
import type { AdminUserListItem } from "@/server/actions/admin-users";

interface UsersTableProps {
  users: AdminUserListItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentStatus: string;
  currentRole: string;
  currentSearch: string;
  currentAdminId: string;
}

export function UsersTable({
  users,
  totalCount,
  currentPage,
  pageSize,
  currentStatus,
  currentRole,
  currentSearch,
  currentAdminId,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);
  const [selectedUser, setSelectedUser] = React.useState<AdminUserListItem | null>(null);
  const [dialogMode, setDialogMode] = React.useState<"ban" | "unban" | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const updateFilters = (newParams: {
    status?: string;
    role?: string;
    search?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.status !== undefined) {
      if (newParams.status && newParams.status !== "ALL") {
        params.set("status", newParams.status);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
    }

    if (newParams.role !== undefined) {
      if (newParams.role && newParams.role !== "ALL") {
        params.set("role", newParams.role);
      } else {
        params.delete("role");
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

  const openAction = (user: AdminUserListItem, mode: "ban" | "unban") => {
    setSelectedUser(user);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  // Direct BookAccess toggle (Activate / Deactivate)
  const handleToggleAccess = async (user: AdminUserListItem) => {
    setActionLoadingId(user.id);
    try {
      if (user.bookAccessStatus === "ACTIVE") {
        // Deactivate / Revoke access
        const res = await revokeAccessAction(user.id, undefined, "Manual toggle by admin");
        if (res.success) {
          toast.success(`@${user.username} এর বইয়ের এক্সেস বন্ধ (Revoked) করা হয়েছে`);
          router.refresh();
        } else {
          toast.error(res.error || "এক্সেস বন্ধ করতে সমস্যা হয়েছে");
        }
      } else {
        // Activate / Grant access
        const res = await grantAccessAction(user.id);
        if (res.success) {
          toast.success(`@${user.username} এর জন্য বইয়ের এক্সেস চালু (Active) করা হয়েছে`);
          router.refresh();
        } else {
          toast.error(res.error || "এক্সেস দিতে সমস্যা হয়েছে");
        }
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Status and Role Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center gap-1">
            {[
              { label: "সকল স্ট্যাটাস", value: "ALL" },
              { label: "সক্রিয় (Active)", value: "ACTIVE" },
              { label: "ব্যান / সাসপেন্ডেড", value: "SUSPENDED" },
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

          {/* Role filter pills */}
          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
            {[
              { label: "সকল রোল", value: "ALL" },
              { label: "USER", value: "USER" },
              { label: "ADMIN", value: "ADMIN" },
            ].map((tab) => {
              const isSelected =
                (currentRole === "" && tab.value === "ALL") ||
                currentRole === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => updateFilters({ role: tab.value })}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-secondary text-secondary-foreground font-bold shadow-sm"
                      : "bg-muted/30 hover:bg-muted text-muted-foreground border border-border/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="max-w-xs w-full">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম, ইমেইল বা ইউজারনেম..."
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
      </div>

      {/* Main Users Table */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ব্যবহারকারী (User)</th>
                <th className="px-4 py-3.5">রোল (Role)</th>
                <th className="px-4 py-3.5">অ্যাকাউন্ট স্ট্যাটাস</th>
                <th className="px-4 py-3.5">বুক এক্সেস অন/অফ (Book Access)</th>
                <th className="px-4 py-3.5">পড়ার অগ্রগতি (Progress)</th>
                <th className="px-4 py-3.5">নিবন্ধনের তারিখ</th>
                <th className="px-4 py-3.5 text-right">ইউজার অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                    <p className="text-xs mt-1">অনুসন্ধানের ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isSelf = item.id === currentAdminId;
                  const isAdmin = item.role === "ADMIN";
                  const isLoadingThis = actionLoadingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-foreground">{item.name}</div>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px] h-4 border-purple-500/30 text-purple-500">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          @{item.username} • {item.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <Badge className="bg-purple-600 text-white text-[10px] gap-1 h-5">
                            <Shield className="h-3 w-3" />
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 h-5 text-muted-foreground">
                            <UserIcon className="h-3 w-3" />
                            USER
                          </Badge>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3">
                        {item.status === "ACTIVE" ? (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <UserCheck className="h-3 w-3" />
                            সক্রিয় (Active)
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-[11px]">
                            <Ban className="h-3 w-3" />
                            সাসপেন্ড / ব্যান
                          </Badge>
                        )}
                      </td>

                      {/* Book Access Control (ON/OFF) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.bookAccessStatus === "ACTIVE" ? (
                            <>
                              <Badge variant="success" className="gap-1 text-[11px]">
                                <ShieldCheck className="h-3 w-3" />
                                Active (ON)
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleAccess(item)}
                                disabled={isLoadingThis}
                                className="h-7 px-2 text-[11px] gap-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                                title="এক্সেস বন্ধ করুন"
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                বন্ধ করুন (Turn OFF)
                              </Button>
                            </>
                          ) : item.bookAccessStatus === "REVOKED" ? (
                            <>
                              <Badge variant="destructive" className="gap-1 text-[11px]">
                                <ShieldAlert className="h-3 w-3" />
                                Revoked (OFF)
                              </Badge>
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={() => handleToggleAccess(item)}
                                disabled={isLoadingThis}
                                className="h-7 px-2 text-[11px] gap-1"
                                title="এক্সেস চালু করুন"
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                চালু করুন (Turn ON)
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                No Access (OFF)
                              </Badge>
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={() => handleToggleAccess(item)}
                                disabled={isLoadingThis}
                                className="h-7 px-2 text-[11px] gap-1"
                                title="এক্সেস দিন"
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                এক্সেস দিন (Turn ON)
                              </Button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Reading Progress */}
                      <td className="px-4 py-3">
                        {item.readingProgress ? (
                          <div className="space-y-1 min-w-[130px] max-w-[170px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-foreground">
                                পৃষ্ঠা {item.readingProgress.currentPage} / {item.readingProgress.totalPages}
                              </span>
                              <span className="text-primary font-mono font-bold">
                                {item.readingProgress.progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, Math.max(0, item.readingProgress.progressPercentage))}%`,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                              পঠিত: {formatDate(item.readingProgress.lastReadAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            পড়া শুরু হয়নি
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <span className="text-[11px] text-muted-foreground italic px-2">
                            Protected Admin
                          </span>
                        ) : item.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openAction(item, "ban")}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Ban User
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => openAction(item, "unban")}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Unban
                          </Button>
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
            মোট <span className="font-semibold text-foreground">{totalCount}</span> জন ব্যবহারকারীর মধ্যে{" "}
            <span className="font-semibold text-foreground">
              {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            জন দেখাচ্ছে
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

      {/* Action Dialog */}
      <UserActionsDialog
        user={selectedUser}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
