import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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
  console.log("=== INSPECTING PDF INTERNAL STRUCTURE ===");

  const { client, bucketName } = getClient();
  const key = "books/medical-book.pdf";

  const getRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));

  const fullBytes = Buffer.from(await getRes.Body!.transformToByteArray());
  console.log(`Downloaded full PDF into memory buffer: ${fullBytes.length} bytes (${(fullBytes.length / (1024 * 1024)).toFixed(2)} MB)`);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fullBytes),
    useSystemFonts: true,
  });

  const doc = await loadingTask.promise;
  console.log(`Parsed Document: numPages = ${doc.numPages}`);

  // Inspect first 5 pages and metadata
  const meta = await doc.getMetadata();
  console.log("Metadata:", meta.info);

  // Inspect page dimensions
  for (let i = 1; i <= Math.min(5, doc.numPages); i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    console.log(`Page ${i}: width = ${viewport.width}, height = ${viewport.height}, rotation = ${page.rotate}`);
    page.cleanup();
  }

  doc.destroy();
}

main().catch(console.error);
