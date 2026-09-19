import * as fs from "fs";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const pdfPath = "D:\\learn-something\\about-human-body\\pdf-book\\knowHumanBody\\new\\121_days_medical_book.pdf";

async function main() {
  console.log("=== COMPREHENSIVE PDF CHARACTERISTICS & OPTIMIZATION AUDIT ===");

  const buffer = fs.readFileSync(pdfPath);
  const origSize = buffer.length;
  console.log(`Original file path: ${pdfPath}`);
  console.log(`Original file size: ${origSize} bytes (${(origSize / (1024 * 1024)).toFixed(2)} MB)`);

  // 1. Check Linearization
  const headerStr = buffer.subarray(0, 2048).toString("utf8");
  const isLinearized = headerStr.includes("/Linearized");
  console.log(`Is Linearized (Fast Web View): ${isLinearized ? "YES" : "NO"}`);

  // 2. Load with PDF.js
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  console.log(`Total Page Count: ${doc.numPages}`);

  const meta = await doc.getMetadata();
  console.log("PDF Metadata:", JSON.stringify(meta.info, null, 2));

  // Inspect first 5 pages dimensions and sample text
  console.log("\n--- Page Inspection ---");
  for (let i = 1; i <= Math.min(5, doc.numPages); i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const text = await page.getTextContent();
    console.log(`Page ${i}: ${viewport.width} x ${viewport.height} pt, text items: ${text.items.length}, rotate: ${page.rotate}`);
    page.cleanup();
  }

  // 3. Analyze internal streams
  const pdfStr = buffer.toString("binary");
  const streamMatches = pdfStr.match(/stream[\r\n]/g) || [];
  const imageMatches = pdfStr.match(/\/Subtype\s*\/Image/g) || [];
  const flateMatches = pdfStr.match(/\/FlateDecode/g) || [];
  const dctMatches = pdfStr.match(/\/DCTDecode/g) || [];
  const fontMatches = pdfStr.match(/\/Type\s*\/Font/g) || [];

  console.log(`\n--- Stream Analysis ---`);
  console.log(`Total streams: ${streamMatches.length}`);
  console.log(`Image objects: ${imageMatches.length}`);
  console.log(`FlateDecode streams: ${flateMatches.length}`);
  console.log(`DCTDecode (JPEG) streams: ${dctMatches.length}`);
  console.log(`Font objects: ${fontMatches.length}`);

  // 4. Test optimization with pdf-lib object stream compression & dictionary compaction
  console.log("\n--- PDF Optimization Test ---");
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const optBytes = await pdfDoc.save({ useObjectStreams: true });
  const optSize = optBytes.length;
  const reductionBytes = origSize - optSize;
  const reductionPct = ((reductionBytes / origSize) * 100).toFixed(2);

  console.log(`Optimized file size: ${optSize} bytes (${(optSize / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Reduction: ${reductionPct}% (${(reductionBytes / (1024 * 1024)).toFixed(2)} MB saved)`);

  // Verify optimized document with PDF.js
  const optDocTask = pdfjsLib.getDocument({
    data: new Uint8Array(optBytes),
    useSystemFonts: true,
  });
  const optDoc = await optDocTask.promise;
  console.log(`Verified Optimized Document: ${optDoc.numPages} pages (Original: ${doc.numPages} pages)`);

  // Verify text selectability on page 1 and page 100
  const optP1 = await optDoc.getPage(1);
  const p1Text = await optP1.getTextContent();
  console.log(`Optimized Page 1 text items: ${p1Text.items.length}`);
  optP1.cleanup();

  if (optDoc.numPages >= 100) {
    const optP100 = await optDoc.getPage(100);
    const p100Text = await optP100.getTextContent();
    console.log(`Optimized Page 100 text items: ${p100Text.items.length}`);
    optP100.cleanup();
  }

  doc.destroy();
  optDoc.destroy();

  // Save the optimized copy locally to scratch/
  const outPath = "scripts/medical-book-optimized.pdf";
  fs.writeFileSync(outPath, Buffer.from(optBytes));
  console.log(`Saved optimized copy to: ${outPath}`);
}

main().catch(console.error);
