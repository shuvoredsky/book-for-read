"use client";

import * as React from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { Loader2 } from "lucide-react";
import { ReaderWatermark } from "./reader-watermark";

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  userWatermark?: {
    username: string;
    displayName?: string;
    email?: string;
  };
  onRenderSuccess?: () => void;
  onRenderError?: (error: Error) => void;
}

export function PdfPage({
  pdfDoc,
  pageNumber,
  scale,
  userWatermark,
  onRenderSuccess,
  onRenderError,
}: PdfPageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const activeRenderTaskRef = React.useRef<RenderTask | null>(null);
  const renderCounterRef = React.useRef(0);

  const [isRendering, setIsRendering] = React.useState(true);
  const [pageSize, setPageSize] = React.useState<{ width: number; height: number }>({
    width: 600,
    height: 850,
  });

  React.useEffect(() => {
    let isCancelled = false;
    const currentRenderCount = ++renderCounterRef.current;

    async function renderPage() {
      if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        return;
      }

      try {
        setIsRendering(true);

        // Cancel previous active render task if still in flight
        if (activeRenderTaskRef.current) {
          try {
            activeRenderTaskRef.current.cancel();
          } catch {
            // Cancellation is safe to ignore
          }
          activeRenderTaskRef.current = null;
        }

        // Fetch the PDF page object
        const page = await pdfDoc.getPage(pageNumber);

        if (isCancelled || currentRenderCount !== renderCounterRef.current) {
          page.cleanup();
          return;
        }

        // Calculate viewport with scale
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;

        if (!canvas) {
          page.cleanup();
          return;
        }

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          page.cleanup();
          return;
        }

        // HiDPI / Retina Crisp Display Handling
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const displayWidth = Math.floor(viewport.width);
        const displayHeight = Math.floor(viewport.height);

        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        setPageSize({ width: displayWidth, height: displayHeight });

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

        // Render PDF page to canvas
        const renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
          transform: transform,
        });

        activeRenderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!isCancelled && currentRenderCount === renderCounterRef.current) {
          setIsRendering(false);
          onRenderSuccess?.();
        }

        // Clean up page resources
        page.cleanup();
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        // Ignore expected cancellation during rapid page flipping or zoom
        if (error.name === "RenderingCancelledException") {
          return;
        }

        console.error(`[PdfPage Render Error] Page ${pageNumber}:`, err);
        if (!isCancelled && currentRenderCount === renderCounterRef.current) {
          setIsRendering(false);
          onRenderError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {
          // Ignored
        }
        activeRenderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, scale, onRenderSuccess, onRenderError]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center mx-auto rounded-xl overflow-hidden shadow-2xl bg-white border border-border/60 transition-all duration-150 select-none"
      style={{
        width: pageSize.width,
        minHeight: pageSize.height,
      }}
    >
      {/* HTML5 Canvas Rendering Target */}
      <canvas
        ref={canvasRef}
        className="block rounded-lg"
        style={{
          width: `${pageSize.width}px`,
          height: `${pageSize.height}px`,
        }}
      />

      {/* Dynamic Watermark Overlay */}
      {userWatermark && (
        <ReaderWatermark
          username={userWatermark.username}
          displayName={userWatermark.displayName}
          email={userWatermark.email}
        />
      )}

      {/* Page Loading Overlay */}
      {isRendering && (
        <div
          className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center z-15 transition-opacity"
          aria-label="পৃষ্ঠা রেন্ডার হচ্ছে..."
        >
          <div className="p-2.5 rounded-full bg-background/90 shadow-md border border-border flex items-center gap-2 text-xs font-medium text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>পৃষ্ঠা {pageNumber} লোড হচ্ছে...</span>
          </div>
        </div>
      )}
    </div>
  );
}
