import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  MessageSquare,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { requireAuth } from "@/server/auth";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পেমেন্ট ভেরিফিকেশন পেন্ডিং (Payment Pending)",
  description: "আপনার পেমেন্ট ভেরিফিকেশন সম্পন্ন হওয়ার অপেক্ষায় রয়েছে",
};

export default async function PaymentPendingPage() {
  const user = await requireAuth();

  // Fetch the latest pending payment for this user
  const pendingPayment = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      status: "PENDING",
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  // If no pending payment exists, redirect to dashboard or payment
  if (!pendingPayment) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20 flex items-center justify-center px-4 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        {/* Amber Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-2xl relative z-10 space-y-6">
          <Card className="glass-card border-amber-500/30 shadow-2xl overflow-hidden">
            {/* Top decorative stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <Badge variant="warning" className="px-3 py-1 text-xs">
                  যাচাইকরণ প্রক্রিয়াধীন (Verification Pending)
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground pt-1">
                  আপনার payment verification-এর জন্য অপেক্ষা করছে।
                </CardTitle>
                <CardDescription className="text-sm max-w-md mx-auto">
                  আপনার জমা দেওয়া পেমেন্ট তথ্য আমাদের এডমিন প্যানেলে গৃহীত হয়েছে। এডমিন ভেরিফিকেশন সম্পন্ন হলে স্বয়ংক্রিয়ভাবে আপনার রিডার সক্রিয় হবে।
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {/* Receipt Summary Box */}
              <div className="rounded-2xl border border-amber-500/20 bg-card/70 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>পেমেন্ট রসিদ বিবরণ</span>
                  <span className="font-mono text-primary">RECEIPT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">পেমেন্ট মেথড:</span>
                    <span className="font-semibold text-foreground">{pendingPayment.paymentMethod}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-xs">পরিশোধিত পরিমাণ:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{pendingPayment.amount} BDT
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-xs">ট্রানজেকশন আইডি (TxID):</span>
                    <span className="font-mono font-bold text-primary tracking-wider">
                      {pendingPayment.transactionId}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-xs">প্রেরক মোবাইল নম্বর:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {pendingPayment.senderNumber}
                    </span>
                  </div>

                  <div className="sm:col-span-2 pt-1 border-t border-border/40 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">জমা দেওয়ার সময়:</span>
                    <span className="text-foreground font-medium">
                      {formatDate(pendingPayment.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="rounded-xl bg-muted/40 p-4 space-y-2 border border-border/60 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>ভেরিফিকেশন সম্পন্ন হলে কী ঘটবে?</span>
                </div>
                <p className="leading-relaxed">
                  এডমিন অনুমোদন দেওয়ার সাথে সাথে আপনার একাউন্টে বইটির আজীবন অ্যাক্টিভ এক্সেস যুক্ত হবে এবং ড্যাশবোর্ডে সরাসরি &quot;বই পড়ুন&quot; অপশন প্রদর্শিত হবে।
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-1/2">
                <Button variant="default" className="w-full gap-2 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  ড্যাশবোর্ডে যান
                </Button>
              </Link>

              <a
                href={siteConfig.links.messengerContact}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 cursor-pointer"
              >
                <Button variant="outline" className="w-full gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  জরুরি প্রয়োজনে মেসেঞ্জারে নক দিন
                </Button>
              </a>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
