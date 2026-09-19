import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { getProtectedPdfBuffer } from "../src/server/pdf-cache";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

function loadEnv() {
  try {
    const envContent = fs.readFileSync(".env", "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  } catch (err) {
    console.error("loadEnv error:", err);
  }
}
loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log("=== TESTING SIMPLIFIED PROTECTED PDF PIPELINE ===");

  // 1. Verify Book & Access in Database
  const book = await prisma.book.findUnique({
    where: { slug: "medical-handbook" },
  });
  console.log("1. Book Record:", {
    title: book?.title,
    slug: book?.slug,
    r2ObjectKey: book?.r2ObjectKey,
    totalPages: book?.totalPages,
  });

  const activeAccesses = await prisma.bookAccess.findMany({
    where: { bookId: book?.id, status: "ACTIVE" },
    include: { user: { select: { id: true, email: true, username: true, status: true } } },
  });
  console.log(`2. Active BookAccess Users Count: ${activeAccesses.length}`);
  activeAccesses.forEach((acc) => {
    console.log(`   - User: @${acc.user.username} (${acc.user.email}), Status: ${acc.user.status}`);
  });

  // 2. Fetch Protected PDF Buffer via getProtectedPdfBuffer
  const startTime = Date.now();
  console.log("\n3. Fetching PDF buffer via getProtectedPdfBuffer...");
  const buffer = await getProtectedPdfBuffer(book?.r2ObjectKey || "books/medical-book.pdf");
  const elapsed = Date.now() - startTime;

  console.log(`   Buffer received successfully! Size: ${buffer.length} bytes (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   Fetch Time: ${elapsed}ms`);

  // 3. Test In-Memory Cache Retrieval
  const cacheStartTime = Date.now();
  const cachedBuffer = await getProtectedPdfBuffer(book?.r2ObjectKey || "books/medical-book.pdf");
  const cacheElapsed = Date.now() - cacheStartTime;
  console.log(`   In-Memory Cache Hit Time: ${cacheElapsed}ms (Identical: ${cachedBuffer.length === buffer.length})`);

  // 4. Verify with PDF.js Document Parser
  console.log("\n4. Parsing in-memory buffer with PDF.js...");
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  console.log(`   PDF.js Document Loaded! Total Pages: ${doc.numPages}`);

  // Test extracting page 1 dimensions & text
  const p1 = await doc.getPage(1);
  const vp1 = p1.getViewport({ scale: 1.0 });
  const text1 = await p1.getTextContent();
  console.log(`   Page 1: ${vp1.width} x ${vp1.height} pt, text items: ${text1.items.length}`);
  p1.cleanup();

  doc.destroy();
  console.log("\n✅ ALL PIPELINE TESTS PASSED SUCCESSFULLY!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
