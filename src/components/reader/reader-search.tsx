"use client";

import * as React from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { searchPdfText, type SearchMatch } from "@/lib/pdf-search";

interface ReaderSearchProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
  textCache: React.MutableRefObject<Map<number, string>>;
}

export function ReaderSearch({
  isOpen,
  onClose,
  pdfDoc,
  currentPage,
  onSelectPage,
  textCache,
}: ReaderSearchProps) {
  const [query, setQuery] = React.useState("");
  const [matches, setMatches] = React.useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = React.useState<number>(-1);
  const [isSearching, setIsSearching] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState({ scanned: 0, total: 0 });
  const [hasSearched, setHasSearched] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const cancelSearchRef = React.useRef<boolean>(false);
  const activeSearchIdRef = React.useRef<number>(0);

  // Focus input when modal opens
  React.useEffect(() => {
    if (!isOpen) {
      cancelSearchRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 80);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Execute Search Function
  const executeSearch = React.useCallback(
    async (searchQuery: string) => {
      const cleanQuery = searchQuery.trim();
      if (!cleanQuery || !pdfDoc) {
        setMatches([]);
        setActiveMatchIndex(-1);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }

      // Cancel any ongoing search
      cancelSearchRef.current = true;
      const currentSearchId = ++activeSearchIdRef.current;
      cancelSearchRef.current = false;

      setIsSearching(true);
      setHasSearched(true);
      setMatches([]);
      setActiveMatchIndex(-1);
      setScanProgress({ scanned: 0, total: pdfDoc.numPages });

      try {
        const results = await searchPdfText(
          pdfDoc,
          cleanQuery,
          textCache.current,
          {
            onProgress: (scanned, total) => {
              if (activeSearchIdRef.current === currentSearchId) {
                setScanProgress({ scanned, total });
              }
            },
            isCancelled: () => cancelSearchRef.current || activeSearchIdRef.current !== currentSearchId,
          }
        );

        if (activeSearchIdRef.current === currentSearchId) {
          setMatches(results);
          setIsSearching(false);

          if (results.length > 0) {
            // Find if there is a match on current page or closest after current page
            const initialIndex = results.findIndex((m) => m.pageNumber >= currentPage);
            const targetIdx = initialIndex !== -1 ? initialIndex : 0;
            setActiveMatchIndex(targetIdx);
            onSelectPage(results[targetIdx].pageNumber);
          } else {
            setActiveMatchIndex(-1);
          }
        }
      } catch (err) {
        console.error("[ReaderSearch] Error searching PDF text:", err);
        if (activeSearchIdRef.current === currentSearchId) {
          setIsSearching(false);
        }
      }
    },
    [pdfDoc, textCache, currentPage, onSelectPage]
  );

  // Debounced search on query changes
  React.useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      executeSearch(query);
    }, 450);

    return () => clearTimeout(timer);
  }, [query, isOpen, executeSearch]);

  // Navigate to next match
  const handleNextMatch = React.useCallback(() => {
    if (matches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIdx);
    onSelectPage(matches[nextIdx].pageNumber);
  }, [matches, activeMatchIndex, onSelectPage]);

  // Navigate to previous match
  const handlePrevMatch = React.useCallback(() => {
    if (matches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matches.length) % matches.length;
    setActiveMatchIndex(prevIdx);
    onSelectPage(matches[prevIdx].pageNumber);
  }, [matches, activeMatchIndex, onSelectPage]);

  // Input key handler (Enter for next, Shift+Enter for prev)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        if (hasSearched && matches.length > 0) {
          handleNextMatch();
        } else {
          executeSearch(query);
        }
      }
    }
  };

  // Highlight query within text snippet
  const renderSnippet = (snippet: string, term: string) => {
    if (!term) return snippet;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = snippet.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-300/80 dark:bg-yellow-500/40 text-foreground font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  const progressPercent =
    scanProgress.total > 0
      ? Math.round((scanProgress.scanned / scanProgress.total) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="PDF টেক্সট সার্চ প্যানেল"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Search Container */}
      <div className="relative z-50 w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="p-3.5 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                বইয়ে টেক্সট সার্চ
                <Sparkles className="h-3 w-3 text-amber-500" />
              </h2>
              <p className="text-[11px] text-muted-foreground">
                যেকোনো রোগ, লক্ষণ বা ওষুধের নাম খুঁজুন
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="সার্চ বন্ধ করুন (Escape)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 bg-background/60 border-b border-border/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="এই বইয়ে খুঁজুন... (e.g. Asthma, ECG, CPR)"
                className="pl-9 pr-8 text-xs sm:text-sm h-9 bg-muted/40 font-medium"
                aria-label="সার্চ কুয়েরি লিখুন"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMatches([]);
                    setHasSearched(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="মুছে ফেলুন"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Navigation Controls for Matches */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMatch}
                disabled={matches.length === 0}
                className="h-9 w-8"
                aria-label="পূর্ববর্তী ফলাফল (Shift+Enter)"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMatch}
                disabled={matches.length === 0}
                className="h-9 w-8"
                aria-label="পরবর্তী ফলাফল (Enter)"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar during live scan */}
          {isSearching && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  বইটি স্ক্যান হচ্ছে...
                </span>
                <span>
                  {scanProgress.scanned} / {scanProgress.total} পৃষ্ঠা ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Search Results Summary Status */}
          {!isSearching && hasSearched && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              {matches.length > 0 ? (
                <>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {matches.length}টি ফলাফল পাওয়া গেছে
                  </span>
                  <span className="font-mono text-[11px]">
                    ফলাফল: {activeMatchIndex + 1} / {matches.length}
                  </span>
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  ফলাফল পাওয়া যায়নি
                </span>
              )}
            </div>
          )}
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {isSearching && matches.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs font-medium">মেডিকেল বইয়ের পাতাগুলো খোঁজা হচ্ছে...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-10 text-center text-xs text-muted-foreground space-y-1.5">
              <FileText className="h-8 w-8 mx-auto opacity-40 text-primary" />
              <p className="font-medium text-foreground">বইটিতে যেকোনো শব্দ বা বিষয় অনুসন্ধান করুন</p>
              <p className="text-[11px] text-muted-foreground">
                কী-বোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">Enter</kbd> (পরবর্তী) / <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">Shift+Enter</kbd> (পূর্ববর্তী)
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">কোনো ফলাফল পাওয়া যায়নি</p>
              <p>&quot;{query}&quot; সম্পর্কিত কোনো তথ্য বইটিতে পাওয়া যায়নি। বানান চেক করে আবার চেষ্টা করুন।</p>
            </div>
          ) : (
            matches.map((match, idx) => {
              const isSelected = idx === activeMatchIndex;

              return (
                <div
                  key={match.id}
                  onClick={() => {
                    setActiveMatchIndex(idx);
                    onSelectPage(match.pageNumber);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary/50 shadow-xs ring-1 ring-primary/30"
                      : "bg-card hover:bg-muted/60 border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={`font-mono text-[10px] px-1.5 py-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "text-primary border-primary/30"
                      }`}
                    >
                      পৃষ্ঠা {match.pageNumber}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="opacity-70 font-mono">#{idx + 1}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed font-sans line-clamp-2">
                    {renderSnippet(match.snippet, query.trim())}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>বর্তমান পৃষ্ঠা: {currentPage}</span>
          <span>Escape চেপে বন্ধ করুন</span>
        </div>
      </div>
    </div>
  );
}
