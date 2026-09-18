import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getB2Config() {
  const rawEndpoint = process.env.B2_ENDPOINT?.trim();
  const region = process.env.B2_REGION?.trim();
  const bucketName = process.env.B2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.B2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY?.trim();

  if (!rawEndpoint || !region || !bucketName || !accessKeyId || !secretAccessKey) {
    const missing: string[] = [];
    if (!rawEndpoint) missing.push("B2_ENDPOINT");
    if (!region) missing.push("B2_REGION");
    if (!bucketName) missing.push("B2_BUCKET_NAME");
    if (!accessKeyId) missing.push("B2_ACCESS_KEY_ID");
    if (!secretAccessKey) missing.push("B2_SECRET_ACCESS_KEY");

    throw new Error(
      `[Backblaze B2 Config Error]: Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const endpoint =
    rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://")
      ? rawEndpoint
      : `https://${rawEndpoint}`;

  return {
    endpoint,
    region,
    bucketName,
    accessKeyId,
    secretAccessKey,
  };
}

let cachedS3Client: S3Client | null = null;

export function getB2Client(): { client: S3Client; bucketName: string } {
  const config = getB2Config();

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Backblaze B2 S3-compatible API standard
    });
  }

  return { client: cachedS3Client, bucketName: config.bucketName };
}

/**
 * Uploads a PDF binary to Backblaze B2 under the specified object key.
 */
export async function uploadPdfToB2(
  fileBuffer: Buffer | Uint8Array,
  objectKey: string,
  contentType: string = "application/pdf"
): Promise<{ success: boolean; objectKey: string; error?: string }> {
  try {
    const { client, bucketName } = getB2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await client.send(command);

    return { success: true, objectKey };
  } catch (error: unknown) {
    console.error("[B2 Upload Error]: Failed to upload file to Backblaze B2:", error);
    return {
      success: false,
      objectKey,
      error: "ফাইলটি Backblaze B2 স্টোরেজে আপলোড করা সম্ভব হয়নি।",
    };
  }
}

/**
 * Generates a short-lived presigned GET URL for temporary authorized reading.
 * Default expiry: 600 seconds (10 minutes).
 */
export async function getPresignedReadUrl(
  objectKey: string,
  expiresInSeconds: number = 600
): Promise<{ success: boolean; presignedUrl?: string; error?: string }> {
  try {
    const { client, bucketName } = getB2Client();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      success: true,
      presignedUrl,
    };
  } catch (error: unknown) {
    console.error("[B2 Presign Error]: Failed to generate presigned URL:", error);
    return {
      success: false,
      error: "সুরক্ষিত রিডিং লিংক তৈরি করতে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Deletes an object from Backblaze B2 (for re-upload/replace flows).
 */
export async function deleteFromB2(
  objectKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, bucketName } = getB2Client();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await client.send(command);

    return { success: true };
  } catch (error: unknown) {
    console.error("[B2 Delete Error]: Failed to delete object from Backblaze B2:", error);
    return {
      success: false,
      error: "ফাইলটি মোছা সম্ভব হয়নি।",
    };
  }
}
