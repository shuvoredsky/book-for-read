import type { PDFDocumentProxy } from "pdfjs-dist";
import { defaultTableOfContents, type TocItem } from "@/config/toc";

interface RawOutlineItem {
  title: string;
  dest: string | unknown[] | null;
  items?: RawOutlineItem[];
}

/**
 * Resolves an outline destination to a 1-indexed page number using PDF.js APIs.
 */
async function resolveDestinationPage(
  doc: PDFDocumentProxy,
  dest: string | unknown[] | null
): Promise<number | null> {
  if (!dest) return null;

  try {
    let explicitDest: unknown[] | null = null;

    // Handle named destination string (e.g. "chapter1")
    if (typeof dest === "string") {
      explicitDest = (await doc.getDestination(dest)) as unknown[] | null;
    } else if (Array.isArray(dest)) {
      explicitDest = dest;
    }

    if (Array.isArray(explicitDest) && explicitDest.length > 0) {
      const pageRef = explicitDest[0];

      // Integer page index
      if (typeof pageRef === "number") {
        return pageRef + 1;
      }

      // PDF Ref object (e.g. { num: 12, gen: 0 })
      if (pageRef && typeof pageRef === "object") {
        const pageIndex = await doc.getPageIndex(pageRef as { num: number; gen: number });
        return pageIndex + 1;
      }
    }
  } catch (err) {
    console.warn("[PDF Outline]: Failed to resolve destination:", err);
  }

  return null;
}

/**
 * Recursively extracts and resolves document outline bookmarks from a PDF.js Document.
 * Falls back to verified defaultTableOfContents if the PDF lacks an embedded outline.
 */
export async function extractTableOfContents(
  doc: PDFDocumentProxy
): Promise<TocItem[]> {
  try {
    const rawOutline = (await doc.getOutline()) as RawOutlineItem[] | null;

    if (!rawOutline || rawOutline.length === 0) {
      return defaultTableOfContents;
    }

    async function processItems(
      items: RawOutlineItem[],
      level: number = 1
    ): Promise<TocItem[]> {
      const result: TocItem[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const pageNumber = await resolveDestinationPage(doc, item.dest);

        const tocItem: TocItem = {
          id: `toc-${level}-${i}-${item.title.slice(0, 15).replace(/\s+/g, "_")}`,
          title: item.title,
          page: pageNumber || 1,
          level,
        };

        if (item.items && item.items.length > 0) {
          tocItem.children = await processItems(item.items, level + 1);
        }

        result.push(tocItem);
      }

      return result;
    }

    const resolved = await processItems(rawOutline, 1);
    return resolved.length > 0 ? resolved : defaultTableOfContents;
  } catch (err) {
    console.warn("[PDF Outline]: Error extracting outline, using default TOC:", err);
    return defaultTableOfContents;
  }
}
