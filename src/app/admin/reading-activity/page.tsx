import { Metadata } from "next";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "রিডিং অ্যাক্টিভিটি (Reading Activity)",
  description: "পাঠকদের রিয়েল-টাইম পড়ার প্রগ্রেস ও চ্যাপ্টার অ্যানালিটিক্স",
};

export default function AdminReadingActivityPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          পাঠকদের রিডিং অ্যাক্টিভিটি (Reading Activity)
        </h1>
        <p className="text-sm text-muted-foreground">
          কোন পাঠক কোন পৃষ্ঠায় আছেন এবং কত শতাংশ পড়া সম্পন্ন করেছেন তার লাইভ বিশ্লেষণ
        </p>
      </div>

      <Card className="glass-card text-center p-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <Activity className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            Phase 12 Progress Sync
          </Badge>
          <CardTitle className="text-xl font-bold">
            লাইভ রিডিং অ্যাক্টিভিটি অ্যানালিটিক্স
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            ডিবাউন্সড রিডিং প্রগ্রেস সিঙ্ক এবং চ্যাপ্টার এনগেজমেন্ট রিপোর্ট Phase 12 এ চালু হবে।
          </CardDescription>
        </div>
      </Card>
    </div>
  );
}
