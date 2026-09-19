import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

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

const endpoint = process.env.B2_ENDPOINT?.startsWith("http")
  ? process.env.B2_ENDPOINT
  : `https://${process.env.B2_ENDPOINT}`;
const region = process.env.B2_REGION || "us-east-005";
const bucketName = process.env.B2_BUCKET_NAME || "medical-book-vault-2026";
const accessKeyId = process.env.B2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY || "";

const client = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

async function main() {
  console.log("=== DIAGNOSING /api/books/medical-handbook/pdf 500 ERROR ===");

  // 1. Inspect Database for bookSlug 'medical-handbook'
  const book = await prisma.book.findUnique({
    where: { slug: "medical-handbook" },
  });
  console.log("\n1. Database Book Record for 'medical-handbook':");
  console.log({
    id: book?.id,
    title: book?.title,
    slug: book?.slug,
    r2ObjectKey: book?.r2ObjectKey,
    isActive: book?.isActive,
    totalPages: book?.totalPages,
  });

  const objectKey = book?.r2ObjectKey || "books/medical-book.pdf";
  console.log(`\n2. Object key that route.ts will request: "${objectKey}"`);
  console.log(`   Bucket: "${bucketName}"`);

  // 2. Test B2 HeadObject (used by route.ts when rangeHeader exists)
  console.log("\n3. Testing HeadObjectCommand against B2:");
  try {
    const headRes = await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }));
    console.log("   HeadObject succeeded! ContentLength:", headRes.ContentLength);
  } catch (err: unknown) {
    const error = err as { name?: string; $metadata?: { httpStatusCode?: number }; Code?: string; code?: string; message?: string };
    console.log("   HeadObject FAILED!");
    console.log("   Error Name:", error.name);
    console.log("   HTTP Status Code:", error.$metadata?.httpStatusCode);
    console.log("   Error Code:", error.Code || error.code);
    console.log("   Error Message:", error.message);
  }

  // 3. Test B2 GetObject with Range bytes=0-1024
  console.log("\n4. Testing GetObjectCommand (Range: bytes=0-1024) against B2:");
  try {
    const rangeRes = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Range: "bytes=0-1024",
    }));
    const bytes = Buffer.from(await rangeRes.Body!.transformToByteArray());
    console.log("   Range GetObject succeeded! Bytes received:", bytes.length);
  } catch (err: unknown) {
    const error = err as { name?: string; $metadata?: { httpStatusCode?: number }; Code?: string; code?: string; message?: string };
    console.log("   Range GetObject FAILED!");
    console.log("   Error Name:", error.name);
    console.log("   HTTP Status Code:", error.$metadata?.httpStatusCode);
    console.log("   Error Code:", error.Code || error.code);
    console.log("   Error Message:", error.message);
  }

  // 4. Test B2 Full GetObject (used by route.ts when NO rangeHeader)
  console.log("\n5. Testing GetObjectCommand (Full GET, no range) against B2:");
  try {
    const fullRes = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }));
    console.log("   Full GetObject succeeded! ContentLength:", fullRes.ContentLength);
  } catch (err: unknown) {
    const error = err as { name?: string; $metadata?: { httpStatusCode?: number }; Code?: string; code?: string; message?: string };
    console.log("   Full GetObject FAILED!");
    console.log("   Error Name:", error.name);
    console.log("   HTTP Status Code:", error.$metadata?.httpStatusCode);
    console.log("   Error Code:", error.Code || error.code);
    console.log("   Error Message:", error.message);
  }

  // 5. Check if medical-book-optimized.pdf exists in B2
  console.log("\n6. Checking if optimized PDF exists in B2:");
  try {
    const optHead = await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: "books/medical-book-optimized.pdf",
    }));
    console.log("   Optimized PDF exists in B2! Size:", optHead.ContentLength);
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    console.log("   Optimized PDF in B2 check result:", error.name, error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
