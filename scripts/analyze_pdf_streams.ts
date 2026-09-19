import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
  console.log("=== ANALYZING PDF STREAMS & OBJECTS ===");

  const { client, bucketName } = getClient();
  const key = "books/medical-book.pdf";

  const getRes = await client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));

  const fullBytes = Buffer.from(await getRes.Body!.transformToByteArray());
  console.log(`Original file size: ${fullBytes.length} bytes (${(fullBytes.length / (1024 * 1024)).toFixed(2)} MB)`);

  const pdfStr = fullBytes.toString("binary");

  // Count images and streams
  const streamMatches = pdfStr.match(/stream[\r\n]/g) || [];
  const imageMatches = pdfStr.match(/\/Subtype\s*\/Image/g) || [];
  const jpegMatches = pdfStr.match(/\/DCTDecode/g) || [];
  const flateMatches = pdfStr.match(/\/FlateDecode/g) || [];
  const fontMatches = pdfStr.match(/\/Type\s*\/Font/g) || [];

  console.log(`Total streams: ${streamMatches.length}`);
  console.log(`Image objects (/Subtype /Image): ${imageMatches.length}`);
  console.log(`JPEG compressed streams (/DCTDecode): ${jpegMatches.length}`);
  console.log(`Flate/Deflate streams (/FlateDecode): ${flateMatches.length}`);
  console.log(`Font objects (/Type /Font): ${fontMatches.length}`);
}

main().catch(console.error);
