"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, UserPlus, Lock, Mail, User, AtSign, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { registerUserAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      toast.error("সবগুলো তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    if (username.length < 3) {
      setErrorMessage("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUserAction({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      if (!res.success) {
        setErrorMessage(res.error || "রেজিস্ট্রেশন সম্পন্ন করা যায়নি।");
        toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      } else {
        toast.success("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setErrorMessage("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।");
      toast.error("রেজিস্ট্রেশন ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {siteConfig.nameBn}
          </span>
        </div>
      </Link>

      <Card className="w-full max-w-md glass-card border-border/80 relative z-10 shadow-2xl">
        <CardHeader className="space-y-1.5 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 mx-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>মাত্র ১০০ টাকায় আজীবন এক্সেস</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            নতুন একাউন্ট তৈরি করুন
          </CardTitle>
          <CardDescription>
            নিচের ফর্মটি পূরণ করে আপনার রিডিং একাউন্ট খুলে নিন
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

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">
                পূর্ণ নাম (Full Name)
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Dr. Rafiqul Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium">
                ইউজারনেম (Username)
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="rafiq_doc"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                রিডারে সিকিউরিটি ওয়াটারমার্ক হিসেবে এই ইউজারনেম প্রদর্শিত হবে।
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">
                ইমেইল এড্রেস (Email Address)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="rafiq@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">
                পাসওয়ার্ড (Password - কমপক্ষে ৬ ডিজিট)
              </Label>
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
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  রেজিস্ট্রেশন সম্পন্ন করুন
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              ইতিমধ্যে একাউন্ট আছে?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                লগইন করুন
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Back to Home */}
      <Link
        href="/"
        className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <span>← মূল পাতায় ফিরে যান</span>
      </Link>
    </div>
  );
}
