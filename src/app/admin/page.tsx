import Link from "next/link";
import { Metadata } from "next";
import {
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  KeyRound,
  BookOpen,
  ArrowRight,
  Clock,
  History,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "এডমিন ওভারভিউ (Admin Dashboard)",
  description: "মেডিকেল বুক ডিজিটাল প্ল্যাটফর্মের পরিসংখ্যান ও ওভারভিউ",
};

export default async function AdminOverviewPage() {
  // Query real metrics from database in parallel
  const [
    totalUsers,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    activeAccessCount,
    activeReadersCount,
    recentPendingList,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "APPROVED" } }),
    prisma.payment.count({ where: { status: "REJECTED" } }),
    prisma.bookAccess.count({ where: { status: "ACTIVE" } }),
    prisma.readingProgress.count({ where: { currentPage: { gt: 1 } } }),
    prisma.payment.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        user: {
          select: { name: true, username: true, email: true },
        },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const cards = [
    {
      title: "মোট ব্যবহারকারী (Total Users)",
      value: totalUsers,
      desc: "নিবন্ধিত পাঠকদের মোট সংখ্যা",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      link: "/admin/users",
    },
    {
      title: "পেন্ডিং পেমেন্ট (Pending)",
      value: pendingPayments,
      desc: "যাচাইয়ের অপেক্ষায় থাকা আবেদন",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      link: "/admin/payments?status=PENDING",
      highlight: pendingPayments > 0,
    },
    {
      title: "অনুমোদিত পেমেন্ট (Approved)",
      value: approvedPayments,
      desc: `মোট আয়: ৳${approvedPayments * 100} BDT`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      link: "/admin/payments?status=APPROVED",
    },
    {
      title: "বাতিল পেমেন্ট (Rejected)",
      value: rejectedPayments,
      desc: "অকার্যকর বা ভুয়া ট্রানজেকশন",
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      link: "/admin/payments?status=REJECTED",
    },
    {
      title: "সক্রিয় রিডিং এক্সেস (Active Access)",
      value: activeAccessCount,
      desc: "বই পড়ার পূর্ণ অনুমতিপ্রাপ্ত ইউজার",
      icon: KeyRound,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
      link: "/admin/access",
    },
    {
      title: "সক্রিয় পাঠক (Active Readers)",
      value: activeReadersCount,
      desc: "১ম পৃষ্ঠার বেশি পড়া শুরু করেছেন",
      icon: TrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      link: "/admin/reading-activity",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            এডমিন ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-sm text-muted-foreground">
            রিয়েল-টাইম মেট্রিক্স, পেমেন্ট ভেরিফিকেশন এবং সিস্টেম অডিট হিস্ট্রি
          </p>
        </div>

        <Link href="/admin/payments">
          <Button variant="gradient" className="gap-2 shadow-md shadow-teal-500/20">
            <CreditCard className="h-4 w-4" />
            পেমেন্ট ম্যানেজমেন্ট
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} href={card.link}>
              <Card
                className={`glass-card hover:scale-[1.02] transition-all cursor-pointer ${
                  card.border
                } ${card.highlight ? "ring-2 ring-amber-500/40 bg-amber-500/5" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black text-foreground pt-1">
                    {card.value}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Recent Pending & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Recent Pending Payments Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">
                যাচাইয়ের অপেক্ষায় থাকা পেমেন্টস ({pendingPayments})
              </h2>
            </div>
            <Link href="/admin/payments?status=PENDING">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                সবগুলো দেখুন
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0 divide-y divide-border/60">
              {recentPendingList.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-muted-foreground text-xs">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-foreground text-sm">
                    কোনো পেন্ডিং পেমেন্ট নেই
                  </p>
                  <p>সকল জমাকৃত আবেদন প্রক্রিয়া সম্পন্ন হয়েছে।</p>
                </div>
              ) : (
                recentPendingList.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {p.user.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          @{p.user.username}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">
                          {p.paymentMethod}
                        </Badge>
                        <span className="font-mono font-semibold text-primary">
                          TxID: {p.transactionId}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{p.senderNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm text-foreground">৳{p.amount}</span>
                      <Link href={`/admin/payments?status=PENDING&search=${p.transactionId}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          রিভিউ করুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right (5 cols): Recent System Audit Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-bold text-foreground">
                সাম্প্রতিক অডিট লগ
              </h2>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-xs text-purple-500 gap-1">
                সব লগ
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0 divide-y divide-border/60">
              {recentAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  এখনও কোনো অডিট লগ এন্ট্রি জমা হয়নি।
                </div>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          log.action.includes("APPROVED") || log.action.includes("GRANTED")
                            ? "success"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {log.action}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground font-medium text-xs truncate">
                      Target: {log.target}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      By: {log.admin?.name || "System Admin"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
