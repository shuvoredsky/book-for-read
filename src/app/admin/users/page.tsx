import { Metadata } from "next";
import { Users } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ব্যবহারকারী ব্যবস্থাপনা (User Management)",
  description: "ইউজারদের তালিকা, ফিল্টারিং ও একাউন্ট নিয়ন্ত্রণ",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          ব্যবহারকারী ব্যবস্থাপনা (Users)
        </h1>
        <p className="text-sm text-muted-foreground">
          নিবন্ধিত ব্যবহারকারীদের সার্চ, ফিল্টার, একাউন্ট সাসপেনশন ও হিস্ট্রি ট্র্যাকিং
        </p>
      </div>

      <Card className="glass-card text-center p-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
          <Users className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            Phase 7 Architecture
          </Badge>
          <CardTitle className="text-xl font-bold">
            ইউজার ম্যানেজমেন্ট মডিউল
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            এই মডিউলটি পরবর্তী ফেজে সম্পূর্ণ সার্চ, ফিল্টার, সাসপেনশন ও পারমিশন কন্ট্রোল সহ চালু হবে।
          </CardDescription>
        </div>
      </Card>
    </div>
  );
}
