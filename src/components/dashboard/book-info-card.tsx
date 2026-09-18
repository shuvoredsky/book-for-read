import { ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

interface BookInfoCardProps {
  book: {
    title: string;
    description: string;
    price: number;
    totalPages: number;
  };
}

export function BookInfoCard({ book }: BookInfoCardProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/30 text-primary">
            বইয়ের বিবরণ (Book Information)
          </Badge>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ৳{book.price} BDT
          </span>
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          {book.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {book.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span>মোট পৃষ্ঠা: {book.totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>প্রটেক্টেড অনলাইন রিডার</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
            বিশেষ হাইলাইটস:
          </p>
          {siteConfig.book.highlights.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
