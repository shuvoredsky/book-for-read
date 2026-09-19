"use client";

import * as React from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ListOrdered,
  Search,
} from "lucide-react";
import { getBookReadUrlAction } from "@/server/actions/reader";
import {
  getReadingProgressAction,
  saveReadingProgressAction,
} from "@/server/actions/progress";
import {
  getBookmarksAction,
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/server/actions/bookmark";
import { Button } from "@/components/ui/button";
import { ReaderToolbar } from "./reader-toolbar";
import { PdfPage } from "./pdf-page";
import { ReaderLoading } from "./reader-loading";
import { ReaderError } from "./reader-error";
import { ReaderToc } from "./reader-toc";
import { ReaderSearch } from "./reader-search";
import { extractTableOfContents } from "@/lib/pdf-outline";
import type { TocItem } from "@/config/toc";
import type { BookmarkItem } from "@/types";

// Configure PDF.js Web Worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfReaderProps {
  bookSlug: string;
  bookTitle: string;
  initialTotalPages: number;
  initialPage?: number;
  userWatermark: {
    username: string;
    displayName?: string;
    email?: string;
  };
}

export function PdfReader({
  bookSlug,
  bookTitle,
  initialTotalPages = 384,
  initialPage = 1,
  userWatermark,
}: PdfReaderProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSavedPageRef = React.useRef<number>(initialPage);
  const pdfDocRef = React.useRef<PDFDocumentProxy | null>(null);

  const [pdfDoc, setPdfDoc] = React.useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(
    Math.max(1, Math.min(initialPage, initialTotalPages))
  );
  const [totalPages, setTotalPages] = React.useState<number>(initialTotalPages);
  const [userZoom, setUserZoom] = React.useState<number>(1.0);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [unscaledPageSize, setUnscaledPageSize] = React.useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = React.useState<string>("আপনার বইটি লোড হচ্ছে, একটু অপেক্ষা করুন...");
  const [downloadProgress, setDownloadProgress] = React.useState<{
    percentage: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  // Bookmark State
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([]);
  const [isBookmarking, setIsBookmarking] = React.useState<boolean>(false);

  // TOC and Search States
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = React.useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const textCacheRef = React.useRef<Map<number, string>>(new Map());

  // 1. Fetch saved progress, bookmarks, and stream PDF bytes into browser memory
  const initializeReader = React.useCallback(
    async (isRetry: boolean = false) => {
      setIsLoading(true);
      setError(null);
      setIsExpired(false);
      setDownloadProgress(null);
      setLoadingMessage(
        isRetry
          ? "আপনার রিডিং সেশন রিফ্রেশ করা হচ্ছে..."
          : "আপনার বইটি লোড হচ্ছে, একটু অপেক্ষা করুন..."
      );

      try {
        // Fetch presigned URL, reading progress, and bookmarks in parallel
        const [urlRes, progressRes, bookmarksRes] = await Promise.all([
          getBookReadUrlAction(bookSlug),
          getReadingProgressAction(bookSlug),
          getBookmarksAction(bookSlug),
        ]);

        if (!urlRes.success || !urlRes.data) {
          setError(
            urlRes.error || "বইয়ের এক্সেস নিশ্চিত করা যায়নি। অনুগ্রহ করে ড্যাশবোর্ড চেক করুন।"
          );
          setIsLoading(false);
          return;
        }

        // Set bookmarks if available
        if (bookmarksRes.success && bookmarksRes.data) {
          setBookmarks(bookmarksRes.data);
        }

        // Determine starting page: explicit initialPage > saved progress > 1
        if (initialPage && initialPage > 1) {
          setCurrentPage(initialPage);
          lastSavedPageRef.current = initialPage;
        } else if (progressRes.success && progressRes.data && progressRes.data.currentPage > 1) {
          setCurrentPage(progressRes.data.currentPage);
          lastSavedPageRef.current = progressRes.data.currentPage;
        }

        const signedUrl = urlRes.data.presignedUrl;

        // Stream PDF binary directly into browser memory with progress tracking
        setLoadingMessage("আপনার জন্য বইটি প্রস্তুত করা হচ্ছে...");
        const response = await fetch(signedUrl, { credentials: "include" });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("বইটির এক্সেস পাওয়া যায়নি। অনুগ্রহ করে আপনার অ্যাকাউন্ট ভেরিফাই করুন।");
          } else {
            setError(`বইটি লোড করতে সমস্যা হয়েছে (ত্রুটি কোড: ${response.status})।`);
          }
          setIsLoading(false);
          return;
        }

        const contentLengthHeader = response.headers.get("content-length");
        const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        if (!response.body) {
          throw new Error("ReadableStream is not supported by this browser environment.");
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loadedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loadedBytes += value.length;

            if (totalBytes > 0) {
              const percentage = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
              setDownloadProgress({
                percentage,
              });
            }
          }
        }

        // Combine chunks into a contiguous in-memory Uint8Array (memory-only, not persisted to disk)
        const pdfData = new Uint8Array(loadedBytes);
        let offset = 0;
        for (const chunk of chunks) {
          pdfData.set(chunk, offset);
          offset += chunk.length;
        }

        setLoadingMessage("বইয়ের পৃষ্ঠাগুলো সাজানো হচ্ছে...");

        // Initialize PDF.js Document with in-memory buffer
        const loadingTask = pdfjsLib.getDocument({
          data: pdfData,
          useSystemFonts: true,
        });

        const doc = await loadingTask.promise;

        pdfDocRef.current = doc;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);

        // Pre-fetch initial unscaled dimensions once for immediate responsive layout calculation
        try {
          const firstPage = await doc.getPage(1);
          const v1 = firstPage.getViewport({ scale: 1.0 });
          setUnscaledPageSize({ width: v1.width, height: v1.height });
          firstPage.cleanup();
        } catch {
          // Fallback to default A4
        }

        setIsLoading(false);

        // Extract document outline/TOC asynchronously
        extractTableOfContents(doc)
          .then((items) => setTocItems(items))
          .catch((err) => console.warn("[PdfReader] Outline extraction error:", err));

        if (isRetry) {
          toast.success("রিডিং সেশন সফলভাবে নবায়ন হয়েছে!");
        }
      } catch (err: unknown) {
        console.error("[PdfReader Init Error]:", err);
        const errMessage = String(err);

        if (
          errMessage.includes("403") ||
          errMessage.includes("AccessDenied") ||
          errMessage.includes("Expired")
        ) {
          setIsExpired(true);
          setError("রিডিং সেশনের মেয়াদ শেষ হয়েছে। আবার চেষ্টা বাটনে ক্লিক করে নতুন লিংক নিন।");
        } else {
          setError("বইটি লোড করা যাচ্ছে না। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
        }
        setIsLoading(false);
      }
    },
    [bookSlug, initialPage]
  );

  React.useEffect(() => {
    initializeReader();

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy().catch(() => {});
      }
    };
  }, [initializeReader]);

  // 2. Centralized Page Change Handler with Debounced Progress Auto-Save
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;

      // Update UI state immediately
      setCurrentPage(newPage);

      // Scroll viewport back to top smoothly
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Clear any pending debounced save timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      // Schedule debounced server-side progress save (600ms)
      saveTimerRef.current = setTimeout(async () => {
        try {
          lastSavedPageRef.current = newPage;
          await saveReadingProgressAction({
            bookSlug,
            currentPage: newPage,
            totalPages,
          });
        } catch (err) {
          console.error("[Debounced Progress Save Error]:", err);
        }
      }, 600);
    },
    [bookSlug, totalPages]
  );

  // Flush pending progress save on unmount / navigation away
  React.useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, []);

  // 3. Bookmark Management Handlers
  const isCurrentPageBookmarked = React.useMemo(() => {
    return bookmarks.some((bm) => bm.pageNumber === currentPage);
  }, [bookmarks, currentPage]);

  const handleToggleBookmark = React.useCallback(async () => {
    const existingBookmark = bookmarks.find((bm) => bm.pageNumber === currentPage);

    if (existingBookmark) {
      // Delete existing bookmark for current page
      const previousBookmarks = [...bookmarks];
      setBookmarks((prev) => prev.filter((bm) => bm.id !== existingBookmark.id));

      try {
        const res = await deleteBookmarkAction({ bookmarkId: existingBookmark.id });
        if (!res.success) {
          setBookmarks(previousBookmarks);
          toast.error(res.error || "বুকমার্ক মুছতে সমস্যা হয়েছে");
        } else {
          toast.success(`পৃষ্ঠা ${currentPage} বুকমার্ক থেকে সরানো হয়েছে`);
        }
      } catch {
        setBookmarks(previousBookmarks);
        toast.error("সার্ভারে সমস্যা হয়েছে");
      }
    } else {
      // Enforce 3 bookmark limit
      if (bookmarks.length >= 3) {
        toast.error("আপনি সর্বোচ্চ ৩টি bookmark রাখতে পারবেন।");
        return;
      }

      setIsBookmarking(true);
      const tempId = `temp-${Date.now()}`;
      const optimisticBookmark: BookmarkItem = {
        id: tempId,
        pageNumber: currentPage,
        label: `পৃষ্ঠা ${currentPage}`,
        createdAt: new Date(),
      };

      setBookmarks((prev) => [...prev, optimisticBookmark]);

      try {
        const res = await createBookmarkAction({
          bookSlug,
          pageNumber: currentPage,
          label: `পৃষ্ঠা ${currentPage}`,
        });

        if (!res.success || !res.data) {
          setBookmarks((prev) => prev.filter((bm) => bm.id !== tempId));
          toast.error(res.error || "বুকমার্ক যোগ করা সম্ভব হয়নি");
        } else {
          setBookmarks((prev) =>
            prev.map((bm) => (bm.id === tempId ? res.data! : bm))
          );
          toast.success(res.message || `পৃষ্ঠা ${currentPage} বুকমার্ক করা হয়েছে!`);
        }
      } catch {
        setBookmarks((prev) => prev.filter((bm) => bm.id !== tempId));
        toast.error("সার্ভার ত্রুটি");
      } finally {
        setIsBookmarking(false);
      }
    }
  }, [bookSlug, bookmarks, currentPage]);

  const handleDeleteBookmark = React.useCallback(
    async (bookmarkId: string) => {
      const target = bookmarks.find((bm) => bm.id === bookmarkId);
      const previousBookmarks = [...bookmarks];

      setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));

      try {
        const res = await deleteBookmarkAction({ bookmarkId });
        if (!res.success) {
          setBookmarks(previousBookmarks);
          toast.error(res.error || "বুকমার্ক মুছতে ব্যর্থ হয়েছে");
        } else {
          toast.success(
            target
              ? `পৃষ্ঠা ${target.pageNumber} বুকমার্ক মোছা হয়েছে`
              : "বুকমার্ক মুছে ফেলা হয়েছে"
          );
        }
      } catch {
        setBookmarks(previousBookmarks);
        toast.error("সার্ভারের সাথে যোগাযোগে ত্রুটি ঘটেছে");
      }
    },
    [bookmarks]
  );

  // Dynamic Responsive Container Width Measurement & Observer
  const updateContainerWidth = React.useCallback(() => {
    if (!scrollAreaRef.current) return;
    // Account for inner padding (16px total on mobile, 32px on tablet/desktop)
    const padding = typeof window !== "undefined" && window.innerWidth < 640 ? 16 : 32;
    const availableWidth = scrollAreaRef.current.clientWidth - padding;
    if (availableWidth > 0) {
      setContainerWidth(availableWidth);
    }
  }, []);

  React.useEffect(() => {
    updateContainerWidth();

    const el = scrollAreaRef.current;
    let observer: ResizeObserver | null = null;

    if (el && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateContainerWidth();
      });
      observer.observe(el);
    }

    const handleWindowResize = () => {
      updateContainerWidth();
    };

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("orientationchange", handleWindowResize);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", handleWindowResize);
    };
  }, [updateContainerWidth, pdfDoc]);

  // Memoized page dimensions handler with numeric threshold guard to prevent infinite re-render loops
  const handlePageDimensions = React.useCallback(
    (dims: { width: number; height: number }) => {
      setUnscaledPageSize((prev) => {
        if (
          Math.abs(prev.width - dims.width) < 0.5 &&
          Math.abs(prev.height - dims.height) < 0.5
        ) {
          return prev;
        }
        return dims;
      });
    },
    []
  );

  // Compute effective render scale to fit available viewport width without horizontal clipping
  const effectiveScale = React.useMemo(() => {
    const baseWidth = unscaledPageSize.width || 595;
    if (!containerWidth || containerWidth <= 0) {
      return userZoom;
    }
    // Available viewport width capped at 850px for desktop reading comfort
    const targetFitWidth = Math.min(containerWidth, 850);
    const fitScale = targetFitWidth / baseWidth;
    return Math.max(0.25, +(fitScale * userZoom).toFixed(3));
  }, [containerWidth, unscaledPageSize.width, userZoom]);

  // 4. Zoom Handlers
  const handleZoomIn = React.useCallback(() => {
    setUserZoom((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setUserZoom((prev) => Math.max(0.5, +(prev - 0.15).toFixed(2)));
  }, []);

  const handleResetZoom = React.useCallback(() => {
    setUserZoom(1.0);
    updateContainerWidth();
  }, [updateContainerWidth]);

  const handleFitWidth = React.useCallback(() => {
    setUserZoom(1.0);
    updateContainerWidth();
    toast.success("স্ক্রিন অনুযায়ী ফিট করা হয়েছে (100%)");
  }, [updateContainerWidth]);

  // 5. Fullscreen API Toggle
  const handleToggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle not supported or permission denied:", err);
    }
  }, []);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // 6. Keyboard Navigation & Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle global PDF search shortcut (Ctrl+F or Cmd+F)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === "+" || (e.ctrlKey && e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || (e.ctrlKey && e.key === "-")) {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0" && e.ctrlKey) {
        e.preventDefault();
        handleResetZoom();
      } else if ((e.key === "b" || e.key === "B") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleBookmark();
      } else if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsTocOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, handlePageChange, handleZoomIn, handleZoomOut, handleResetZoom, handleToggleBookmark]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col transition-colors duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background overflow-hidden p-3"
          : "relative space-y-4"
      }`}
    >
      {/* 1. Loading State with Progress Bar */}
      {isLoading && (
        <ReaderLoading
          message={loadingMessage}
          progressPercentage={downloadProgress?.percentage}
        />
      )}

      {/* 2. Error State */}
      {!isLoading && error && (
        <ReaderError
          message={error}
          isExpired={isExpired}
          onRetry={() => initializeReader(true)}
        />
      )}

      {/* 3. Active PDF Canvas Reader */}
      {!isLoading && !error && pdfDoc && (
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Reader Top Navigation & Toolbar */}
          <ReaderToolbar
            currentPage={currentPage}
            totalPages={totalPages}
            scale={userZoom}
            isFullscreen={isFullscreen}
            bookmarks={bookmarks}
            isCurrentPageBookmarked={isCurrentPageBookmarked}
            isBookmarking={isBookmarking}
            isTocOpen={isTocOpen}
            isSearchOpen={isSearchOpen}
            onPageChange={handlePageChange}
            onToggleBookmark={handleToggleBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onFitWidth={handleFitWidth}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenToc={() => setIsTocOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Canvas Scroll & Viewport Area */}
          <div
            ref={scrollAreaRef}
            className="w-full overflow-auto max-h-[82vh] py-4 sm:py-6 px-1 sm:px-4 flex justify-center rounded-2xl border border-border/40 bg-muted/20 dark:bg-muted/10 backdrop-blur-sm custom-scrollbar"
            tabIndex={0}
            role="region"
            aria-label={`${bookTitle} - রিডিং ক্যানভাস এলাকা`}
          >
            <PdfPage
              pdfDoc={pdfDoc}
              pageNumber={currentPage}
              scale={effectiveScale}
              userWatermark={userWatermark}
              onPageDimensions={handlePageDimensions}
              onRenderError={(err) => {
                console.error("Page render error:", err);
                toast.error(`পৃষ্ঠা ${currentPage} রেন্ডার করতে সমস্যা হয়েছে`);
              }}
            />
          </div>

          {/* Table of Contents Drawer */}
          <ReaderToc
            isOpen={isTocOpen}
            onClose={() => setIsTocOpen(false)}
            tocItems={tocItems}
            currentPage={currentPage}
            onSelectPage={handlePageChange}
          />

          {/* In-Book PDF Text Search Modal */}
          <ReaderSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            pdfDoc={pdfDoc}
            currentPage={currentPage}
            onSelectPage={handlePageChange}
            textCache={textCacheRef}
          />

          {/* Bottom Responsive Navigation & Controls */}
          {/* 1. Mobile Touch-Friendly Controls (visible on < sm screens) */}
          <div className="flex sm:hidden items-center justify-between w-full max-w-md px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg">
            {/* Prev Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 gap-1 rounded-xl text-xs font-medium"
              aria-label="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>আগে</span>
            </Button>

            {/* Page Count Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-muted/80 text-xs font-semibold text-primary font-mono">
              {currentPage} / {totalPages}
            </div>

            {/* Mobile Action Tools: Bookmark, TOC, Search */}
            <div className="flex items-center gap-1">
              <Button
                variant={isCurrentPageBookmarked ? "default" : "ghost"}
                size="sm"
                onClick={handleToggleBookmark}
                className={`h-8 w-8 p-0 rounded-xl ${
                  isCurrentPageBookmarked
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="বুকমার্ক করুন"
              >
                <Bookmark
                  className={`h-4 w-4 ${isCurrentPageBookmarked ? "fill-current" : ""}`}
                />
              </Button>

              <Button
                variant={isTocOpen ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsTocOpen(true)}
                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label="সূচিপত্র"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Button
                variant={isSearchOpen ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label="খুঁজুন"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 gap-1 rounded-xl text-xs font-medium"
              aria-label="পরবর্তী পৃষ্ঠা"
            >
              <span>পরে</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 2. Desktop Keyboard Shortcut Footer (visible on sm+ screens) */}
          <div className="hidden sm:flex items-center justify-between w-full max-w-lg px-2 text-xs text-muted-foreground">
            <span className="font-mono">
              শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">→</kbd> | বুকমার্ক: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">B</kbd> | সার্চ: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">Ctrl+F</kbd> | সূচিপত্র: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">T</kbd>
            </span>
            <span className="font-mono text-primary font-semibold">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
