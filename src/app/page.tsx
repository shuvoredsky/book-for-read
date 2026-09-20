import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  User,
  ExternalLink,
  ShieldCheck,
  Clock,
  ShieldAlert,
  Stethoscope,
  Dna,
  HeartPulse,
  Pill,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default async function HomePage() {
  // 1. Fetch current user session server-side (safe fallback)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
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
    // Graceful fallback
  }

  const bookTitle = book?.title || siteConfig.book.title;
  const bookSubtitle = siteConfig.book.subtitle;
  const bookAuthor = siteConfig.book.author;
  const bookPrice = book?.price || siteConfig.book.price;
  const bookSlug = book?.slug || siteConfig.book.slug;
  const totalPages = book?.totalPages || siteConfig.book.totalPages;

  const hasActiveAccess = bookAccess?.status === "ACTIVE";
  const isRevoked = bookAccess?.status === "REVOKED";
  const isPendingPayment = latestPayment?.status === "PENDING" && !hasActiveAccess;

  return (
    <div className="flex h-dvh flex-col justify-between bg-background relative overflow-hidden">
      {/* Decorative Medical Background Elements (Subtle & Ambient) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] h-[340px] sm:h-[560px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/5 rounded-full blur-3xl" />

        {/* Subtle ECG Heartbeat Pulse Waveform SVG */}
        <svg
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-28 sm:h-36 opacity-[0.045] dark:opacity-[0.08] text-primary"
          viewBox="0 0 1200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 L280,60 L310,60 L325,30 L340,95 L355,10 L370,110 L385,45 L400,60 L700,60 L730,60 L745,30 L760,95 L775,10 L790,110 L805,45 L820,60 L1200,60"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Top-Left: Stethoscope icon */}
        <div className="absolute -top-4 -left-4 sm:top-8 sm:left-12 opacity-[0.045] dark:opacity-[0.075] text-primary -rotate-12">
          <Stethoscope className="w-24 h-24 sm:w-36 sm:h-36" />
        </div>

        {/* Top-Right: DNA Helix icon */}
        <div className="absolute top-2 -right-3 sm:top-10 sm:right-16 opacity-[0.045] dark:opacity-[0.075] text-emerald-500 rotate-12">
          <Dna className="w-20 h-20 sm:w-32 sm:h-32" />
        </div>

        {/* Bottom-Left: Heartbeat / Activity icon */}
        <div className="absolute bottom-10 -left-3 sm:bottom-16 sm:left-16 opacity-[0.045] dark:opacity-[0.075] text-teal-500 rotate-6">
          <HeartPulse className="w-20 h-20 sm:w-32 sm:h-32" />
        </div>

        {/* Bottom-Right: Medical Pill icon */}
        <div className="absolute bottom-8 -right-4 sm:bottom-14 sm:right-12 opacity-[0.045] dark:opacity-[0.075] text-cyan-600 -rotate-12">
          <Pill className="w-24 h-24 sm:w-36 sm:h-36" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-4 relative z-10 overflow-hidden my-auto">
        <div className="w-full max-w-[320px] sm:max-w-[360px] flex flex-col items-center">
          {/* Book Cover */}
          <div className="relative w-full max-w-[195px] sm:max-w-[225px] aspect-[3/3.9] rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-2xl border border-white/15 ring-1 ring-black/40 group transition-transform duration-300 hover:scale-[1.02]">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ডিজিটাল সংস্করণ
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-white/90 font-bold">
                ৳{bookPrice} BDT
              </span>
            </div>

            {/* Book Title Block */}
            <div className="space-y-1 sm:space-y-1.5 text-center my-auto">
              <div className="mx-auto w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-1 border border-white/20 shadow-inner">
                <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-300" />
              </div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                {bookTitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">
                {bookSubtitle}
              </p>
              <p className="text-[10px] sm:text-[11px] text-white/60 font-mono">
                মোট পৃষ্ঠা: {totalPages}
              </p>
            </div>

            {/* Author & Footer */}
            <div className="pt-1.5 sm:pt-2 border-t border-white/10 text-center">
              <p className="text-[10px] sm:text-[11px] text-white/75 font-medium">
                লেখক: {bookAuthor}
              </p>
            </div>
          </div>

          {/* Direct Call-to-Action Section Below Cover */}
          <div className="w-full max-w-[215px] sm:max-w-[245px] space-y-2 mt-3 sm:mt-4">
            {/* CASE A: Logged-in User with Active Access */}
            {user && hasActiveAccess && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-1.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>এক্সেস সক্রিয় আছে</span>
                </div>
                <Link href={`/reader/${bookSlug}`} className="block w-full">
                  <Button
                    variant="gradient"
                    size="default"
                    className="w-full gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/25 py-2.5 sm:py-3 rounded-xl cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    বইটি পড়ুন (পড়া শুরু করুন)
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="block w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold rounded-xl border-border/80 bg-background/60 hover:bg-background backdrop-blur-xs cursor-pointer h-8 sm:h-9"
                  >
                    ড্যাশবোর্ডে যান
                  </Button>
                </Link>
              </div>
            )}

            {/* CASE B: Logged-in User without Access / Pending / Revoked */}
            {user && !hasActiveAccess && (
              <div className="space-y-2 w-full">
                {isPendingPayment && (
                  <div className="flex items-center justify-center gap-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span>পেমেন্ট যাচাই চলছে</span>
                  </div>
                )}
                {isRevoked && (
                  <div className="flex items-center justify-center gap-1.5 py-0.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>এক্সেস স্থগিত আছে</span>
                  </div>
                )}
                <Link href="/dashboard" className="block w-full">
                  <Button
                    variant="gradient"
                    size="default"
                    className="w-full gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 py-2.5 sm:py-3 rounded-xl cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    ড্যাশবোর্ডে যান
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}

            {/* CASE C: Logged-out Visitor — Clear CTA */}
            {!user && (
              <div className="space-y-2 w-full">
                {/* Primary Read / Start Button */}
                <Link href="/login" className="block w-full">
                  <Button
                    variant="gradient"
                    size="default"
                    className="w-full gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/25 py-2.5 sm:py-3 rounded-xl cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    বইটি পড়ুন
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>

                {/* Quick Login & Register Row */}
                <div className="flex gap-2 w-full">
                  <Link href="/login" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1 rounded-xl border-border/80 bg-background/60 hover:bg-background backdrop-blur-xs cursor-pointer h-8 sm:h-9"
                    >
                      <User className="h-3 w-3" />
                      লগইন
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 backdrop-blur-xs cursor-pointer h-8 sm:h-9"
                    >
                      <Sparkles className="h-3 w-3" />
                      রেজিস্ট্রেশন
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Prominent, Clearly Clickable Facebook Contact Pill Button for All Users */}
            <div className="pt-1 text-center w-full">
              <a
                href={siteConfig.links.messengerContact}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-foreground/85 hover:text-primary transition-all py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl bg-card/75 hover:bg-card/95 dark:bg-card/60 dark:hover:bg-card/90 border border-border/80 hover:border-primary/50 shadow-xs backdrop-blur-sm cursor-pointer text-center leading-snug"
              >
                <FacebookIcon className="h-3.5 w-3.5 text-[#1877F2] shrink-0 group-hover:scale-110 transition-transform" />
                <span>পেমেন্ট সংক্রান্ত সাহায্যের জন্য যোগাযোগ করুন</span>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer className="py-2.5 sm:py-3 text-[11px] border-t border-border/40" />
    </div>
  );
}
