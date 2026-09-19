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
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  ArrowUpRight,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BookmarkItem } from "@/types";

interface ReaderToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  isFullscreen: boolean;
  bookmarks: BookmarkItem[];
  isCurrentPageBookmarked: boolean;
  isBookmarking?: boolean;
  isTocOpen?: boolean;
  isSearchOpen?: boolean;
  onPageChange: (newPage: number) => void;
  onToggleBookmark: () => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitWidth: () => void;
  onToggleFullscreen: () => void;
  onOpenToc?: () => void;
  onOpenSearch?: () => void;
}

export function ReaderToolbar({
  currentPage,
  totalPages,
  scale,
  isFullscreen,
  bookmarks,
  isCurrentPageBookmarked,
  isBookmarking = false,
  isTocOpen = false,
  isSearchOpen = false,
  onPageChange,
  onToggleBookmark,
  onDeleteBookmark,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onToggleFullscreen,
  onOpenToc,
  onOpenSearch,
}: ReaderToolbarProps) {
  const [pageInput, setPageInput] = React.useState(currentPage.toString());
  const [prevPage, setPrevPage] = React.useState(currentPage);

  // Synchronize local input during render when currentPage prop changes
  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    setPageInput(currentPage.toString());
  }

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
  const maxBookmarks = 3;

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="w-full z-20 glass-card sticky top-2 sm:top-3 rounded-2xl border border-border/80 shadow-md backdrop-blur-xl bg-background/90 px-2 sm:px-3 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2"
        role="toolbar"
        aria-label="PDF রিডার টুলবার"
      >
        {/* Left Section: Page Navigation, TOC & Search */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Table of Contents Trigger (Phase 14) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isTocOpen ? "secondary" : "ghost"}
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 ${
                  isTocOpen
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="সূচিপত্র (TOC)"
                onClick={onOpenToc}
              >
                <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">সূচিপত্র (TOC)</TooltipContent>
          </Tooltip>

          {/* In-Book Text Search Trigger (Phase 15) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isSearchOpen ? "secondary" : "ghost"}
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 ${
                  isSearchOpen
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="বইয়ে খুঁজুন (Ctrl+F)"
                onClick={onOpenSearch}
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">বইয়ে খুঁজুন (Ctrl+F)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-[1px] bg-border mx-0.5" />

          {/* Previous Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isFirstPage}
                aria-label="পূর্ববর্তী পৃষ্ঠা (ArrowLeft)"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">পূর্ববর্তী পৃষ্ঠা (←)</TooltipContent>
          </Tooltip>

          {/* Page Input Form */}
          <form onSubmit={handlePageSubmit} className="flex items-center gap-1 sm:gap-1.5">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              className="h-7 w-10 sm:w-12 text-center text-xs font-mono font-bold px-1 py-0"
              aria-label="বর্তমান পৃষ্ঠা নম্বর লিখুন"
            />
            <span className="text-[11px] sm:text-xs text-muted-foreground font-mono whitespace-nowrap">
              / {totalPages || "..."}
            </span>
          </form>

          {/* Next Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage}
                aria-label="পরবর্তী পৃষ্ঠা (ArrowRight)"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">পরবর্তী পৃষ্ঠা (→)</TooltipContent>
          </Tooltip>
        </div>

        {/* Center / Right Section: Bookmarks, Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Bookmark Current Page Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCurrentPageBookmarked ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium ${
                  isCurrentPageBookmarked
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={onToggleBookmark}
                disabled={isBookmarking}
                aria-label={
                  isCurrentPageBookmarked
                    ? "পৃষ্ঠাটি বুকমার্ক করা আছে"
                    : "বর্তমান পৃষ্ঠা বুকমার্ক করুন"
                }
              >
                {isBookmarking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isCurrentPageBookmarked ? (
                  <BookmarkCheck className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <BookmarkPlus className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isCurrentPageBookmarked ? "Bookmarked" : "Bookmark"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isCurrentPageBookmarked
                ? `পৃষ্ঠা ${currentPage} বুকমার্ক করা আছে`
                : bookmarks.length >= maxBookmarks
                ? "সর্বোচ্চ ৩টি বুকমার্ক পূর্ণ হয়েছে"
                : `পৃষ্ঠা ${currentPage} বুকমার্ক করুন`}
            </TooltipContent>
          </Tooltip>

          {/* Bookmarks List Dropdown Panel */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 px-1.5 sm:px-2 gap-1 text-xs text-muted-foreground hover:text-foreground relative"
                    aria-label="সংরক্ষিত বুকমার্ক তালিকা দেখুন"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <Badge
                      variant="secondary"
                      className="px-1 py-0 text-[10px] font-mono h-4 min-w-[16px] justify-center"
                    >
                      {bookmarks.length}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">সংরক্ষিত বুকমার্ক ({bookmarks.length}/3)</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-64 p-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <DropdownMenuLabel className="p-0 text-xs font-bold text-foreground">
                  আমার বুকমার্কস
                </DropdownMenuLabel>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {bookmarks.length}/{maxBookmarks} টি ব্যবহৃত
                </span>
              </div>
              <DropdownMenuSeparator />

              {bookmarks.length === 0 ? (
                <div className="py-4 px-2 text-center space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">কোনো বুকমার্ক নেই</p>
                  <p className="text-[11px]">
                    যেকোনো পৃষ্ঠা বুকমার্ক করতে ওপরে Bookmark বাটনে ক্লিক করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/60 transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => onPageChange(bm.pageNumber)}
                        className="flex items-center gap-2 text-left flex-1 truncate py-0.5"
                      >
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-1.5 py-0 shrink-0 text-primary border-primary/30"
                        >
                          P. {bm.pageNumber}
                        </Badge>
                        <span className="text-xs text-foreground font-medium truncate">
                          {bm.label || `পৃষ্ঠা ${bm.pageNumber}`}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-primary hover:bg-primary/10"
                          onClick={() => onPageChange(bm.pageNumber)}
                          aria-label={`পৃষ্ঠা ${bm.pageNumber}-এ জাম্প করুন`}
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteBookmark(bm.id)}
                          aria-label={`পৃষ্ঠা ${bm.pageNumber} বুকমার্ক মুছুন`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-[1px] bg-border mx-0.5" />

          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={onZoomOut}
                disabled={scale <= 0.5}
                aria-label="জুম আউট (Zoom Out)"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                className="h-7 sm:h-8 px-1 sm:px-2 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground"
                onClick={onResetZoom}
                aria-label="জুম রিসেট (100%)"
              >
                {zoomPercentage}%
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">জুম রিসেট (Fit to Screen)</TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={onZoomIn}
                disabled={scale >= 2.5}
                aria-label="জুম ইন (Zoom In)"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                className="h-7 w-7 sm:h-8 sm:w-8 hidden xs:inline-flex"
                onClick={onFitWidth}
                aria-label="স্ক্রিন অনুযায়ী ফিট করুন (Fit Width)"
              >
                <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={onToggleFullscreen}
                aria-label={isFullscreen ? "ফুলস্ক্রিন থেকে বের হন" : "ফুলস্ক্রিন মোড"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
