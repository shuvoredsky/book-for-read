"use client";

import * as React from "react";
import { Loader2, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReaderLoadingProps {
  message?: string;
  progressText?: string;
  progressPercentage?: number | null;
  loadedMb?: string | null;
  totalMb?: string | null;
}

export function ReaderLoading({
  message = "বইটি লোড হচ্ছে...",
  progressText = "সুরক্ষিত স্টোরেজ থেকে বইয়ের পাতাগুলো প্রস্তুত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
  progressPercentage = null,
  loadedMb = null,
  totalMb = null,
}: ReaderLoadingProps) {
  const hasProgress = typeof progressPercentage === "number" && progressPercentage >= 0;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[550px] p-4 sm:p-6 animate-in fade-in duration-300">
      <Card className="glass-card max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border-primary/25 bg-card/85 backdrop-blur-md rounded-2xl">
        {/* Animated Icon Glow */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
            <BookOpen className="h-8 w-8 animate-pulse text-primary" />
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2.5 text-foreground font-bold text-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <h3 className="tracking-tight">{message}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {progressText}
          </p>
        </div>

        {/* Download Progress Bar */}
        {hasProgress && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono font-medium">
              <span className="text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                {loadedMb && totalMb ? `${loadedMb} MB / ${totalMb} MB` : "ডাউনলোড হচ্ছে..."}
              </span>
              <span className="text-primary font-bold">
                {Math.min(100, Math.max(0, Math.round(progressPercentage!)))}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary rounded-full transition-all duration-200 ease-out shadow-sm"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercentage!))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Security Footer Badge */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>প্রোটেক্টেড ইন-মেমোরি এনক্রিপ্টেড রিডার</span>
        </div>
      </Card>
    </div>
  );
}
