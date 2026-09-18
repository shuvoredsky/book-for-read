import Link from "next/link";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface BookmarksCardProps {
  bookSlug: string;
  hasAccess: boolean;
  bookmarks: Array<{
    id: string;
    pageNumber: number;
    label: string | null;
    createdAt: Date;
  }>;
}

export function BookmarksCard({
  bookSlug,
  hasAccess,
  bookmarks,
}: BookmarksCardProps) {
  const maxBookmarks = 3;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Bookmark className="h-3 w-3" />
            বুকমার্কস (Bookmarks)
          </Badge>
          <Badge variant="secondary" className="text-xs font-mono">
            {bookmarks.length}/{maxBookmarks} টি সংরক্ষিত
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          আমার বুকমার্কসমূহ (My Bookmarks)
        </CardTitle>
        <CardDescription>
          গুরুত্বপূর্ণ পাতাগুলো দ্রুত খুঁজে পেতে বুকমার্ক ব্যবহার করুন (সর্বোচ্চ ৩টি)।
        </CardDescription>
      </CardHeader>

      <CardContent>
        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2 bg-muted/20">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bookmark className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              এখনও কোনো bookmark যুক্ত করা হয়নি
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              রিডারে পড়ার সময় ওপরের বুকমার্ক আইকনে ক্লিক করে যেকোনো গুরুত্বপূর্ণ পৃষ্ঠা বুকমার্ক করে রাখতে পারবেন।
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/30 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono font-semibold text-xs text-primary">
                      Page {bm.pageNumber}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {bm.label || `পৃষ্ঠা নম্বর ${bm.pageNumber}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    সংরক্ষণ: {formatDate(bm.createdAt)}
                  </p>
                </div>

                {hasAccess ? (
                  <Link href={`/reader/${bookSlug}?page=${bm.pageNumber}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
                      <span>জাম্প করুন</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    এক্সেস আবশ্যক
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
