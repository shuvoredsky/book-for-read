import { Metadata } from "next";
import { MessageSquare, DollarSign, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সিস্টেম সেটিংস (Settings)",
  description: "প্ল্যাটফর্ম কনফিগারেশন ও সাপোর্ট চ্যানেল",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          প্ল্যাটফর্ম সেটিংস (System Settings)
        </h1>
        <p className="text-sm text-muted-foreground">
          বইয়ের তথ্য, মূল্য ও সাপোর্ট চ্যানেলের বর্তমান অবস্থা
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              বইয়ের মূল্য ও তথ্য
            </CardTitle>
            <CardDescription>ডিজিটাল বই বিক্রয় কনফিগারেশন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">নির্ধারিত মূল্য:</span>
              <span className="font-bold text-foreground">৳{siteConfig.book.price} BDT</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">বইয়ের স্লাগ (Slug):</span>
              <span className="font-mono text-primary">{siteConfig.book.slug}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">B2 অবজেক্ট কি:</span>
              <span className="font-mono text-muted-foreground">{siteConfig.book.r2ObjectKey}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              সাপোর্ট ও যোগাযোগ চ্যানেল
            </CardTitle>
            <CardDescription>গ্রাহক যোগাযোগ ও অ্যাক্টিভেশন চ্যানেল</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">পদ্ধতি:</span>
              <span className="font-semibold text-foreground">সরাসরি Facebook / Messenger যোগাযোগ</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">ভেরিফিকেশন:</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" />
                এডমিন ম্যানুয়াল অ্যাক্টিভেশন
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">মেসেঞ্জার সাপোর্ট URL:</span>
              <span className="font-mono text-xs text-primary truncate max-w-[200px]">
                {siteConfig.links.messengerContact}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
