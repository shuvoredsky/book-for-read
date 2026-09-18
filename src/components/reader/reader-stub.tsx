"use client";

import * as React from "react";
import {
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { getBookReadUrlAction, type PresignedUrlData } from "@/server/actions/reader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface ReaderStubProps {
  bookSlug: string;
  bookTitle: string;
  totalPages: number;
  userWatermark: string;
}

export function ReaderStub({
  bookSlug,
  bookTitle,
  totalPages,
  userWatermark,
}: ReaderStubProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<PresignedUrlData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPresignedUrl = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getBookReadUrlAction(bookSlug);

      if (!res.success || !res.data) {
        setError(res.error || "সুরক্ষিত রিডিং লিংক জেনারেট করা যায়নি।");
        toast.error("রিডিং লিংক জেনারেট ব্যর্থ হয়েছে");
      } else {
        setData(res.data);
        toast.success("সুরক্ষিত PDF URL সফলভাবে জেনারেট হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভারের সাথে যোগাযোগে ত্রুটি ঘটেছে।");
      toast.error("সার্ভার ত্রুটি");
    } finally {
      setLoading(false);
    }
  }, [bookSlug]);

  React.useEffect(() => {
    fetchPresignedUrl();
  }, [fetchPresignedUrl]);

  return (
    <div className="space-y-6">
      {/* Main Status & Verification Card */}
      <Card className="glass-card border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Backblaze B2 Authorization System (Phase 9)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md">
              Watermark: {userWatermark}
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold pt-2">
            {bookTitle}
          </CardTitle>
          <CardDescription>
            {totalPages} পৃষ্ঠার ডিজিটাল মেডিকেল ক্লিনিক্যাল হ্যান্ডবুক
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Backblaze B2 সুরক্ষিত সাইনড রিডিং লিংক তৈরি হচ্ছে...
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                আপনার BookAccess অনুমতি এবং সিকিউরিটি টোকেন যাচাই করা হচ্ছে।
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-semibold">এক্সেস অস্বীকৃত বা লিঙ্ক জেনারেশন ত্রুটি</p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPresignedUrl}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                পুনরায় চেষ্টা করুন
              </Button>
            </div>
          )}

          {/* Success State */}
          {!loading && data && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-sm">
                    PDF URL generated successfully (Backblaze B2 Presigned URL)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Backblaze B2 প্রাইভেট বাকেট থেকে ১০ মিনিটের জন্য একটি অস্থায়ী ক্রিপ্টোগ্রাফিক রিডিং লিংক প্রস্তুত করা হয়েছে।
                </p>
              </div>

              {/* URL Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>লিংকের মেয়াদ (Expiry Duration):</span>
                  </div>
                  <p className="font-semibold font-mono text-foreground">
                    {data.expiresIn / 60} মিনিট ({data.expiresIn} সেকেন্ড)
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>সুরক্ষা প্রোটোকল:</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    S3 SigV4 Presigned GET
                  </p>
                </div>
              </div>

              {/* Temporary Test Link for Phase 9 verification */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Phase 9 ম্যানুয়াল টেস্টিং ভিউয়ার
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Temporary Test Link
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  B2 থেকে সরাসরি র পিডিএফে এক্সেস চেক করতে নিচের বাটনে ক্লিক করুন:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={data.presignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="gradient" size="sm" className="gap-2 text-xs">
                      <ExternalLink className="h-4 w-4" />
                      ব্রাউজারে সরাসরি PDF লিংক ওপেন করুন
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPresignedUrl}
                    className="gap-1.5 text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    নতুন লিংক রিফ্রেশ করুন
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Phase 10-এ এই সাইনড লিংক দিয়ে কাস্টম PDF.js ক্যানভাস রেন্ডারার ও প্রটেকশন ওভারলে যুক্ত হবে।</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
