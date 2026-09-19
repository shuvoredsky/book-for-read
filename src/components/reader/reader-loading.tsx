"use client";

import * as React from "react";
import { Loader2, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReaderLoadingProps {
  message?: string;
  progressText?: string;
  progressPercentage?: number | null;
}

export function ReaderLoading({
  message = "আপনার বইটি লোড হচ্ছে, একটু অপেক্ষা করুন...",
  progressText = "আপনার জন্য বইটির পৃষ্ঠাগুলো সুন্দরভাবে প্রস্তুত করা হচ্ছে...",
  progressPercentage = null,
}: ReaderLoadingProps) {
  const hasProgress = typeof progressPercentage === "number" && progressPercentage >= 0;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[500px] p-4 sm:p-6 animate-in fade-in duration-300">
      <Card className="glass-card max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border-primary/25 bg-card/90 backdrop-blur-md rounded-2xl">
        {/* Animated Icon Glow */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
            <BookOpen className="h-8 w-8 animate-pulse text-primary" />
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2.5 text-foreground font-bold text-base sm:text-lg">
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
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>বইটি প্রস্তুত হচ্ছে</span>
              </span>
              <span className="text-primary font-bold font-mono">
                {Math.min(100, Math.max(0, Math.round(progressPercentage!)))}% সম্পন্ন
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

        {/* Reassuring Security Footer Badge */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>নিরাপদ ও কপিরাইট-সুরক্ষিত ডিজিটাল সংস্করণ</span>
        </div>
      </Card>
    </div>
  );
}
