"use client";

import * as React from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { toast } from "sonner";
import { getBookReadUrlAction } from "@/server/actions/reader";
import { ReaderToolbar } from "./reader-toolbar";
import { PdfPage } from "./pdf-page";
import { ReaderLoading } from "./reader-loading";
import { ReaderError } from "./reader-error";

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
  initialTotalPages = 240,
  initialPage = 1,
  userWatermark,
}: PdfReaderProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = React.useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(
    Math.max(1, Math.min(initialPage, initialTotalPages))
  );
  const [totalPages, setTotalPages] = React.useState<number>(initialTotalPages);
  const [scale, setScale] = React.useState<number>(1.0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = React.useState<string>("বইটি লোড হচ্ছে...");
  const [error, setError] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  // 1. Fetch authorized signed URL and initialize PDF Document
  const loadPdfDocument = React.useCallback(
    async (isRetry: boolean = false) => {
      setIsLoading(true);
      setError(null);
      setIsExpired(false);
      setLoadingMessage(
        isRetry
          ? "রিডিং সেশন রিফ্রেশ করা হচ্ছে..."
          : "সুরক্ষিত ব্যাকব্লেজ B2 ভল্ট থেকে বইটি লোড হচ্ছে..."
      );

      try {
        // Fetch presigned URL from existing verified server action
        const actionResult = await getBookReadUrlAction(bookSlug);

        if (!actionResult.success || !actionResult.data) {
          setError(
            actionResult.error || "বইয়ের এক্সেস নিশ্চিত করা যায়নি। অনুগ্রহ করে ড্যাশবোর্ড চেক করুন।"
          );
          setIsLoading(false);
          return;
        }

        const signedUrl = actionResult.data.presignedUrl;

        // Initialize PDF.js Document Proxy
        const loadingTask = pdfjsLib.getDocument({
          url: signedUrl,
          withCredentials: false,
          // Support HTTP range requests for large 60MB PDF streaming
          disableAutoFetch: false,
          disableStream: false,
        });

        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0) {
            const pct = Math.round((loaded / total) * 100);
            setLoadingMessage(`বইটি লোড হচ্ছে (${pct}%)...`);
          }
        };

        const doc = await loadingTask.promise;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);

        if (isRetry) {
          toast.success("রিডিং সেশন সফলভাবে নবায়ন হয়েছে!");
        }
      } catch (err: unknown) {
        console.error("[PdfReader Init Error]:", err);
        const errMessage = String(err);

        // Detect expired signed URL or 403 Forbidden
        if (
          errMessage.includes("403") ||
          errMessage.includes("AccessDenied") ||
          errMessage.includes("Expired")
        ) {
          setIsExpired(true);
          setError("রিডিং লিংকের মেয়াদ শেষ হয়ে গেছে। আবার চেষ্টা বাটনে ক্লিক করে নতুন লিংক নিন।");
        } else {
          setError("বইটি লোড করা যাচ্ছে না। আপনার ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।");
        }
        setIsLoading(false);
      }
    },
    [bookSlug]
  );

  // Initial load
  React.useEffect(() => {
    loadPdfDocument();

    return () => {
      // Clean up pdfDoc proxy on unmount
      if (pdfDoc) {
        pdfDoc.destroy().catch(() => {});
      }
    };
  }, [loadPdfDocument]);

  // 2. Navigation Handler
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);

      // Scroll viewport back to top of reader smoothly
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
  );

  // 3. Zoom Handlers
  const handleZoomIn = React.useCallback(() => {
    setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setScale((prev) => Math.max(0.5, +(prev - 0.15).toFixed(2)));
  }, []);

  const handleResetZoom = React.useCallback(() => {
    setScale(1.0);
  }, []);

  const handleFitWidth = React.useCallback(() => {
    if (!scrollAreaRef.current) return;
    const containerWidth = scrollAreaRef.current.clientWidth - 48; // padding consideration
    const standardPageWidth = 600; // standard PDF pt width
    const calculatedScale = Math.max(0.6, Math.min(2.0, +(containerWidth / standardPageWidth).toFixed(2)));
    setScale(calculatedScale);
    toast.success(`স্ক্রিন অনুযায়ী ফিট করা হয়েছে (${Math.round(calculatedScale * 100)}%)`);
  }, []);

  // 4. Fullscreen API Toggle
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

  // Listen for external fullscreen changes (e.g. Escape key)
  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // 5. Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not hijack typing inside form inputs
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, handlePageChange, handleZoomIn, handleZoomOut, handleResetZoom]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col transition-colors duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background overflow-hidden p-3"
          : "relative space-y-4"
      }`}
    >
      {/* 1. Loading State */}
      {isLoading && (
        <ReaderLoading message={loadingMessage} />
      )}

      {/* 2. Error State */}
      {!isLoading && error && (
        <ReaderError
          message={error}
          isExpired={isExpired}
          onRetry={() => loadPdfDocument(true)}
        />
      )}

      {/* 3. Active PDF Canvas Reader */}
      {!isLoading && !error && pdfDoc && (
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Reader Top Navigation Toolbar (Phase 11) */}
          <ReaderToolbar
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            isFullscreen={isFullscreen}
            onPageChange={handlePageChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onFitWidth={handleFitWidth}
            onToggleFullscreen={handleToggleFullscreen}
          />

          {/* Canvas Scroll & Viewport Area */}
          <div
            ref={scrollAreaRef}
            className="w-full overflow-auto max-h-[82vh] py-6 px-2 sm:px-4 flex justify-center rounded-2xl border border-border/40 bg-muted/20 dark:bg-muted/10 backdrop-blur-sm custom-scrollbar"
            tabIndex={0}
            role="region"
            aria-label="মেডিকেল বই রিডিং ক্যানভাস এলাকা"
          >
            <PdfPage
              pdfDoc={pdfDoc}
              pageNumber={currentPage}
              scale={scale}
              userWatermark={userWatermark}
              onRenderError={(err) => {
                console.error("Page render error:", err);
                toast.error(`পৃষ্ঠা ${currentPage} রেন্ডার করতে সমস্যা হয়েছে`);
              }}
            />
          </div>

          {/* Bottom Quick Page Indicator for Mobile */}
          <div className="flex items-center justify-between w-full max-w-lg px-2 text-xs text-muted-foreground">
            <span className="font-mono">
              কীবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">→</kbd>
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
