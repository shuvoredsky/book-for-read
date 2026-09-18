import { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বইয়ের এক্সেস নিয়ন্ত্রণ (Book Access)",
  description: "সক্রিয় পাঠক ও এক্সেস রিভোকেশন ম্যানেজমেন্ট",
};

export default function AdminAccessPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          বইয়ের এক্সেস নিয়ন্ত্রণ (Book Access)
        </h1>
        <p className="text-sm text-muted-foreground">
          সকল সক্রিয় পাঠকের পারমিশন তালিকা, এক্সেস প্রদান এবং রিভোক করার ব্যবস্থা
        </p>
      </div>

      <Card className="glass-card text-center p-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mx-auto">
          <KeyRound className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            Phase 7 Delivery
          </Badge>
          <CardTitle className="text-xl font-bold">
            বুক এক্সেস কন্ট্রোল মডিউল
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            এডমিন ম্যানুয়ালি যেকোনো ইউজারের বইয়ের এক্সেস গ্রান্ট বা রিভোক করতে পারবেন (Phase 7 এ বিস্তারিত চালু হবে)।
          </CardDescription>
        </div>
      </Card>
    </div>
  );
}
