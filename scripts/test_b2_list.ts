import * as fs from "fs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
  const key = "books/medical-book.pdf";
  console.log("Testing Range GetObject for:", key);
  const getRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    Range: "bytes=0-500",
  }));
  console.log("GetObject succeeded!");
  console.log("- ContentRange:", getRes.ContentRange);
  console.log("- ContentLength:", getRes.ContentLength);
  console.log("- ContentType:", getRes.ContentType);
  const bytes = Buffer.from(await getRes.Body!.transformToByteArray());
  console.log("- Bytes received:", bytes.length);
  console.log("- Header snippet:", bytes.toString("utf8", 0, 100));
}

main().catch(console.error);
