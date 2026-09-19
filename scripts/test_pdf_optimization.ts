import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

function getClient() {
  let endpoint = process.env.B2_ENDPOINT || "s3.us-east-005.backblazeb2.com";
  if (!endpoint.startsWith("http")) {
    endpoint = `https://${endpoint}`;
  }
  const region = process.env.B2_REGION || "us-east-005";
  const accessKeyId = process.env.B2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY || "";
  const bucketName = process.env.B2_BUCKET_NAME || "medical-book-pdf";

  const client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  return { client, bucketName };
}

async function main() {
  console.log("=== TESTING PDF OPTIMIZATION ===");

  const { client, bucketName } = getClient();
  const key = "books/medical-book.pdf";

  const getRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));

  const origBuffer = Buffer.from(await getRes.Body!.transformToByteArray());
  const origSize = origBuffer.length;
  console.log(`Original size: ${origSize} bytes (${(origSize / (1024 * 1024)).toFixed(2)} MB)`);

  // Load with pdf-lib and save with object compression
  console.log("Processing with pdf-lib for object compaction and re-compression...");
  const pdfDoc = await PDFDocument.load(origBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  console.log(`pdf-lib loaded successfully. Total pages: ${pageCount}`);

  const optimizedBytes = await pdfDoc.save({ useObjectStreams: true });
  const optimizedSize = optimizedBytes.length;
  const reductionBytes = origSize - optimizedSize;
  const reductionPct = ((reductionBytes / origSize) * 100).toFixed(2);

  console.log(`Optimized size: ${optimizedSize} bytes (${(optimizedSize / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Reduction: ${reductionPct}% (${(reductionBytes / 1024).toFixed(1)} KB saved)`);

  // Verify the optimized PDF with PDF.js
  console.log("Verifying optimized PDF parsing with PDF.js...");
  const verifyTask = pdfjsLib.getDocument({
    data: new Uint8Array(optimizedBytes),
    useSystemFonts: true,
  });
  const verifiedDoc = await verifyTask.promise;
  console.log(`Verified with PDF.js: numPages = ${verifiedDoc.numPages}`);

  // Test rendering page 1 and page 100
  const p1 = await verifiedDoc.getPage(1);
  console.log(`Page 1 dimensions: ${p1.getViewport({ scale: 1 }).width} x ${p1.getViewport({ scale: 1 }).height}`);
  const textContent = await p1.getTextContent();
  console.log(`Page 1 text items: ${textContent.items.length}`);
  p1.cleanup();

  verifiedDoc.destroy();
}

main().catch(console.error);
