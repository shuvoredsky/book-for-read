import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { requireAuth } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReaderView } from "@/components/reader/reader-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনলাইন রিডার (Medical Book Reader)",
  description: "সুরক্ষিত Backblaze B2 ডিজিটাল মেডিকেল বই ক্যানভাস রিডার",
};

interface ReaderPageProps {
  params: Promise<{ bookSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  // 1. Authenticate user server-side
  const user = await requireAuth();
  const { bookSlug } = await params;
  const search = await searchParams;
  const targetPage = search.page ? parseInt(search.page, 10) : undefined;

  // 2. Strictly verify BookAccess status === "ACTIVE"
  const verification = await verifyUserBookAccess(user.id, bookSlug);

  if (!verification.authorized || !verification.book) {
    const isRevoked = verification.reason === "ACCESS_REVOKED";

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-card border-amber-500/30 text-center p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              {isRevoked ? (
                <ShieldAlert className="h-6 w-6 text-rose-500" />
              ) : (
                <Lock className="h-6 w-6 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-xl font-bold">
              {isRevoked
                ? "বইয়ের এক্সেস বাতিল করা হয়েছে (Access Revoked)"
                : "বইটি পড়ার অনুমতি নেই (Access Restricted)"}
            </CardTitle>
            <CardDescription>
              {isRevoked
                ? "এডমিন কর্তৃক আপনার রিডার এক্সেস সাময়িকভাবে বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে সাপোর্টে যোগাযোগ করুন।"
                : "এই সুরক্ষিত রিডারটিতে প্রবেশ করার জন্য সক্রিয় BookAccess প্রয়োজন। অনুগ্রহ করে ড্যাশবোর্ড থেকে পেমেন্ট সম্পন্ন করুন।"}
            </CardDescription>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="gradient" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  ড্যাশবোর্ডে ফিরে যান
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const book = verification.book;

  // 3. Authorized View:
  // Render master PDF.js canvas reader engine with user watermark and toolbar
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-3 sm:px-6 py-6 space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/60">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active Reader Access
            </Badge>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              @{user.username}
            </span>
          </div>
        </div>

        {/* Custom PDF.js Canvas Reader Engine (Phase 10 & 11) */}
        <ReaderView
          bookSlug={bookSlug}
          bookTitle={book.title}
          totalPages={book.totalPages}
          initialPage={targetPage}
          userWatermark={{
            username: user.username,
            displayName: user.name,
            email: user.email,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
