import Link from "next/link";
import { BookOpen, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <header className="p-4 sm:p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground font-bold text-base cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <span>{siteConfig.nameBn}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>৪০৪ - পেজটি পাওয়া যায়নি</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              কাঙ্ক্ষিত পৃষ্ঠাটি পাওয়া যায়নি
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো স্থানান্তরিত হয়েছে অথবা লিংকটিতে কোনো ভুল রয়েছে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="gradient" size="default" className="w-full sm:w-auto gap-2 text-sm font-semibold rounded-xl cursor-pointer">
                <Home className="h-4 w-4" />
                হোমপেজে ফিরে যান
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 text-sm font-semibold rounded-xl border-border/80 bg-background/60 hover:bg-background backdrop-blur-xs cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                ড্যাশবোর্ডে যান
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 sm:p-6 text-center text-xs text-muted-foreground relative z-10 border-t border-border/40">
        <span>&copy; {new Date().getFullYear()} {siteConfig.nameBn}. সর্বস্বত্ব সংরক্ষিত।</span>
      </footer>
    </div>
  );
}
