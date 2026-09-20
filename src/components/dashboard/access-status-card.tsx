import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

interface AccessStatusCardProps {
  bookSlug: string;
  hasActiveAccess: boolean;
  bookAccessStatus?: "ACTIVE" | "REVOKED" | null;
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
  bookAccessStatus,
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
            আপনার Access সক্রিয় রয়েছে
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

  // STATE 2: ACCESS REVOKED
  if (bookAccessStatus === "REVOKED") {
    return (
      <Card className="glass-card border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="destructive" className="gap-1.5 px-3 py-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              এক্সেস স্থগিত (Access Revoked)
            </Badge>
            <span className="text-xs text-rose-500 font-semibold font-mono">
              Access Suspended
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
            বইটির রিডার এক্সেস স্থগিত করা হয়েছে
          </CardTitle>
          <CardDescription className="text-foreground/80">
            প্রশাসনিক কারণে আপনার রিডার এক্সেস সাময়িকভাবে স্থগিত রয়েছে। কোনো জিজ্ঞাসা থাকলে বা এক্সেস পুনরুদ্ধারের জন্য সরাসরি Facebook-এ যোগাযোগ করুন।
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={siteConfig.links.messengerContact}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto cursor-pointer"
          >
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Facebook-এ যোগাযোগ করুন
            </Button>
          </a>
        </CardFooter>
      </Card>
    );
  }

  // STATE 3: PAYMENT PENDING VERIFICATION (If manual payment was recorded)
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
            আপনার ভেরিফিকেশন প্রক্রিয়াধীন রয়েছে
          </CardTitle>
          <CardDescription className="text-foreground/80">
            এডমিন আপনার তথ্য যাচাই করছেন। ভেরিফিকেশন সম্পন্ন হলে সাথে সাথে রিডার এক্সেস চালু হবে।
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <a
            href={siteConfig.links.messengerContact}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto cursor-pointer"
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Facebook-এ যোগাযোগ করুন
            </Button>
          </a>
        </CardFooter>
      </Card>
    );
  }

  // STATE 4: NO ACTIVE ACCESS -> CLEAN FACEBOOK CONTACT OPTION
  return (
    <Card className="glass-card border-primary/30 relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1">
            বইয়ের এক্সেস অ্যাক্টিভেশন
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            Digital Edition
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
          বইটি অ্যাক্টিভ করতে Facebook-এ যোগাযোগ করুন।
        </CardTitle>
        <CardDescription className="text-foreground/80">
          বইটির পূর্ণাঙ্গ ডিজিটাল সংস্করণ পড়তে এবং এক্সেস চালু করতে আমাদের Facebook মেসেঞ্জারে যোগাযোগ করুন।
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {latestPayment && latestPayment.status === "REJECTED" && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">পূর্ববর্তী তথ্য বাতিল হয়েছে</p>
              {latestPayment.adminNote && (
                <p className="mt-1 text-muted-foreground">এডমিন নোট: {latestPayment.adminNote}</p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>এডমিন কর্তৃক ম্যানুয়াল ভেরিফিকেশন ও তাৎক্ষণিক এক্সেস প্রদান।</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={siteConfig.links.messengerContact}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto cursor-pointer"
        >
          <Button
            variant="gradient"
            size="lg"
            className="w-full sm:w-auto gap-2 font-semibold shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            Facebook-এ যোগাযোগ করুন
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
