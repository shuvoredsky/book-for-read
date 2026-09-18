import type { PDFDocumentProxy } from "pdfjs-dist";

export interface SearchMatch {
  id: string;
  pageNumber: number;
  snippet: string;
  matchIndex: number;
}

/**
 * Extracts raw text content of a single page and caches it in memory.
 */
export async function getPageText(
  doc: PDFDocumentProxy,
  pageNumber: number,
  cache: Map<number, string>
): Promise<string> {
  if (cache.has(pageNumber)) {
    return cache.get(pageNumber)!;
  }

  try {
    const page = await doc.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    cache.set(pageNumber, text);
    page.cleanup();
    return text;
  } catch (err) {
    console.warn(`[PDF Search]: Failed to extract text on page ${pageNumber}:`, err);
    return "";
  }
}

/**
 * Creates a readable text snippet surrounding the matched query.
 */
function createSnippet(text: string, matchIndex: number, queryLength: number): string {
  const contextLength = 40;
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + queryLength + contextLength);

  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

/**
 * Performs incremental client-side text search across the PDF document.
 * Non-blocking: yields to main UI thread periodically to prevent freezing.
 */
export async function searchPdfText(
  doc: PDFDocumentProxy,
  query: string,
  cache: Map<number, string>,
  options?: {
    onProgress?: (scannedPages: number, totalPages: number) => void;
    isCancelled?: () => boolean;
  }
): Promise<SearchMatch[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const matches: SearchMatch[] = [];
  const totalPages = doc.numPages;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (options?.isCancelled?.()) {
      break;
    }

    const pageText = await getPageText(doc, pageNum, cache);
    const lowerText = pageText.toLowerCase();

    let matchIdx = lowerText.indexOf(cleanQuery);
    let occurrencesOnPage = 0;

    while (matchIdx !== -1 && occurrencesOnPage < 5) {
      matches.push({
        id: `match-${pageNum}-${matchIdx}`,
        pageNumber: pageNum,
        snippet: createSnippet(pageText, matchIdx, cleanQuery.length),
        matchIndex: matchIdx,
      });

      occurrencesOnPage++;
      matchIdx = lowerText.indexOf(cleanQuery, matchIdx + cleanQuery.length);
    }

    options?.onProgress?.(pageNum, totalPages);

    // Yield control to main thread every 4 pages to keep animations and UI smooth
    if (pageNum % 4 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return matches;
}
