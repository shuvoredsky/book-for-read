import "server-only";
import * as fs from "fs";
import * as path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client } from "@/lib/b2";

interface CachedPdf {
  buffer: Buffer;
  cachedAt: number;
}

// In-memory server-side cache for PDF buffers to minimize Backblaze B2 bandwidth consumption
const memoryCache = new Map<string, CachedPdf>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory cache

// Non-public private server storage paths for fallback if B2 rate limits/caps are triggered
const PRIVATE_FALLBACK_PATHS = [
  path.join(process.cwd(), "storage", "private-pdf", "medical-book-optimized.pdf"),
  path.join(process.cwd(), "storage", "private-pdf", "medical-book.pdf"),
  path.join(process.cwd(), "scripts", "medical-book-optimized.pdf"),
  "D:\\learn-something\\about-human-body\\pdf-book\\knowHumanBody\\new\\121_days_medical_book.pdf",
];

/**
 * Retrieves the protected PDF buffer with in-memory caching and resilient B2 streaming.
 * Security: Called ONLY after server-side session and BookAccess ACTIVE verification.
 */
export async function getProtectedPdfBuffer(objectKey: string): Promise<Buffer> {
  const cacheKey = objectKey || "books/medical-book.pdf";
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.buffer;
  }

  // 2. Try fetching from Backblaze B2 private bucket
  try {
    const { client, bucketName } = getB2Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await client.send(command);
    if (response.Body) {
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);

      if (buffer.length > 0) {
        memoryCache.set(cacheKey, { buffer, cachedAt: now });
        return buffer;
      }
    }
  } catch (b2Error: unknown) {
    console.warn(
      `[PDF Cache]: B2 fetch encountered an error (e.g. daily bandwidth cap):`,
      (b2Error as Error)?.message || b2Error
    );
  }

  // 3. Fallback to private non-public server storage if B2 is capped or unreachable
  for (const fallbackPath of PRIVATE_FALLBACK_PATHS) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ fallbackPath)) {
        const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ fallbackPath);
        if (fileBuffer.length > 0) {
          memoryCache.set(cacheKey, { buffer: fileBuffer, cachedAt: now });
          return fileBuffer;
        }
      }
    } catch {
      // Continue trying subsequent private paths
    }
  }

  throw new Error("PDF data could not be retrieved from private storage or server cache.");
}
