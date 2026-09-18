import Link from "next/link";
import { UserCheck, Shield, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { SafeUser } from "@/types";

interface DashboardHeaderProps {
  user: SafeUser;
  hasAccess: boolean;
}

export function DashboardHeader({ user, hasAccess }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-border/60">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            স্বাগতম, {user.name}
          </h1>
          <Badge variant="outline" className="font-mono text-xs">
            @{user.username}
          </Badge>
          {user.role === "ADMIN" && (
            <Badge className="bg-purple-600 text-white hover:bg-purple-700">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
          {hasAccess ? (
            <Badge variant="success" className="gap-1">
              <UserCheck className="h-3 w-3" />
              এক্টিভ পাঠক (Active)
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1">
              পেমেন্ট প্রয়োজন
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          আপনার রিডিং ড্যাশবোর্ড থেকে বই পড়ুন, প্রগ্রেস দেখুন এবং বুকমার্ক ম্যানেজ করুন।
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <ThemeToggle />
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <Home className="h-4 w-4" />
            হোমপেজ
          </Button>
        </Link>
        {user.role === "ADMIN" && (
          <Link href="/admin">
            <Button variant="secondary" size="sm" className="gap-1.5 rounded-xl">
              <Shield className="h-4 w-4 text-purple-500" />
              এডমিন প্যানেল
            </Button>
          </Link>
        )}
        <UserNav />
      </div>
    </div>
  );
}
