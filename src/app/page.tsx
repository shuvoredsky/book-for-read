import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Bookmark,
  Clock,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  FileText,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { defaultTableOfContents } from "@/config/toc";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-background via-muted/30 to-background">
          {/* Subtle decorative background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline & CTA */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>ডিজিটাল সংস্করণ • মাত্র ১০০ টাকা</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                  মেডিকেল প্র্যাকটিস ও ক্লিনিক্যাল মেডিসিনের{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                    অপরিহার্য হ্যান্ডবুক
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  মেডিকেল শিক্ষার্থী, ইন্টার্ন ডক্টর এবং ক্লিনিক্যাল
                  প্র্যাকটিশনারদের জন্য ওয়ার্ড রাউন্ড, ইমার্জেন্সি ম্যানেজমেন্ট
                  ও প্র্যাকটিক্যাল কেস হ্যান্ডলিংয়ের এক অনন্য পূর্ণাঙ্গ গাইড।
                </p>

                {/* Pricing & Key Feature Callout */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">
                      ৳১০০
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ৳৩৫০
                    </span>
                    <Badge variant="success" className="ml-1">
                      ৭০% ছাড়
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (এককালীন পেমেন্টে আজীবন অনলাইন এক্সেস)
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full sm:w-auto gap-2 text-base shadow-xl shadow-teal-500/20"
                    >
                      বইটি পড়তে রেজিস্ট্রেশন করুন
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="#about" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      সূচিপত্র দেখুন
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">২৪০+ পৃষ্ঠা</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60">
                    <Smartphone className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">সব ডিভাইসে সাপোর্ট</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60">
                    <Bookmark className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">৩টি স্মার্ট বুকমার্ক</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">কন্টিনিউ রিডিং</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Book Showcase Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md">
                  {/* Decorative backdrop shadow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 rounded-3xl blur-2xl -rotate-3 transform" />

                  {/* 3D-effect Book Card */}
                  <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl">
                    <div className="relative aspect-[3/4] w-full rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 p-6 text-white flex flex-col justify-between overflow-hidden shadow-inner border border-white/10">
                      {/* Badge on book cover */}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30 backdrop-blur-md">
                          Clinical Edition
                        </Badge>
                        <span className="text-xs text-white/70 font-mono">
                          240 Pages
                        </span>
                      </div>

                      {/* Cover Title */}
                      <div className="space-y-2 my-auto text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                          <BookOpen className="h-6 w-6 text-emerald-300" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                          {siteConfig.book.title}
                        </h3>
                        <p className="text-sm text-emerald-200/90 font-medium">
                          {siteConfig.book.titleBn}
                        </p>
                      </div>

                      {/* Bottom details */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                        <span>Digital Protected Reader</span>
                        <span className="font-bold text-emerald-300">৳১০০ BDT</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground px-1">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        নিরাপদ ডিজিটাল রিডিং
                      </span>
                      <span>PDF.js প্রটেক্টেড ভিউয়ার</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 border-t border-border/60 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="border-primary/30 text-primary">
                এক্সক্লুসিভ রিডার ফিচার
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                আধুনিক ও সুবিধাজনক অনলাইন রিডিং অভিজ্ঞতা
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                যেকোনো ডিভাইসে তাৎক্ষণিক রিডিং, কোনো ভারী ফাইল ডাউনলোডের ঝামেলা ছাড়াই।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">রেসপন্সিভ মোবাইল রিডার</CardTitle>
                  <CardDescription>
                    স্মার্টফোন, ট্যাবলেট এবং ল্যাপটপে সহজে পড়ার জন্য তৈরি। টাচ জুম এবং অপ্টিমাইজড ভিউ।
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">স্মার্ট বুকমার্কিং (সর্বোচ্চ ৩টি)</CardTitle>
                  <CardDescription>
                    গুরুত্বপূর্ণ পৃষ্ঠাগুলো বুকমার্ক করে রাখুন এবং পরবর্তীতে এক ক্লিকেই জাম্প করুন।
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">কন্টিনিউ রিডিং ট্র্যাক</CardTitle>
                  <CardDescription>
                    যে পৃষ্ঠায় পড়া শেষ করেছেন, পরবর্তী লগইনে স্বয়ংক্রিয়ভাবে সেখান থেকেই শুরু করুন।
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <Search className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">স্মার্ট কিওয়ার্ড সার্চ ও TOC</CardTitle>
                  <CardDescription>
                    চ্যাপ্টার সূচিপত্র ও সার্চ অপশনের মাধ্যমে যেকোনো রোগ বা ড্রাগ সম্পর্কিত তথ্য দ্রুত খুঁজুন।
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 5 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">সুরক্ষিত ক্লাউডফ্লেয়ার R2 স্টোরেজ</CardTitle>
                  <CardDescription>
                    উচ্চগতির ক্লাউড সার্ভার থেকে দ্রুত ও নিরাপদে রেন্ডারিং সম্পন্ন হয়।
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 6 */}
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">সহজ বিকাশ/নগদ পেমেন্ট</CardTitle>
                  <CardDescription>
                    ম্যানুয়াল ট্রানজেকশন সাবমিট করার পর দ্রুত এডমিন ভেরিফিকেশন ও এক্সেস অ্যাক্টিভেশন।
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* TABLE OF CONTENTS PREVIEW */}
        <section id="about" className="py-20 border-t border-border/60">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  সূচিপত্র ওভারভিউ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  বইটিতে যে প্রধান বিষয়গুলো অন্তর্ভুক্ত রয়েছে
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  বইটি বিশেষভাবে বাংলাদেশের ক্লিনিক্যাল ওয়ার্ড ও ইমার্জেন্সি
                  প্র্যাকটিসের বাস্তব প্রেক্ষাপটের আলোকে রচিত।
                </p>

                <div className="pt-4 space-y-2.5">
                  {siteConfig.book.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="gradient" className="gap-2">
                      সম্পূর্ণ বইটি পড়তে শুরু করুন
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {defaultTableOfContents.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted/30 transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-semibold text-foreground">
                        {chapter.title}
                      </h4>
                      {chapter.titleBn && (
                        <p className="text-xs text-muted-foreground">
                          {chapter.titleBn}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      Page {chapter.page}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO BUY / PAYMENT STEPS */}
        <section id="pricing" className="py-20 border-t border-border/60 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="border-primary/30 text-primary">
                সহজ ৪ ধাপের ক্রয় প্রক্রিয়া
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                কীভাবে বইটি সংগ্রহ করবেন?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                পেমেন্ট সম্পন্ন করে কয়েক মিনিটের মধ্যেই আপনার একাউন্টে বইয়ের এক্সেস গ্রহণ করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative rounded-2xl bg-card border border-border p-6 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  ১
                </div>
                <h3 className="font-semibold text-foreground">রেজিস্ট্রেশন করুন</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  আপনার নাম, ইমেইল এবং পাসওয়ার্ড দিয়ে একটি ফ্রি একাউন্ট তৈরি করুন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl bg-card border border-border p-6 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  ২
                </div>
                <h3 className="font-semibold text-foreground">১০০ টাকা পেমেন্ট</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  বিকাশ, নগদ বা রকেটে ১০০ টাকা সেন্ড মানি বা পেমেন্ট করুন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl bg-card border border-border p-6 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  ৩
                </div>
                <h3 className="font-semibold text-foreground">তথ্য সাবমিট</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ড্যাশবোর্ডে ট্রানজেকশন আইডি এবং আপনার প্রেরক নম্বর সাবমিট করুন।
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-2xl bg-card border border-border p-6 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  ৪
                </div>
                <h3 className="font-semibold text-foreground">বই পড়া শুরু করুন</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  এডমিন ভেরিফিকেশন সম্পন্ন হলে সরাসরি রিডারে বই পড়া শুরু করুন।
                </p>
              </div>
            </div>

            {/* Need Help Box */}
            <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-foreground">
                  পেমেন্ট সংক্রান্ত যেকোনো তথ্যের জন্য যোগাযোগ করুন
                </h4>
                <p className="text-xs text-muted-foreground">
                  আমাদের অফিসিয়াল ফেসবুক পেইজ বা মেসেঞ্জারে সার্বক্ষণিক সহায়তা প্রদান করা হয়।
                </p>
              </div>
              <a
                href={siteConfig.links.messengerContact}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2 shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  পেমেন্ট করতে মেসেঞ্জারে নক দিন
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 border-t border-border/60">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <Badge variant="outline" className="border-primary/30 text-primary">
                সাধারণ জিজ্ঞাসা
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
              </h2>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    আমি কি বইটি অফলাইনে ডাউনলোড করতে পারব?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground pt-0">
                  না, এটি একটি ডিজিটাল সুরক্ষিত সংস্করণ যা আমাদের হাই-স্পিড অনলাইন
                  রিডারের মাধ্যমে যেকোনো মোবাইল, ট্যাবলেট বা কম্পিউটারে নিরবচ্ছিন্নভাবে পড়া যায়।
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    পেমেন্ট সাবমিট করার পর কতক্ষণে এক্সেস দেওয়া হয়?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground pt-0">
                  সাধারণত ট্রানজেকশন সাবমিট করার ১০ থেকে ৩০ মিনিটের মধ্যে এডমিন
                  ভেরিফিকেশন সম্পন্ন করে এক্সেস চালু করে দেন।
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    বুকমার্ক সিস্টেম কীভাবে কাজ করে?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground pt-0">
                  আপনি সর্বোচ্চ ৩টি গুরুত্বপূর্ণ পাতা বুকমার্ক করে রাখতে পারবেন এবং যেকোনো সময় তা ডিলিট বা পরিবর্তন করতে পারবেন।
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="py-16 border-t border-border/60 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30">
          <div className="container mx-auto max-w-5xl px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              আপনার ক্লিনিক্যাল প্র্যাকটিসকে আরও দক্ষ ও আত্মবিশ্বাসী করুন
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              মাত্র ১০০ টাকায় আজই আপনার ডিজিটাল এক্সেস সক্রিয় করুন।
            </p>
            <div className="pt-2">
              <Link href="/register">
                <Button variant="gradient" size="lg" className="gap-2 shadow-xl shadow-teal-500/20">
                  এখনই রেজিস্টার করে এক্সেস নিন (৳১০০)
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
