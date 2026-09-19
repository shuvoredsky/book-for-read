import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  FileCheck2,
  Clock,
  ShieldAlert,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch current user session server-side (safe fallback)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // If auth session fails or DB is unavailable, treat as guest visitor
    user = null;
  }

  // 2. Fetch active book from database (fallback to siteConfig)
  let book = null;
  let bookAccess: { status: "ACTIVE" | "REVOKED" } | null = null;
  let latestPayment: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    transactionId: string;
  } | null = null;

  try {
    book = await prisma.book.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        totalPages: true,
        isActive: true,
      },
    });

    if (user && book) {
      const [accessData, paymentData] = await Promise.all([
        prisma.bookAccess.findUnique({
          where: {
            userId_bookId: {
              userId: user.id,
              bookId: book.id,
            },
          },
          select: { status: true },
        }),
        prisma.payment.findFirst({
          where: { userId: user.id },
          orderBy: { submittedAt: "desc" },
          select: { status: true, transactionId: true },
        }),
      ]);

      bookAccess = accessData;
      latestPayment = paymentData;
    }
  } catch {
    // Graceful fallback to siteConfig data if database is not reachable
  }

  const bookTitle = book?.title || siteConfig.book.title;
  const bookSubtitle = siteConfig.book.subtitle;
  const bookAuthor = siteConfig.book.author;
  const bookPrice = book?.price || siteConfig.book.price;
  const bookSlug = book?.slug || siteConfig.book.slug;
  const bookDescription = book?.description || siteConfig.book.description;

  const hasActiveAccess = bookAccess?.status === "ACTIVE";
  const isRevoked = bookAccess?.status === "REVOKED";
  const isPendingPayment = latestPayment?.status === "PENDING" && !hasActiveAccess;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-10 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          {/* Main Book Showcase Card */}
          <Card className="glass-card border-border/80 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-10 items-center">
              {/* Left: Book Cover Preview */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[260px] aspect-[3/4.2] rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 text-white flex flex-col justify-between shadow-2xl border border-white/10 ring-1 ring-black/20">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                      ডিজিটাল সংস্করণ
                    </span>
                    <span className="text-[11px] font-mono text-white/70">
                      ৳{bookPrice} BDT
                    </span>
                  </div>

                  {/* Book Title Block */}
                  <div className="space-y-2 text-center my-auto">
                    <div className="mx-auto w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-2 border border-white/15">
                      <BookOpen className="h-5 w-5 text-emerald-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                      {bookTitle}
                    </h2>
                    <p className="text-xs text-emerald-200/90 font-medium">
                      {bookSubtitle}
                    </p>
                  </div>

                  {/* Author & Footer */}
                  <div className="pt-3 border-t border-white/10 text-center">
                    <p className="text-[11px] text-white/75 font-medium">
                      লেখক: {bookAuthor}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Book Details & Dynamic CTA State */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      বই
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      লেখক: {bookAuthor}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {bookTitle}
                  </h1>

                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {bookSubtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                    {bookDescription}
                  </p>
                </div>

                {/* Pricing block */}
                <div className="flex items-baseline gap-3 pt-1 border-t border-border/60">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">
                    ৳{bookPrice}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    (এককালীন পেমেন্টে আজীবন অনলাইন রিডার এক্সেস)
                  </span>
                </div>

                {/* DYNAMIC ACTION STATES */}

                {/* STATE 1: Logged-out Visitor */}
                {!user && (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-muted-foreground">
                      বইটি পড়তে আপনার একাউন্টে লগইন করুন অথবা নতুন রেজিস্ট্রেশন করুন:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <User className="h-4 w-4" />
                          লগইন করুন
                        </Button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <Button variant="gradient" className="w-full gap-2 font-semibold shadow-md shadow-teal-500/20">
                          <Sparkles className="h-4 w-4" />
                          রেজিস্ট্রেশন করুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* STATE 2: Logged-in Active User */}
                {user && hasActiveAccess && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">আপনার Access Active</p>
                        <p className="text-xs opacity-90">আপনি বইটি যেকোনো সময় পড়তে পারবেন।</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/reader/${bookSlug}`} className="flex-1">
                        <Button
                          variant="gradient"
                          size="lg"
                          className="w-full gap-2 text-base font-semibold shadow-lg shadow-teal-500/20"
                        >
                          <BookOpen className="h-5 w-5" />
                          বই পড়ুন (Read Book)
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          ড্যাশবোর্ড
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* STATE 3: Logged-in User with Pending Payment */}
                {user && isPendingPayment && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex items-center gap-3 text-amber-700 dark:text-amber-300">
                      <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold">আপনার payment verification-এর জন্য অপেক্ষা করছে</p>
                        <p className="text-xs opacity-90">এডমিন ভেরিফিকেশন সম্পন্ন হলে এক্সেস চালু হবে।</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/payment/pending" className="flex-1">
                        <Button variant="outline" className="w-full gap-2 text-xs">
                          পেমেন্ট স্ট্যাটাস দেখুন
                        </Button>
                      </Link>
                      <a
                        href={siteConfig.links.messengerContact}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="gradient" className="w-full gap-2 text-xs">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          মেসেঞ্জারে জানান
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                {/* STATE 4: Logged-in User with Revoked Access */}
                {user && isRevoked && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 flex items-center gap-3 text-destructive">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">এক্সেস স্থগিত (Access Revoked)</p>
                        <p className="text-xs opacity-90">সহায়তার জন্য সাপোর্টে যোগাযোগ করুন।</p>
                      </div>
                    </div>

                    <a
                      href={siteConfig.links.messengerContact}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        সাপোর্টে যোগাযোগ করুন
                      </Button>
                    </a>
                  </div>
                )}

                {/* STATE 5: Logged-in Unpaid User (No access, no pending payment) */}
                {user && !hasActiveAccess && !isPendingPayment && !isRevoked && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-xl bg-muted/60 border border-border p-3.5 space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        বইটি পড়তে Payment করুন
                      </p>
                      <p className="text-xs text-muted-foreground">
                        মূল্য: ৳{bookPrice} BDT • সেন্ড মানি বা পেমেন্ট সম্পন্ন করে নিচের বাটনে ক্লিক করুন।
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={siteConfig.links.messengerContact}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full gap-2 text-sm font-semibold border-primary/30 hover:bg-primary/5"
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          পেমেন্ট করতে যোগাযোগ করুন
                        </Button>
                      </a>

                      <Link href="/payment" className="flex-1">
                        <Button
                          variant="gradient"
                          size="lg"
                          className="w-full gap-2 text-sm font-semibold shadow-md shadow-teal-500/20"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          পেমেন্ট তথ্য সাবমিট করুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom Trust Indicators */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    সুরক্ষিত ক্যানভাস রিডার
                  </span>
                  <span>সব ডিভাইসে ব্যবহারযোগ্য</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
