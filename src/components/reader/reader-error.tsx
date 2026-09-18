"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

interface ReaderErrorProps {
  message?: string;
  onRetry?: () => void;
  isExpired?: boolean;
}

export function ReaderError({
  message = "বইটি লোড করা যাচ্ছে না। আবার চেষ্টা করুন।",
  onRetry,
  isExpired = false,
}: ReaderErrorProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[500px] p-4">
      <Card className="glass-card max-w-md w-full p-8 text-center space-y-5 shadow-xl border-destructive/20">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          {isExpired ? (
            <ShieldAlert className="h-8 w-8" />
          ) : (
            <AlertCircle className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
            {isExpired ? "রিডিং সেশনের মেয়াদ শেষ হয়েছে" : "বই লোডিং ত্রুটি"}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            {message}
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button
              variant="gradient"
              size="sm"
              onClick={onRetry}
              className="w-full sm:w-auto gap-2 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              আবার চেষ্টা করুন
            </Button>
          )}

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
