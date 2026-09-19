import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { getB2Client } from "@/lib/b2";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Protected Same-Origin PDF Streaming Endpoint.
 * 
 * Security & Access Verification:
 * 1. Authenticates session cookie via Better Auth.
 * 2. Verifies User exists and is ACTIVE (not SUSPENDED/BANNED).
 * 3. Verifies Book exists and isActive === true.
 * 4. Verifies BookAccess exists and status === "ACTIVE" specifically.
 * 5. Proxies the stream from private Backblaze B2 directly to the client.
 * 6. Supports HTTP 206 Range requests for efficient PDF.js page-by-page streaming.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const { bookSlug } = await params;
  const cleanSlug = typeof bookSlug === "string" ? bookSlug.trim() : "";

  if (!cleanSlug || cleanSlug.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(cleanSlug)) {
    return new NextResponse("Invalid book identifier", { status: 400 });
  }

  // 1. Authenticate user from session cookies
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Fetch User status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return new NextResponse("Account suspended or inactive", { status: 403 });
  }

  // 3. Fetch active book
  const book = await prisma.book.findUnique({
    where: { slug: cleanSlug },
    select: { id: true, title: true, r2ObjectKey: true, isActive: true },
  });

  if (!book || !book.isActive) {
    return new NextResponse("Book not found or inactive", { status: 404 });
  }

  // 4. Verify BookAccess status
  const access = await prisma.bookAccess.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: book.id,
      },
    },
    select: { status: true },
  });

  if (!access || access.status !== "ACTIVE") {
    return new NextResponse("Book access not granted or revoked", { status: 403 });
  }

  // 5. Connect to Backblaze B2 private bucket
  const { client, bucketName } = getB2Client();
  const objectKey = book.r2ObjectKey || "books/medical-book.pdf";

  const rangeHeader = request.headers.get("range");

  try {
    if (rangeHeader) {
      // 5a. HTTP 206 Partial Content Range Request
      const headRes = await client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        })
      );

      const totalSize = headRes.ContentLength || 0;
      const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);

      if (!matches) {
        return new NextResponse("Invalid range header", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const start = parseInt(matches[1], 10);
      const end = matches[2] ? parseInt(matches[2], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Range: `bytes=${start}-${end}`,
      });

      const getRes = await client.send(getCommand);
      const chunkSize = end - start + 1;

      const bodyStream = getRes.Body && "transformToWebStream" in getRes.Body && typeof getRes.Body.transformToWebStream === "function"
        ? (getRes.Body.transformToWebStream() as unknown as BodyInit)
        : (Readable.toWeb(getRes.Body as Readable) as unknown as BodyInit);

      return new NextResponse(bodyStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "application/pdf",
          "Cache-Control": "private, no-transform, max-age=0, must-revalidate",
        },
      });
    } else {
      // 5b. Full Stream GET
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const getRes = await client.send(getCommand);
      const totalSize = getRes.ContentLength?.toString() || "";

      const bodyStream = getRes.Body && "transformToWebStream" in getRes.Body && typeof getRes.Body.transformToWebStream === "function"
        ? (getRes.Body.transformToWebStream() as unknown as BodyInit)
        : (Readable.toWeb(getRes.Body as Readable) as unknown as BodyInit);

      return new NextResponse(bodyStream, {
        status: 200,
        headers: {
          "Accept-Ranges": "bytes",
          ...(totalSize ? { "Content-Length": totalSize } : {}),
          "Content-Type": "application/pdf",
          "Cache-Control": "private, no-transform, max-age=0, must-revalidate",
        },
      });
    }
  } catch (error: unknown) {
    console.error("[PDF Stream Handler Error]:", error);
    return new NextResponse("Error streaming PDF file", { status: 500 });
  }
}

/**
 * Support HEAD request for PDF.js document probing.
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const { bookSlug } = await params;
  const cleanSlug = typeof bookSlug === "string" ? bookSlug.trim() : "";

  if (!cleanSlug) {
    return new NextResponse(null, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return new NextResponse(null, { status: 403 });
  }

  const book = await prisma.book.findUnique({
    where: { slug: cleanSlug },
    select: { id: true, r2ObjectKey: true, isActive: true },
  });

  if (!book || !book.isActive) {
    return new NextResponse(null, { status: 404 });
  }

  const access = await prisma.bookAccess.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: book.id,
      },
    },
    select: { status: true },
  });

  if (!access || access.status !== "ACTIVE") {
    return new NextResponse(null, { status: 403 });
  }

  const { client, bucketName } = getB2Client();
  const objectKey = book.r2ObjectKey || "books/medical-book.pdf";

  try {
    const headRes = await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": (headRes.ContentLength || 0).toString(),
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-transform, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
