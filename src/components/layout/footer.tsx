import Link from "next/link";
import { BookOpen, ShieldCheck, Heart, MessageSquare } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>নিরাপদ ডিজিটাল রিডার ও অটোমেটেড বুকমার্কিং সিস্টেম</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              প্রয়োজনীয় লিংক (Quick Links)
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/#about"
                  className="hover:text-primary transition-colors"
                >
                  বইয়ের সূচিপত্র (Contents)
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-primary transition-colors"
                >
                  পেমেন্ট নির্দেশিকা (Payment)
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors"
                >
                  ইউজার ড্যাশবোর্ড (Dashboard)
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors"
                >
                  নতুন একাউন্ট (Register)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              হেল্প ও সাপোর্ট (Support)
            </h4>
            <p className="text-sm text-muted-foreground">
              পেমেন্ট বা রিডারে যেকোনো সমস্যার ক্ষেত্রে মেসেঞ্জারে যোগাযোগ করুন:
            </p>
            <a
              href={siteConfig.links.messengerContact}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors border border-border"
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Messenger Support
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for Healthcare Professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
