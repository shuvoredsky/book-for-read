"use client";

import * as React from "react";
import {
  ListOrdered,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TocItem } from "@/config/toc";

interface ReaderTocProps {
  isOpen: boolean;
  onClose: () => void;
  tocItems: TocItem[];
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

export function ReaderToc({
  isOpen,
  onClose,
  tocItems,
  currentPage,
  onSelectPage,
}: ReaderTocProps) {
  const [filterText, setFilterText] = React.useState("");
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClose = React.useCallback(() => {
    setFilterText("");
    onClose();
  }, [onClose]);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter TOC items by search text
  const filteredItems = React.useMemo(() => {
    const cleanFilter = filterText.trim().toLowerCase();
    if (!cleanFilter) return tocItems;

    function filterRecursive(items: TocItem[]): TocItem[] {
      const result: TocItem[] = [];
      for (const item of items) {
        const matches =
          item.title.toLowerCase().includes(cleanFilter) ||
          Boolean(item.titleBn && item.titleBn.toLowerCase().includes(cleanFilter));

        const matchingChildren = item.children ? filterRecursive(item.children) : [];

        if (matches || matchingChildren.length > 0) {
          result.push({
            ...item,
            children: matchingChildren.length > 0 ? matchingChildren : item.children,
          });
        }
      }
      return result;
    }

    return filterRecursive(tocItems);
  }, [filterText, tocItems]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="সূচিপত্র নেভিগেশন প্যানেল"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="relative z-50 flex flex-col w-full max-w-md bg-card border-r border-border/80 shadow-2xl h-full animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ListOrdered className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                সূচিপত্র (Table of Contents)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                অধ্যায় বা সেকশনে সরাসরি জাম্প করুন
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="সূচিপত্র বন্ধ করুন (Escape)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search / Filter Input */}
        <div className="p-3 border-b border-border/40 bg-background/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="অধ্যায় বা টপিক খুঁজুন..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 text-xs h-9 bg-muted/40"
              aria-label="সূচিপত্র ফিল্টার"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable TOC List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">কোনো ফলাফল পাওয়া যায়নি</p>
              <p>&quot;{filterText}&quot; সম্পর্কিত কোনো অধ্যায় সূচিপত্রে নেই।</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              // Determine if this is the active section
              const nextItem = filteredItems[index + 1];
              const isActive =
                currentPage >= item.page &&
                (!nextItem || currentPage < nextItem.page);

              const isExpanded = expandedNodes[item.id] ?? true;
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.id} className="space-y-1">
                  <div
                    onClick={() => {
                      onSelectPage(item.page);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/40 text-primary shadow-xs"
                        : "hover:bg-muted/60 border border-transparent text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(item.id, e)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded"
                          aria-label={isExpanded ? "সংকুচিত করুন" : "প্রসারিত করুন"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-60 text-primary" />
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold truncate leading-snug">
                          {item.title}
                        </span>
                        {item.titleBn && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {item.titleBn}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`font-mono text-[10px] px-1.5 py-0 ${
                          isActive ? "bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        P. {item.page}
                      </Badge>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </div>

                  {/* Render Nested Children if any */}
                  {hasChildren && isExpanded && (
                    <div className="pl-6 space-y-1 border-l-2 border-border/40 ml-4">
                      {item.children!.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => {
                            onSelectPage(child.page);
                            onClose();
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                            currentPage === child.page
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className="truncate pr-2">{child.title}</span>
                          <span className="font-mono text-[10px] opacity-70">
                            P. {child.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>বর্তমান পৃষ্ঠা: {currentPage}</span>
          <span>Escape বা বাইরে ক্লিক করে বন্ধ করুন</span>
        </div>
      </div>
    </div>
  );
}
