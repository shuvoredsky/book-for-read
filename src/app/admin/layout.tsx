import { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "এডমিন কন্ট্রোল প্যানেল (Admin Portal)",
  description: "মেডিকেল বুক ডিজিটাল প্ল্যাটফর্ম এডমিন ড্যাশবোর্ড ও পেমেন্ট রিভিউ",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce Server-Side Admin Authorization across all /admin subroutes
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground">Medical Book Admin</span>
                <Badge className="bg-purple-600 text-white hover:bg-purple-700 text-[10px] h-4">
                  Super Admin
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Admin: {admin.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Admin Area with Sidebar */}
      <div className="flex-1 container mx-auto max-w-7xl flex flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
