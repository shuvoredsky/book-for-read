import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProtectedPdfBuffer } from "@/server/pdf-cache";

export const dynamic = "force-dynamic";

/**
 * Protected Same-Origin PDF Endpoint.
 * 
 * Strict Multi-Layer Security Verification:
 * 1. Validates Better Auth user session cookie.
 * 2. Validates User exists in database and status is "ACTIVE" (rejects BANNED/SUSPENDED users).
 * 3. Validates Book exists and isActive is true.
 * 4. Validates User has an explicit "ACTIVE" BookAccess record.
 * 5. Serves the protected PDF bytes exclusively to authorized readers.
 * 6. Never exposes Backblaze B2 URLs or credentials to the browser.
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
    return new NextResponse("Unauthorized: Authentication required", { status: 401 });
  }

  // 2. Verify User status in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return new NextResponse("Forbidden: Account suspended or inactive", { status: 403 });
  }

  // 3. Verify active Book
  const book = await prisma.book.findUnique({
    where: { slug: cleanSlug },
    select: { id: true, title: true, r2ObjectKey: true, isActive: true },
  });

  if (!book || !book.isActive) {
    return new NextResponse("Not Found: Book is not available", { status: 404 });
  }

  // 4. Verify BookAccess record is strictly ACTIVE
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
    return new NextResponse("Forbidden: Book access not granted or revoked", { status: 403 });
  }

  // 5. Retrieve PDF bytes via server-side cache and private B2 vault
  try {
    const objectKey = book.r2ObjectKey || "books/medical-book.pdf";
    const pdfBuffer = await getProtectedPdfBuffer(objectKey);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return new NextResponse("Error: Empty PDF content", { status: 500 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Content-Disposition": `inline; filename="${cleanSlug}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: unknown) {
    console.error("[Protected PDF Route Error]:", error);
    return new NextResponse("Error retrieving protected book content", { status: 500 });
  }
}

/**
 * Probing HEAD method for metadata checking.
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

  try {
    const objectKey = book.r2ObjectKey || "books/medical-book.pdf";
    const pdfBuffer = await getProtectedPdfBuffer(objectKey);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
