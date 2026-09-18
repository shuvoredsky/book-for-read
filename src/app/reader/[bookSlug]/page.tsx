import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { requireAuth } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনলাইন রিডার (Medical Book Reader)",
  description: "সুরক্ষিত ক্লাউডফ্লেয়ার R2 পিডিএফ রিডার",
};

interface ReaderPageProps {
  params: Promise<{ bookSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  // 1. Authenticate user
  const user = await requireAuth();
  const { bookSlug } = await params;
  const { page } = await searchParams;

  // 2. Strictly verify BookAccess status === "ACTIVE"
  const verification = await verifyUserBookAccess(user.id, bookSlug);

  if (!verification.authorized || !verification.book) {
    const isRevoked = verification.reason === "ACCESS_REVOKED";

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-card border-amber-500/30 text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
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

  // Active user view (Phase 10 connects the custom PDF.js canvas engine & Range requests)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Active Access
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Watermark: @{user.username}
            </span>
          </div>
        </div>

        <Card className="glass-card border-primary/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {book.title}
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            আপনি বর্তমানে সুরক্ষিত রিডার সিস্টেমে যুক্ত আছেন।
            {page ? ` লক্ষ্য পৃষ্ঠা: ${page}` : ""}
          </CardDescription>

          <div className="p-4 rounded-xl bg-muted/40 max-w-md mx-auto text-xs text-muted-foreground border border-border">
            ক্লাউডফ্লেয়ার R2 স্টোরেজ এবং PDF.js ক্যানভাস রিডার ইঞ্জিন পরবর্তী ফেজে (Phase 8-10) সংযুক্ত হবে।
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
