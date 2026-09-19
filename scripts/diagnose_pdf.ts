import * as fs from "fs";
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

function getClient() {
  let endpoint = process.env.B2_ENDPOINT || "s3.us-east-005.backblazeb2.com";
  if (!endpoint.startsWith("http")) {
    endpoint = `https://${endpoint}`;
  }
  const region = process.env.B2_REGION || "us-east-005";
  const accessKeyId = (process.env.B2_ACCESS_KEY_ID || process.env.B2_KEY_ID || "").trim();
  const secretAccessKey = (process.env.B2_SECRET_ACCESS_KEY || process.env.B2_APPLICATION_KEY || "").trim();
  const bucketName = (process.env.B2_BUCKET_NAME || "medical-book-vault-2026").trim();

  const client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  return { client, bucketName };
}

async function diagnosePdf() {
  console.log("=== PHASE 1: DIAGNOSING PDF & RANGE REQUESTS ===");

  const { client, bucketName } = getClient();
  const key = "books/medical-book.pdf";

  // 1. HEAD Object
  const head = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
  const totalLength = head.ContentLength || 0;
  console.log(`[B2 Head] Total size: ${totalLength} bytes (${(totalLength / (1024 * 1024)).toFixed(2)} MB)`);

  // 2. Fetch first 1024 bytes
  const firstChunkRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    Range: "bytes=0-1023",
  }));
  const firstBytes = Buffer.from(await firstChunkRes.Body!.transformToByteArray());
  const headerStr = firstBytes.toString("utf8", 0, Math.min(1024, firstBytes.length));
  console.log(`[First 1KB Header]:\n${headerStr.slice(0, 300)}...`);

  const isLinearized = headerStr.includes("/Linearized");
  console.log(`\nIs PDF Linearized (Fast Web View)?: ${isLinearized ? "YES" : "NO"}`);

  // 3. Fetch last 4096 bytes (XRef / EOF)
  const lastChunkStart = Math.max(0, totalLength - 4096);
  const lastChunkRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    Range: `bytes=${lastChunkStart}-${totalLength - 1}`,
  }));
  const lastBytes = Buffer.from(await lastChunkRes.Body!.transformToByteArray());
  const trailerStr = lastBytes.toString("utf8");
  console.log(`\n[Last 4KB Trailer]:\n...${trailerStr.slice(-400)}`);

  console.log(`\nRange requests from B2 work: first chunk (${firstBytes.length} bytes), last chunk (${lastBytes.length} bytes).`);
}

diagnosePdf().catch(console.error);
