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
 * Non-intrusive floating dynamic watermark overlay rendered over the PDF canvas reading area.
 * Displays authorized user details (username, name, email) in a subtle repeating diagonal grid.
 * 
 * NOTE: This is a client-side visual identification overlay and deterrent against casual
 * sharing. It does NOT permanently alter the source PDF file and cannot guarantee prevention
 * of external screen recording, photography, or screenshots.
 */
export function ReaderWatermark({
  username,
  displayName,
  email,
}: ReaderWatermarkProps) {
  // Construct dynamic identity strings strictly from server-provided user props
  const primaryText = `@${username}`;
  const secondaryText = email || displayName || "Authorized Reader";

  // Dense, balanced diagonal grid pattern across the page
  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-col justify-around py-4 opacity-[0.14] dark:opacity-[0.09] transition-opacity duration-300"
      style={{ userSelect: "none" }}
    >
      {rows.map((row) => (
        <div
          key={`row-${row}`}
          className="flex justify-around items-center w-full px-2 sm:px-4 transform -rotate-[22deg] scale-95"
        >
          {cols.map((col) => (
            <div
              key={`wm-${row}-${col}`}
              className="text-center font-mono tracking-wider space-y-0.5"
            >
              <span className="block text-[11px] sm:text-xs font-bold text-foreground/90 whitespace-nowrap">
                {primaryText}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-foreground/75 font-sans whitespace-nowrap">
                {secondaryText}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
