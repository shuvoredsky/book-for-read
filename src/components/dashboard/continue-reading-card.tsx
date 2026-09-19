import Link from "next/link";
import { BookOpen, Play, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ContinueReadingCardProps {
  bookSlug: string;
  hasAccess: boolean;
  readingProgress: {
    id: string;
    currentPage: number;
    totalPages: number;
    progressPercentage: number;
    lastReadAt: Date;
  } | null;
  totalBookPages: number;
}

export function ContinueReadingCard({
  bookSlug,
  hasAccess,
  readingProgress,
  totalBookPages,
}: ContinueReadingCardProps) {
  const currentPage = readingProgress?.currentPage || 1;
  const totalPages = readingProgress?.totalPages || totalBookPages || 384;
  const percentage = readingProgress
    ? Math.round(readingProgress.progressPercentage)
    : 0;

  const isCompleted = currentPage === totalPages && totalPages > 1;
  const isNewReader = !readingProgress || readingProgress.currentPage <= 1;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`gap-1 ${
              isCompleted
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "border-primary/30 text-primary"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {isCompleted
              ? "বই পড়া সম্পন্ন হয়েছে"
              : "কন্টিনিউ রিডিং (Reading Progress)"}
          </Badge>
          {readingProgress && (
            <span className="text-xs text-muted-foreground">
              সর্বশেষ পঠিত: {formatDate(readingProgress.lastReadAt)}
            </span>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          {hasAccess
            ? isCompleted
              ? "অভিনন্দন! বইটি সম্পন্ন করেছেন"
              : isNewReader
              ? "পড়া শুরু করুন (Start Reading)"
              : "পড়া চালিয়ে যান (Continue Reading)"
            : "রিডিং প্রগ্রেস"}
        </CardTitle>
        <CardDescription>
          {hasAccess
            ? isCompleted
              ? "আপনি সফলভাবে বইটির সবগুলো পৃষ্ঠা পড়া শেষ করেছেন।"
              : isNewReader
              ? "প্রথম পৃষ্ঠা থেকে আপনার অনলাইন রিডিং জার্নি শুরু করুন।"
              : "আপনার সর্বশেষ অবস্থান স্বয়ংক্রিয়ভাবে সংরক্ষিত রয়েছে।"
            : "বইটি ক্রয় করার পর এখান থেকে আপনার রিডিং ট্র্যাকিং শুরু হবে।"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-sm font-medium">
            <span className="text-foreground">
              পৃষ্ঠা {currentPage} এর {totalPages} (Page {currentPage} of {totalPages})
            </span>
            <span
              className={`font-bold ${
                isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
              }`}
            >
              {percentage}% সম্পন্ন
            </span>
          </div>
          <Progress value={percentage} className="h-2.5" />
        </div>
      </CardContent>

      <CardFooter className="pt-1">
        {hasAccess ? (
          <Link
            href={`/reader/${bookSlug}${currentPage > 1 ? `?page=${currentPage}` : ""}`}
            className="w-full sm:w-auto"
          >
            <Button
              variant={isCompleted ? "gradient" : "default"}
              className="w-full sm:w-auto gap-2 font-medium"
            >
              {isCompleted ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  পুনরায় শুরু থেকে পড়ুন
                </>
              ) : isNewReader ? (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  পড়া শুরু করুন
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  পৃষ্ঠা {currentPage} থেকে পড়ুন
                </>
              )}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" disabled className="w-full sm:w-auto gap-2 opacity-60">
            <BookOpen className="h-4 w-4" />
            এক্সেস সক্রিয় হলে শুরু করুন
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
