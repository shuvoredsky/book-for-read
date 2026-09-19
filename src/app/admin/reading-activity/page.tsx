import { Metadata } from "next";
import { Activity, BookOpen, Users, CheckCircle2, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "রিডিং অ্যাক্টিভিটি (Reading Activity)",
  description: "পাঠকদের রিয়েল-টাইম পড়ার প্রগ্রেস ও অ্যানালিটিক্স",
};

export default async function AdminReadingActivityPage() {
  await requireAdmin();

  // Fetch all reading progress records with user and book data
  const progressList = await prisma.readingProgress.findMany({
    orderBy: { lastReadAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          status: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          totalPages: true,
        },
      },
    },
  });

  const totalReaders = progressList.length;
  const activeReadingCount = progressList.filter((p) => p.currentPage > 1).length;
  const avgProgress =
    totalReaders > 0
      ? Math.round(
          progressList.reduce((acc, curr) => acc + curr.progressPercentage, 0) /
            totalReaders
        )
      : 0;
  const overHalfReaders = progressList.filter((p) => p.progressPercentage >= 50).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            পাঠকদের রিডিং অ্যাক্টিভিটি (Reading Activity)
          </h1>
          <p className="text-sm text-muted-foreground">
            পাঠকরা কোন পৃষ্ঠায় আছেন এবং কত শতাংশ পড়া সম্পন্ন করেছেন তার লাইভ বিশ্লেষণ
          </p>
        </div>

        <Badge variant="outline" className="gap-1.5 py-1 px-3 self-start sm:self-auto">
          <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
          লাইভ প্রগ্রেস সিঙ্ক
        </Badge>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              মোট পাঠক
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReaders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              যাঁদের প্রগ্রেস রেকর্ড তৈরি হয়েছে
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              সক্রিয় পড়ছেন (Page &gt; 1)
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReadingCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ১ম পৃষ্ঠা অতিক্রম করেছেন
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              গড় অগ্রগতি (Avg Progress)
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              সামগ্রিক পাঠক কমপ্লিশন হার
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              ৫০%+ সম্পন্ন
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overHalfReaders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              অর্ধেকের বেশি পড়া পাঠক
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Activity Table */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            পাঠকদের সর্বশেষ পড়ার তালিকা ({progressList.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">পাঠক (User)</th>
                <th className="px-4 py-3.5">বই (Book)</th>
                <th className="px-4 py-3.5">বর্তমান পৃষ্ঠা (Page)</th>
                <th className="px-4 py-3.5">অগ্রগতি (Progress)</th>
                <th className="px-4 py-3.5 text-right">সর্বশেষ পঠিত (Last Read)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {progressList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">
                      এখনো কোনো রিডিং অ্যাক্টিভিটি পাওয়া যায়নি
                    </p>
                    <p className="text-xs mt-1">
                      পাঠকরা বই পড়া শুরু করলে স্বয়ংক্রিয়ভাবে এখানে লাইভ ডেটা যুক্ত হবে।
                    </p>
                  </td>
                </tr>
              ) : (
                progressList.map((item) => {
                  const pct = +item.progressPercentage.toFixed(1);
                  const total = item.totalPages || item.book.totalPages || 384;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {item.user.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          @{item.user.username} • {item.user.email}
                        </div>
                      </td>

                      {/* Book */}
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.book.title}
                      </td>

                      {/* Page */}
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        পৃষ্ঠা {item.currentPage} / {total}
                      </td>

                      {/* Progress Bar & Percentage */}
                      <td className="px-4 py-3">
                        <div className="space-y-1.5 min-w-[140px] max-w-[200px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">সম্পন্ন:</span>
                            <span className="font-mono font-bold text-foreground">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Last Read */}
                      <td className="px-4 py-3 text-right text-muted-foreground font-mono whitespace-nowrap">
                        {formatDate(item.lastReadAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
