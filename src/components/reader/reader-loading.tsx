"use client";

import * as React from "react";
import { Loader2, BookOpen, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReaderLoadingProps {
  message?: string;
  progressText?: string;
}

export function ReaderLoading({
  message = "বইটি লোড হচ্ছে...",
  progressText = "সুরক্ষিত স্টোরেজ থেকে পিডিএফ ডেটা স্ট্রিম হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
}: ReaderLoadingProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[600px] p-6">
      <Card className="glass-card max-w-md w-full p-8 text-center space-y-6 shadow-xl border-primary/20">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          {/* Pulsing glow circle */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-primary/30 flex items-center justify-center text-primary">
            <BookOpen className="h-8 w-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-foreground font-bold text-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <h3>{message}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {progressText}
          </p>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>S3-Compatible Secure Stream Engine</span>
        </div>
      </Card>
    </div>
  );
}
