import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { requireAuth } from "@/server/auth";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বইয়ের এক্সেস অ্যাক্টিভেশন (Activate Book Access)",
  description: "বইটি পড়তে এবং এক্সেস চালু করতে Facebook-এ যোগাযোগ করুন",
};

export default async function PaymentPage() {
  const user = await requireAuth();

  // 1. Fetch active book
  const book = await prisma.book.findFirst({
    where: { isActive: true },
  });

  const bookId = book?.id || "default";

  // 2. Check if user already has active access
  const existingAccess = await prisma.bookAccess.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
  });

  if (existingAccess && existingAccess.status === "ACTIVE") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 bg-gradient-to-b from-background via-muted/30 to-background flex items-center justify-center">
        <div className="container mx-auto max-w-xl px-4 sm:px-6 space-y-6">
          {/* Top navigation back to dashboard */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </Link>

            <span className="text-xs text-muted-foreground font-mono">
              @{user.username}
            </span>
          </div>

          <Card className="glass-card border-primary/30 text-center p-6 sm:p-8 space-y-6 shadow-xl">
            <CardHeader className="space-y-2 p-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-7 w-7" />
              </div>
              <Badge variant="outline" className="w-fit mx-auto border-primary/30 text-primary">
                ডিজিটাল সংস্করণ
              </Badge>
              <CardTitle className="text-2xl font-bold text-foreground">
                বইটি অ্যাক্টিভ করতে Facebook-এ যোগাযোগ করুন
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-md mx-auto text-muted-foreground leading-relaxed">
                বইটির পূর্ণাঙ্গ ডিজিটাল সংস্করণ পড়তে আমাদের ফেসবুক মেসেঞ্জারে যোগাযোগ করুন। পেমেন্ট সম্পন্ন করার পর এডমিন সাথে সাথে আপনার একাউন্টে এক্সেস সক্রিয় (Active) করে দেবেন।
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 p-0">
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>লাইফ-টাইম অ্যাক্টিভেশন • সকল ডিভাইসে রিডিং সুবিধা</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={siteConfig.links.messengerContact}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full cursor-pointer"
                >
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full gap-2 text-base font-semibold shadow-lg shadow-teal-500/20"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Facebook-এ যোগাযোগ করুন
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
