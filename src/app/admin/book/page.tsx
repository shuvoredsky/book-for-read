import { Metadata } from "next";
import { BookOpen, ShieldCheck, Database, HardDrive, FileText } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookPdfUploader } from "@/components/admin/book-pdf-uploader";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বই ও B2 স্টোরেজ ব্যবস্থাপনা (Book & B2 Storage)",
  description: "মেডিকেল বইয়ের তথ্য, মূল্য এবং Backblaze B2 অবজেক্ট কি ম্যানেজমেন্ট",
};

export default async function AdminBookPage() {
  // Fetch the current book record from Prisma
  const book = await prisma.book.findFirst({
    where: { slug: "medical-handbook" },
  });

  const currentObjectKey = book?.r2ObjectKey || siteConfig.book.r2ObjectKey || "books/medical-book.pdf";
  const totalPages = book?.totalPages || siteConfig.book.totalPages || 240;
  const bookTitle = book?.title || siteConfig.book.title;
  const bookPrice = book?.price ?? siteConfig.book.price;
  const isActive = book?.isActive ?? true;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            বই ও B2 স্টোরেজ ব্যবস্থাপনা (Book Settings)
          </h1>
          <p className="text-sm text-muted-foreground">
            মেডিকেল বইয়ের তথ্য, মূল্য (৳{bookPrice}), পৃষ্ঠা সংখ্যা এবং Backblaze B2 সুরক্ষিত স্টোরেজ আপলোড
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto border-primary/30 text-primary gap-1.5 py-1 px-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Backblaze B2 Vault
        </Badge>
      </div>

      {/* Book Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              বইয়ের নাম ও স্লাগ
            </CardDescription>
            <CardTitle className="text-base font-bold line-clamp-1">
              {bookTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Slug: <code className="font-mono text-primary">{book?.slug || "medical-handbook"}</code></span>
              <Badge variant={isActive ? "success" : "destructive"} className="text-[10px] px-1.5 py-0">
                {isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
              বর্তমান B2 অবজেক্ট কি (Object Key)
            </CardDescription>
            <CardTitle className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {currentObjectKey}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Private Backblaze B2 Bucket • S3-Compatible
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              পৃষ্ঠা ও মূল্য নির্ধারণ
            </CardDescription>
            <CardTitle className="text-base font-bold text-foreground">
              {totalPages} Pages • ৳{bookPrice} BDT
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              বইটির এককালীন অ্যাক্সেস মূল্য ৳১০০ টাকা
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Upload Module */}
      <BookPdfUploader
        currentObjectKey={currentObjectKey}
        totalPages={totalPages}
        bookTitle={bookTitle}
      />

      {/* Security Information Box */}
      <Card className="glass-card border-border/60 bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Backblaze B2 নিরাপত্তা ও প্রাইভেট এক্সেস পলিসি
          </CardTitle>
          <CardDescription className="text-xs">
            বইয়ের আসল পিডিএফ ফাইলটি কীভাবে সুরক্ষিত রাখা হয়:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong>প্রাইভেট বাকেট (Private Vault):</strong> Backblaze B2 বাকেটটি পুরোপুরি প্রাইভেট। বাকেটের সরাসরি পাবলিক লিঙ্ক ইন্টারনেটে উন্মুক্ত নয়।
            </li>
            <li>
              <strong>স্বল্পস্থায়ী সাইনড লিংক (Presigned URLs):</strong> শুধুমাত্র অনুমোদিত ও সক্রিয় BookAccess থাকা ব্যবহারকারীকে সাময়িক সময়ের (১০ মিনিট) জন্য ভিউয়ারের মাধ্যমে সাইনড টোকেন প্রদান করা হয়।
            </li>
            <li>
              <strong>ক্রেডেনশিয়াল আইসোলেশন:</strong> <code className="font-mono bg-muted px-1 rounded">B2_SECRET_ACCESS_KEY</code> এবং <code className="font-mono bg-muted px-1 rounded">B2_ACCESS_KEY_ID</code> শুধুমাত্র সার্ভার সাইডে এক্সিকিউট হয় এবং ব্রাউজারে কখনো দৃশ্যমান হয় না।
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
