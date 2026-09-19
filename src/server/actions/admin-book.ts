"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import prisma from "@/lib/prisma";
import { uploadPdfToB2 } from "@/lib/b2";
import type { ActionResponse } from "@/types";

export async function uploadBookPdfAction(
  formData: FormData
): Promise<ActionResponse<{ objectKey: string; size: number }>> {
  try {
    const admin = await requireAdmin();

    const file = formData.get("pdfFile") as File | null;
    const customKey = (formData.get("customObjectKey") as string | null)?.trim();
    const totalPagesStr = formData.get("totalPages") as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return {
        success: false,
        error: "অনুগ্রহ করে একটি বৈধ পিডিএফ (.pdf) ফাইল নির্বাচন করুন।",
      };
    }

    // 1. Validate MIME type and file extension
    const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfExtension && file.type !== "application/pdf") {
      return {
        success: false,
        error: "শুধুমাত্র .pdf ফরম্যাটের ফাইল আপলোড করা যাবে।",
      };
    }

    // 2. Validate max file size (100MB max limit)
    const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE_BYTES) {
      return {
        success: false,
        error: "ফাইলের সাইজ সর্বোচ্চ ১০০ মেগাবাইট (100MB) হতে পারে।",
      };
    }

    // 3. Read array buffer and check PDF magic bytes (%PDF)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfHeader = buffer.subarray(0, 5).toString("ascii");
    if (!pdfHeader.startsWith("%PDF")) {
      return {
        success: false,
        error: "ফাইলটি সঠিক পিডিএফ ফাইল নয়।",
      };
    }

    // 4. Determine object key in Backblaze B2
    const targetObjectKey = customKey || "books/medical-book.pdf";

    // 5. Upload binary to Backblaze B2 S3 storage
    const uploadResult = await uploadPdfToB2(buffer, targetObjectKey, "application/pdf");
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || "Backblaze B2 স্টোরেজে আপলোড ব্যর্থ হয়েছে।",
      };
    }

    // 6. Update Book record in Prisma
    const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : 384;

    const updatedBook = await prisma.book.upsert({
      where: { slug: "medical-handbook" },
      update: {
        r2ObjectKey: targetObjectKey,
        ...(totalPages && !isNaN(totalPages) ? { totalPages } : {}),
      },
      create: {
        title: "বিস্ময় মানবদেহ",
        slug: "medical-handbook",
        description:
          "১২১ দিনের মেডিকেল যাত্রা - লেখক: Shuvo Chakrabrati। শিক্ষণীয় ডিজিটাল মেডিকেল গাইডবুক।",
        price: 100,
        r2ObjectKey: targetObjectKey,
        totalPages: totalPages || 384,
        isActive: true,
      },
    });

    // 7. Record Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "BOOK_UPDATED",
        target: `Book:${updatedBook.id}`,
        metadata: {
          objectKey: targetObjectKey,
          fileName: file.name,
          fileSize: file.size,
          storage: "Backblaze B2",
        },
      },
    });

    revalidatePath("/admin/book");
    revalidatePath("/reader/medical-handbook");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `পিডিএফ সফলভাবে Backblaze B2-তে আপলোড করা হয়েছে (${(file.size / (1024 * 1024)).toFixed(2)} MB)।`,
      data: {
        objectKey: targetObjectKey,
        size: file.size,
      },
    };
  } catch (error: unknown) {
    console.error("Upload book PDF action error:", error);
    return {
      success: false,
      error: "সার্ভারে ফাইল প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে B2 ক্রেডেনশিয়ালস ও নেটওয়ার্ক সংযোগ যাচাই করুন।",
    };
  }
}
