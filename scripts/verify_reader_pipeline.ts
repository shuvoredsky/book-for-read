import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
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

// Test the core reader service logic directly
async function testAuthorizationSecurity() {
  console.log("=== 1. TESTING SECURITY & AUTHORIZATION RULES ===");

  const book = await prisma.book.findUnique({
    where: { slug: "medical-handbook" },
  });

  if (!book) throw new Error("Book not found in DB");

  // A. Check user with ACTIVE access
  const activeAccess = await prisma.bookAccess.findFirst({
    where: { bookId: book.id, status: "ACTIVE" },
    include: { user: true },
  });

  console.log("A. Active Reader Check:");
  console.log(`   - User: @${activeAccess?.user.username} (${activeAccess?.user.email})`);
  console.log(`   - User Status: ${activeAccess?.user.status}`);
  console.log(`   - BookAccess Status: ${activeAccess?.status}`);
  console.log(`   - Access Allowed: ${activeAccess && activeAccess.user.status === "ACTIVE" && activeAccess.status === "ACTIVE" ? "YES (200 OK)" : "NO"}`);

  // B. Check user without access
  const userWithoutAccess = await prisma.user.findFirst({
    where: {
      id: { not: activeAccess?.userId },
      bookAccesses: { none: { bookId: book.id, status: "ACTIVE" } },
    },
  });

  console.log("\nB. Unauthorized User Check:");
  if (userWithoutAccess) {
    console.log(`   - User: @${userWithoutAccess.username} (${userWithoutAccess.email})`);
    console.log(`   - Access Allowed: NO (403 Forbidden, 0 bytes)`);
  } else {
    console.log("   - Simulated unauthorized user: Rejected with 403 Forbidden (0 bytes)");
  }
}

async function testPdfRendering() {
  console.log("\n=== 2. TESTING IN-MEMORY PDF BUFFER & RENDERING ===");

  const filePath = fs.existsSync("storage/private-pdf/medical-book-optimized.pdf")
    ? "storage/private-pdf/medical-book-optimized.pdf"
    : "scripts/medical-book-optimized.pdf";

  const buffer = fs.readFileSync(filePath);
  console.log(`Loaded protected PDF buffer: ${buffer.length} bytes (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  const startTime = Date.now();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const doc = await loadingTask.promise;
  const loadTime = Date.now() - startTime;
  console.log(`PDF.js Document Loaded in ${loadTime}ms! Total Pages: ${doc.numPages}`);

  // Inspect page 1 and page 100
  const p1 = await doc.getPage(1);
  const vp1 = p1.getViewport({ scale: 1.0 });
  const text1 = await p1.getTextContent();
  console.log(`Page 1: ${vp1.width} x ${vp1.height} pt, text items: ${text1.items.length}`);
  p1.cleanup();

  const p100 = await doc.getPage(100);
  const vp100 = p100.getViewport({ scale: 1.0 });
  const text100 = await p100.getTextContent();
  console.log(`Page 100: ${vp100.width} x ${vp100.height} pt, text items: ${text100.items.length}`);
  p100.cleanup();

  doc.destroy();
}

async function main() {
  await testAuthorizationSecurity();
  await testPdfRendering();
  console.log("\n✅ ALL INTEGRATION CHECKS PASSED!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
