"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogIn, Lock, Mail, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { loginUserAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      toast.error("অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড সঠিকভাবে পূরণ করুন");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUserAction({
        email: email.toLowerCase().trim(),
        password,
      });

      if (!result.success) {
        setErrorMessage(
          result.error ||
            "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।"
        );
        toast.error("লগইন ব্যর্থ হয়েছে");
      } else {
        toast.success("সফলভাবে লগইন হয়েছে!");
        router.push(result.data?.redirectUrl || "/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setErrorMessage("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।");
      toast.error("লগইন ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-foreground">
            {siteConfig.nameBn}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {siteConfig.name}
          </span>
        </div>
      </Link>

      <Card className="w-full max-w-md glass-card border-border/80 relative z-10 shadow-2xl">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            একাউন্টে লগইন করুন
          </CardTitle>
          <CardDescription>
            বইটি পড়তে এবং আপনার রিডিং প্রগ্রেস দেখতে লগইন করুন
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">
                ইমেইল এড্রেস (Email)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  পাসওয়ার্ড (Password)
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="gradient"
              className="w-full gap-2 text-base font-semibold shadow-md shadow-teal-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  লগইন করুন
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              কোনো একাউন্ট নেই?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                নতুন একাউন্ট তৈরি করুন
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Trust & Support Contact */}
      <div className="mt-4 text-center z-10">
        <a
          href={siteConfig.links.messengerContact}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/60 cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
          <span>কোনো সমস্যা হচ্ছে? আমাদের সাথে যোগাযোগ করুন</span>
        </a>
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <span>← মূল পাতায় ফিরে যান</span>
      </Link>
    </div>
  );
}
