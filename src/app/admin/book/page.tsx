import { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বই ব্যবস্থাপনা (Book Management)",
  description: "বইয়ের বিবরণ, মূল্য এবং R2 অবজেক্ট কি ম্যানেজমেন্ট",
};

export default function AdminBookPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          বই ব্যবস্থাপনা (Book Settings)
        </h1>
        <p className="text-sm text-muted-foreground">
          মেডিকেল বইয়ের তথ্য, মূল্য (৳১০০), সূচিপত্র ও ক্লাউডফ্লেয়ার R2 অবজেক্ট কি নিয়ন্ত্রণ
        </p>
      </div>

      <Card className="glass-card text-center p-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            Phase 8 Integration
          </Badge>
          <CardTitle className="text-xl font-bold">
            বুক সেটিংস ও R2 স্টোরেজ কনফিগারেশন
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            ক্লাউডফ্লেয়ার R2 সিকিউর আপলোড ও TOC ম্যানেজমেন্ট মডিউল Phase 8 এ যুক্ত হবে।
          </CardDescription>
        </div>
      </Card>
    </div>
  );
}
