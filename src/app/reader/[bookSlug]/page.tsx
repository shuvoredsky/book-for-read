import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";
import { requireAuth } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReaderStub } from "@/components/reader/reader-stub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনলাইন রিডার (Medical Book Reader)",
  description: "সুরক্ষিত Backblaze B2 ডিজিটাল মেডিকেল বই রিডার",
};

interface ReaderPageProps {
  params: Promise<{ bookSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  // 1. Authenticate user server-side
  const user = await requireAuth();
  const { bookSlug } = await params;
  await searchParams; // Await searchParams for Next.js 15+ convention

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
  // Note: Presigned URL is intentionally NOT fetched at page render time to avoid baking it into static HTML.
  // The client ReaderStub component fetches the temporary token on mount.
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            User: @{user.username}
          </span>
        </div>

        {/* Reader Client Stub (Phase 9 presigned token integration) */}
        <ReaderStub
          bookSlug={bookSlug}
          bookTitle={book.title}
          totalPages={book.totalPages}
          userWatermark={`@${user.username}`}
        />
      </main>
      <Footer />
    </div>
  );
}
