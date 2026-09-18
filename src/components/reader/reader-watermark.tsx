"use client";

import * as React from "react";

interface ReaderWatermarkProps {
  username: string;
  displayName?: string;
  email?: string;
}

/**
 * ReaderWatermark
 * 
 * Non-intrusive floating watermark overlay rendered over the PDF canvas reading area.
 * Displays authorized user details (username, name, email) dynamically.
 * 
 * NOTE: This is a client-side visual identification overlay. It does NOT permanently alter
 * the source PDF file and does not claim to prevent external screen recording or screenshots.
 */
export function ReaderWatermark({
  username,
  displayName,
  email,
}: ReaderWatermarkProps) {
  // Construct identity string
  const primaryText = `@${username}`;
  const secondaryText = email || displayName || "Licensed Reader";

  // 3x4 grid of subtle diagonal watermarks across the page
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-col justify-around py-8 opacity-20 dark:opacity-15"
      style={{ userSelect: "none" }}
    >
      {rows.map((row) => (
        <div
          key={`row-${row}`}
          className="flex justify-around items-center w-full px-4 transform -rotate-25"
        >
          {cols.map((col) => (
            <div
              key={`wm-${row}-${col}`}
              className="text-center font-mono tracking-wider"
            >
              <span className="block text-[11px] sm:text-xs font-semibold text-foreground/80">
                {primaryText}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-muted-foreground/70 font-sans">
                {secondaryText}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
