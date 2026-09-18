import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

interface AccessStatusCardProps {
  bookSlug: string;
  hasActiveAccess: boolean;
  latestPayment: {
    id: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    senderNumber: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    submittedAt: Date;
    reviewedAt: Date | null;
    adminNote: string | null;
  } | null;
}

export function AccessStatusCard({
  bookSlug,
  hasActiveAccess,
  latestPayment,
}: AccessStatusCardProps) {
  // STATE 1: ACTIVE ACCESS GRANTED
  if (hasActiveAccess) {
    return (
      <Card className="glass-card border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="success" className="gap-1.5 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              অনুমোদিত (Approved)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Life-time Access Active
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
            আপনার payment অনুমোদিত হয়েছে।
          </CardTitle>
          <CardDescription className="text-foreground/80">
            বইটির পূর্ণাঙ্গ ডিজিটাল সংস্করণ এখন আপনার জন্য উন্মুক্ত। যেকোনো সময় যেকোনো ডিভাইস থেকে পড়তে পারবেন।
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Link href={`/reader/${bookSlug}`} className="w-full sm:w-auto">
            <Button
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto gap-2 shadow-lg shadow-teal-500/20 font-semibold"
            >
              <BookOpen className="h-5 w-5" />
              বই পড়ুন (Read Book)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // STATE 2: PAYMENT PENDING VERIFICATION
  if (latestPayment && latestPayment.status === "PENDING") {
    return (
      <Card className="glass-card border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="warning" className="gap-1.5 px-3 py-1">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              যাচাই চলছে (Verification Pending)
            </Badge>
            <span className="text-xs text-muted-foreground">
              জমা দেওয়া হয়েছে: {formatDate(latestPayment.submittedAt)}
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
            আপনার payment verification-এর জন্য অপেক্ষা করছে।
          </CardTitle>
          <CardDescription className="text-foreground/80">
            আমাদের এডমিন প্যানেল আপনার ট্রানজেকশন তথ্য যাচাই করছে। ভেরিফিকেশন সম্পন্ন হলে স্বয়ংক্রিয়ভাবে রিডার এক্সেস চালু হবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="rounded-xl border border-amber-500/20 bg-card/60 p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
              <span className="font-semibold text-foreground">{latestPayment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">ট্রানজেকশন আইডি (TxID):</span>
              <span className="font-mono font-semibold text-primary">{latestPayment.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">প্রেরক মোবাইল নম্বর:</span>
              <span className="font-mono font-semibold text-foreground">{latestPayment.senderNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">জমাকৃত পরিমাণ:</span>
              <span className="font-bold text-foreground">৳{latestPayment.amount} BDT</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <a
            href={siteConfig.links.messengerContact}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              জরুরি প্রয়োজনে মেসেঞ্জারে জানান
            </Button>
          </a>
        </CardFooter>
      </Card>
    );
  }

  // STATE 3: NO PAYMENT / REJECTED PAYMENT -> PAYMENT INSTRUCTIONS
  return (
    <Card className="glass-card border-primary/30 relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1">
            বইটি পড়তে পেমেন্ট সম্পন্ন করুন
          </Badge>
          <span className="text-xs font-bold text-primary font-mono">
            ৳১০০ BDT Only
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
          এই বইটি পড়ার জন্য ১০০ টাকা payment করুন
        </CardTitle>
        <CardDescription className="text-foreground/80">
          বিকাশ, নগদ বা রকেটে ১০০ টাকা সেন্ড মানি বা পেমেন্ট করে নিচের বাটন থেকে তথ্য জমা দিন।
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {latestPayment && latestPayment.status === "REJECTED" && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">পূর্ববর্তী পেমেন্টটি বাতিল হয়েছে</p>
              {latestPayment.adminNote && (
                <p className="mt-1 text-muted-foreground">এডমিন নোট: {latestPayment.adminNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Account Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center space-y-1">
            <span className="text-xs font-bold text-rose-500 block">bKash (বিকাশ)</span>
            <span className="text-xs font-mono font-semibold text-foreground">
              {process.env.NEXT_PUBLIC_BKASH_NUMBER || "017XXXXXXXX"}
            </span>
            <span className="text-[10px] text-muted-foreground block">(Send Money / Payment)</span>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-3 text-center space-y-1">
            <span className="text-xs font-bold text-amber-500 block">Nagad (নগদ)</span>
            <span className="text-xs font-mono font-semibold text-foreground">
              {process.env.NEXT_PUBLIC_NAGAD_NUMBER || "018XXXXXXXX"}
            </span>
            <span className="text-[10px] text-muted-foreground block">(Send Money)</span>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-3 text-center space-y-1">
            <span className="text-xs font-bold text-purple-500 block">Rocket (রকেট)</span>
            <span className="text-xs font-mono font-semibold text-foreground">
              {process.env.NEXT_PUBLIC_ROCKET_NUMBER || "019XXXXXXXX"}
            </span>
            <span className="text-[10px] text-muted-foreground block">(Send Money)</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={siteConfig.links.messengerContact}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            পেমেন্ট করতে যোগাযোগ করুন
          </Button>
        </a>

        <Link href="/payment" className="w-full sm:w-auto">
          <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2 font-semibold shadow-md shadow-teal-500/20">
            <FileCheck2 className="h-4 w-4" />
            পেমেন্ট তথ্য সাবমিট করুন
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
