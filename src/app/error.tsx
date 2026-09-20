"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error client-side
    console.error("[Application Error]:", error?.message || error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-teal-500/5 rounded-full blur-3xl" />
      </div>

      <header className="p-4 sm:p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground font-bold text-base cursor-pointer">
          <span className="text-primary font-bold text-lg">{siteConfig.nameBn}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              সাময়িক যান্ত্রিক ত্রুটি
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              পৃষ্ঠাটি লোড করতে গিয়ে একটি সমস্যা হয়েছে। অনুগ্রহ করে পৃষ্ঠাটি পুনরায় রিলোড করে চেষ্টা করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              variant="gradient"
              size="default"
              className="w-full sm:w-auto gap-2 text-sm font-semibold rounded-xl cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              আবার চেষ্টা করুন
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="default"
                className="w-full sm:w-auto gap-2 text-sm font-semibold rounded-xl border-border/80 bg-background/60 hover:bg-background backdrop-blur-xs cursor-pointer"
              >
                <Home className="h-4 w-4" />
                হোমে যান
              </Button>
            </Link>
          </div>

          {/* Support Link */}
          <div className="pt-2">
            <a
              href={siteConfig.links.messengerContact}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <span>সমস্যা সমাধান না হলে ফেসবুকে যোগাযোগ করুন</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>

      <footer className="p-4 sm:p-6 text-center text-xs text-muted-foreground relative z-10 border-t border-border/40">
        <span>&copy; {new Date().getFullYear()} {siteConfig.nameBn}. সর্বস্বত্ব সংরক্ষিত।</span>
      </footer>
    </div>
  );
}
