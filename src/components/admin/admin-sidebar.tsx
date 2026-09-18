"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  KeyRound,
  BookOpen,
  Activity,
  History,
  Settings,
  Menu,
  X,
  ShieldAlert,
  Home,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const adminNavItems = [
  {
    title: "ড্যাশবোর্ড (Overview)",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "পেমেন্টসমূহ (Payments)",
    href: "/admin/payments",
    icon: CreditCard,
    badge: "Active",
  },
  {
    title: "ব্যবহারকারী (Users)",
    href: "/admin/users",
    icon: Users,
    badge: "Phase 7+",
  },
  {
    title: "বইয়ের এক্সেস (Book Access)",
    href: "/admin/access",
    icon: KeyRound,
    badge: "Phase 7+",
  },
  {
    title: "বই ব্যবস্থাপনা (Book)",
    href: "/admin/book",
    icon: BookOpen,
    badge: "Phase 8+",
  },
  {
    title: "রিডিং অ্যাক্টিভিটি (Activity)",
    href: "/admin/reading-activity",
    icon: Activity,
    badge: "Phase 12+",
  },
  {
    title: "অডিট লগস (Audit Logs)",
    href: "/admin/audit-logs",
    icon: History,
    badge: "Phase 6+",
  },
  {
    title: "সেটিংস (Settings)",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">এডমিন প্যানেল</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Admin Sidebar"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur-xl lg:min-h-[calc(100vh-4rem)] p-4 space-y-6 transition-all`}
      >
        {/* Admin Brand */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-2">
          <div className="h-9 w-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Admin Portal</h2>
            <p className="text-[11px] text-muted-foreground">{siteConfig.name}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badge === "Active" ? "secondary" : "outline"}
                    className="text-[10px] px-1.5 py-0 h-4 scale-90"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Return to User Area */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <Link href="/dashboard" className="block">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              ইউজার ড্যাশবোর্ড
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
              <Home className="h-3.5 w-3.5" />
              মূল হোমপেজ
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
