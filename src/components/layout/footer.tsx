import Link from "next/link";
import { BookOpen, MessageSquare, FileText } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-md py-6">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-foreground">
              {siteConfig.nameBn}
            </span>
            <span className="text-muted-foreground hidden md:inline">
              • {siteConfig.description}
            </span>
          </div>

          {/* Links: Rules, Messenger Contact, Copyright */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/rules"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>নিয়মাবলী / ব্যবহারবিধি</span>
            </Link>

            <a
              href={siteConfig.links.messengerContact}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span>যোগাযোগ (Support)</span>
            </a>

            <span>
              &copy; {new Date().getFullYear()} {siteConfig.nameBn}. সর্বস্বত্ব সংরক্ষিত।
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
