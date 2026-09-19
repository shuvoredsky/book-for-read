import { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { getAdminUsersAction } from "@/server/actions/admin-users";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ব্যবহারকারী ব্যবস্থাপনা (User Management)",
  description: "নিবন্ধিত ব্যবহারকারীদের তালিকা, স্ট্যাটাস, বুক এক্সেস ও ব্যান/আনব্যান নিয়ন্ত্রণ",
};

interface AdminUsersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    role?: string;
    search?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const admin = await requireAdmin();
  const search = await searchParams;

  const page = search.page ? parseInt(search.page, 10) : 1;
  const status = search.status || "ALL";
  const role = search.role || "ALL";
  const searchKeyword = search.search || "";

  const { users, totalCount, pageSize } = await getAdminUsersAction({
    page,
    status,
    role,
    search: searchKeyword,
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          ব্যবহারকারী ব্যবস্থাপনা (Users)
        </h1>
        <p className="text-sm text-muted-foreground">
          নিবন্ধিত ব্যবহারকারীদের সার্চ, ফিল্টার, একাউন্ট সাসপেনশন (Ban/Unban) ও বুক এক্সেস নিয়ন্ত্রণ
        </p>
      </div>

      <UsersTable
        users={users}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentStatus={status}
        currentRole={role}
        currentSearch={searchKeyword}
        currentAdminId={admin.id}
      />
    </div>
  );
}
