"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ListOrdered,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReaderToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  isFullscreen: boolean;
  onPageChange: (newPage: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitWidth: () => void;
  onToggleFullscreen: () => void;
}

export function ReaderToolbar({
  currentPage,
  totalPages,
  scale,
  isFullscreen,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onToggleFullscreen,
}: ReaderToolbarProps) {
  const [pageInput, setPageInput] = React.useState(currentPage.toString());

  // Synchronize local input with prop changes
  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput.trim(), 10);

    if (isNaN(parsed) || parsed < 1 || parsed > totalPages) {
      toast.error(`অনুগ্রহ করে ১ থেকে ${totalPages}-এর মধ্যে একটি সঠিক পৃষ্ঠা নম্বর দিন।`);
      setPageInput(currentPage.toString());
      return;
    }

    if (parsed !== currentPage) {
      onPageChange(parsed);
    }
  };

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const zoomPercentage = Math.round(scale * 100);

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="w-full z-20 glass-card sticky top-3 rounded-2xl border border-border/80 shadow-md backdrop-blur-xl bg-background/85 px-3 py-2 flex flex-wrap items-center justify-between gap-2"
        role="toolbar"
        aria-label="PDF রিডার টুলবার"
      >
        {/* Left Section: Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Table of Contents Placeholder */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="সূচিপত্র (TOC)"
                onClick={() => toast.info("চ্যাপ্টার সূচিপত্র মডিউল পরবর্তী ফেজে যুক্ত হবে।")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">সূচিপত্র (TOC)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-[1px] bg-border mx-0.5" />

          {/* Previous Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isFirstPage}
                aria-label="পূর্ববর্তী পৃষ্ঠা (ArrowLeft)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">পূর্ববর্তী পৃষ্ঠা (←)</TooltipContent>
          </Tooltip>

          {/* Page Input Form */}
          <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              className="h-7 w-12 text-center text-xs font-mono font-bold px-1 py-0"
              aria-label="বর্তমান পৃষ্ঠা নম্বর লিখুন"
            />
            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
              / {totalPages || "..."}
            </span>
          </form>

          {/* Next Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage}
                aria-label="পরবর্তী পৃষ্ঠা (ArrowRight)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">পরবর্তী পৃষ্ঠা (→)</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section: Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomOut}
                disabled={scale <= 0.5}
                aria-label="জুম আউট (Zoom Out)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">জুম আউট (-)</TooltipContent>
          </Tooltip>

          {/* Zoom Level Indicator / Reset */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground"
                onClick={onResetZoom}
                aria-label="জুম রিসেট (100%)"
              >
                {zoomPercentage}%
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">জুম রিসেট (100%)</TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomIn}
                disabled={scale >= 2.5}
                aria-label="জুম ইন (Zoom In)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">জুম ইন (+)</TooltipContent>
          </Tooltip>

          {/* Fit Width */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden xs:inline-flex"
                onClick={onFitWidth}
                aria-label="স্ক্রিন অনুযায়ী ফিট করুন (Fit Width)"
              >
                <ScanLine className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Fit Width</TooltipContent>
          </Tooltip>

          <div className="h-4 w-[1px] bg-border mx-0.5" />

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFullscreen}
                aria-label={isFullscreen ? "ফুলস্ক্রিন থেকে বের হন" : "ফুলস্ক্রিন মোড"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-primary" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
