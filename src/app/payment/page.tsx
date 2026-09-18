import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { requireAuth } from "@/server/auth";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PaymentForm } from "@/components/payment/payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পেমেন্ট তথ্য সাবমিট করুন (Manual Payment)",
  description: "বিকাশ, নগদ বা রকেটে ১০০ টাকা পেমেন্ট করে ট্রানজেকশন তথ্য জমা দিন",
};

export default async function PaymentPage() {
  const user = await requireAuth();

  // 1. Fetch active book
  const book = await prisma.book.findFirst({
    where: { isActive: true },
  });

  const bookId = book?.id || "default";
  const bookPrice = book?.price || siteConfig.book.price;

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

  // 3. Check if user already has a pending payment
  const pendingPayment = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      status: "PENDING",
    },
  });

  if (pendingPayment) {
    redirect("/payment/pending");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top navigation back to dashboard */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                সুরক্ষিত ম্যানুয়াল পেমেন্ট
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                User: @{user.username}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (5 cols): Payment Instructions */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit border-primary/30 text-primary mb-1">
                    পেমেন্ট করার নিয়মাবলী
                  </Badge>
                  <CardTitle className="text-xl font-bold text-foreground">
                    টাকা পাঠানোর ধাপসমূহ
                  </CardTitle>
                  <CardDescription>
                    নিচের যেকোনো একটি নম্বরে ১০০ টাকা সেন্ড মানি করুন:
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs sm:text-sm">
                  {/* Account Numbers List */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          bKash Personal (বিকাশ)
                        </span>
                        <Badge variant="outline" className="text-[10px] border-rose-500/30">
                          Send Money
                        </Badge>
                      </div>
                      <p className="font-mono text-base font-bold text-foreground tracking-wider">
                        {process.env.NEXT_PUBLIC_BKASH_NUMBER || "017XXXXXXXX"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          Nagad Personal (নগদ)
                        </span>
                        <Badge variant="outline" className="text-[10px] border-amber-500/30">
                          Send Money
                        </Badge>
                      </div>
                      <p className="font-mono text-base font-bold text-foreground tracking-wider">
                        {process.env.NEXT_PUBLIC_NAGAD_NUMBER || "018XXXXXXXX"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          Rocket Personal (রকেট)
                        </span>
                        <Badge variant="outline" className="text-[10px] border-purple-500/30">
                          Send Money
                        </Badge>
                      </div>
                      <p className="font-mono text-base font-bold text-foreground tracking-wider">
                        {process.env.NEXT_PUBLIC_ROCKET_NUMBER || "019XXXXXXXX"}
                      </p>
                    </div>
                  </div>

                  {/* Summary Steps */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>টাকা পাঠানোর পর SMS থেকে TrxID / TxID কপি করুন।</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>ডানপাশের ফর্মে TxID ও প্রেরক নম্বর দিয়ে সাবমিট করুন।</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>১০-৩০ মিনিটের মধ্যে এডমিন ভেরিফিকেশন সম্পন্ন হবে।</span>
                    </div>
                  </div>

                  {/* Messenger Help Button */}
                  <div className="pt-2">
                    <a
                      href={siteConfig.links.messengerContact}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        পেমেন্ট করতে মেসেঞ্জারে যোগাযোগ করুন
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (7 cols): Interactive Submission Form */}
            <div className="lg:col-span-7">
              <PaymentForm bookPrice={bookPrice} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
