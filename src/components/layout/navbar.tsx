"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name (Neutral) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {siteConfig.nameBn}
            </span>
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              ({siteConfig.name})
            </span>
          </div>
        </Link>

        {/* Right Actions: Theme Toggle & User/Account Icon */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
