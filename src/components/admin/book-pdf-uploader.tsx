"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { uploadBookPdfAction } from "@/server/actions/admin-book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookPdfUploaderProps {
  currentObjectKey: string;
  totalPages: number;
  bookTitle: string;
}

export function BookPdfUploader({
  currentObjectKey,
  totalPages,
  bookTitle,
}: BookPdfUploaderProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [customKey, setCustomKey] = React.useState(currentObjectKey || "books/medical-book.pdf");
  const [pagesCount, setPagesCount] = React.useState(totalPages.toString());
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("শুধুমাত্র .pdf ফরম্যাটের ফাইল গ্রহণযোগ্য");
      setSelectedFile(null);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      setErrorMessage(`ফাইলের সাইজ (${fileSizeMB.toFixed(1)} MB) নির্ধারিত ১০০ মেগাবাইট সীমার চেয়ে বড়।`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("অনুগ্রহ করে একটি পিডিএফ ফাইল নির্বাচন করুন");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);
      formData.append("customObjectKey", customKey.trim());
      formData.append("totalPages", pagesCount);

      const res = await uploadBookPdfAction(formData);

      if (!res.success) {
        setErrorMessage(res.error || "আপলোড সম্পন্ন করা যায়নি");
        toast.error("আপলোড ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "পিডিএফ সফলভাবে আপলোড হয়েছে!");
        setSelectedFile(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("সার্ভারের সাথে সংযোগে সমস্যা হয়েছে");
      toast.error("সার্ভার ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Backblaze B2 স্টোরেজ আপলোড
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            S3-Compatible Private Vault
          </span>
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          মেডিকেল বই PDF আপলোড ও পরিবর্তন
        </CardTitle>
        <CardDescription>
          সুরক্ষিত ব্যাকব্লেজ B2 বাকেটে বইয়ের পিডিএফ ফাইলটি আপলোড করুন। ফাইলটি কোনোভাবেই পাবলিক থাকবে না।
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleUpload}>
        <CardContent className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Object Key Info */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-primary" />
                বর্তমান B2 অবজেক্ট কি (Object Key):
              </span>
              <span className="font-mono font-bold text-primary">{currentObjectKey || "Not uploaded yet"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">বইয়ের শিরোনাম:</span>
              <span className="font-semibold text-foreground">{bookTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">নির্ধারিত পৃষ্ঠা সংখ্যা:</span>
              <span className="font-bold text-foreground">{totalPages} Pages</span>
            </div>
          </div>

          {/* File Picker */}
          <div className="space-y-2">
            <Label htmlFor="pdfFile" className="text-xs font-semibold">
              নতুন PDF ফাইল নির্বাচন করুন (.pdf - সর্বোচ্চ 100MB) *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="text-xs cursor-pointer"
              />
            </div>
            {selectedFile && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <FileText className="h-3.5 w-3.5" />
                নির্বাচিত ফাইল: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Custom Key & Total Pages Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customKey" className="text-xs font-medium text-muted-foreground">
                B2 Object Key (পাথ ও ফাইলের নাম)
              </Label>
              <Input
                id="customKey"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                disabled={isLoading}
                placeholder="books/medical-book.pdf"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pagesCount" className="text-xs font-medium text-muted-foreground">
                মোট পৃষ্ঠা সংখ্যা (Total Pages)
              </Label>
              <Input
                id="pagesCount"
                type="number"
                value={pagesCount}
                onChange={(e) => setPagesCount(e.target.value)}
                disabled={isLoading}
                placeholder="240"
                className="text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>সিক্রেট কি বা পাসওয়ার্ড ব্রাউজারে উন্মুক্ত হয় না</span>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="sm"
            disabled={isLoading || !selectedFile}
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                B2-তে আপলোড হচ্ছে...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                ফাইল আপলোড নিশ্চিত করুন
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
