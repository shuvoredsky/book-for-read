import Link from "next/link";
import { BookOpen, Play, CheckCircle2, Clock } from "lucide-react";
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
  const totalPages = readingProgress?.totalPages || totalBookPages || 240;
  const percentage = readingProgress
    ? Math.round(readingProgress.progressPercentage)
    : 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Clock className="h-3 w-3" />
            কন্টিনিউ রিডিং (Reading Progress)
          </Badge>
          {readingProgress && (
            <span className="text-xs text-muted-foreground">
              সর্বশেষ পঠিত: {formatDate(readingProgress.lastReadAt)}
            </span>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          {hasAccess ? "পড়া চালিয়ে যান (Continue Reading)" : "রিডিং প্রগ্রেস"}
        </CardTitle>
        <CardDescription>
          {hasAccess
            ? "আপনার সর্বশেষ অবস্থান স্বয়ংক্রিয়ভাবে সংরক্ষিত রয়েছে।"
            : "বইটি ক্রয় করার পর এখান থেকে আপনার রিডিং ট্র্যাকিং শুরু হবে।"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-sm font-medium">
            <span className="text-foreground">
              পৃষ্ঠা {currentPage} এর {totalPages} (Page {currentPage} of {totalPages})
            </span>
            <span className="text-primary font-bold">{percentage}% সম্পন্ন</span>
          </div>
          <Progress value={percentage} className="h-2.5" />
        </div>
      </CardContent>

      <CardFooter className="pt-1">
        {hasAccess ? (
          <Link href={`/reader/${bookSlug}?page=${currentPage}`} className="w-full sm:w-auto">
            <Button variant="default" className="w-full sm:w-auto gap-2 font-medium">
              <Play className="h-4 w-4 fill-current" />
              পৃষ্ঠা {currentPage} থেকে পড়ুন
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
