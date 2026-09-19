"use server";

import { getCurrentUser } from "@/server/auth";
import { verifyUserBookAccess } from "@/server/access";
import type { ActionResponse } from "@/types";

export interface PresignedUrlData {
  presignedUrl: string;
  expiresIn: number;
  bookTitle: string;
  totalPages: number;
  userWatermark: string;
}

// In-memory cooldown tracker to avoid hammering Backblaze B2 with rapid duplicate presign requests
// Map<`${userId}:${bookSlug}`, lastRequestTimestampMs>
const requestCooldownMap = new Map<string, number>();
const COOLDOWN_WINDOW_MS = 2000; // 2 seconds debounce guard

/**
 * Generates a short-lived Backblaze B2 presigned GET URL for authorized readers.
 * Strictly verifies authentication, active user status, active book status, and active BookAccess.
 * Never stores the presigned URL in the database.
 */
export async function getBookReadUrlAction(
  bookSlug: string
): Promise<ActionResponse<PresignedUrlData>> {
  try {
    // 1. Validate input parameter
    const cleanSlug = typeof bookSlug === "string" ? bookSlug.trim() : "";
    if (!cleanSlug || cleanSlug.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(cleanSlug)) {
      return {
        success: false,
        error: "অবৈধ বইয়ের তথ্য প্রদান করা হয়েছে।",
      };
    }

    // 2. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "অননুমোদিত এক্সেস। বই পড়ার জন্য অনুগ্রহ করে প্রথমে লগইন করুন।",
      };
    }

    // 2. Cooldown guard: prevent rapid repeated calls
    const cooldownKey = `${user.id}:${cleanSlug}`;
    const now = Date.now();
    const lastRequest = requestCooldownMap.get(cooldownKey);
    if (lastRequest && now - lastRequest < COOLDOWN_WINDOW_MS) {
      return {
        success: false,
        error: "অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে পুনরায় চেষ্টা করুন।",
      };
    }
    requestCooldownMap.set(cooldownKey, now);

    // Prune stale entries if Map grows large (> 5000 entries)
    if (requestCooldownMap.size > 5000) {
      const cutoff = now - 3600000; // Older than 1 hour
      for (const [key, timestamp] of requestCooldownMap.entries()) {
        if (timestamp < cutoff) {
          requestCooldownMap.delete(key);
        }
      }
    }

    // 3. Sequentially verify:
    // a. User exists & status === "ACTIVE"
    // b. Book exists & isActive === true & matches slug
    // c. BookAccess exists & status === "ACTIVE"
    // (Reuses centralized verifyUserBookAccess from Phase 7)
    const verification = await verifyUserBookAccess(user.id, cleanSlug);

    if (!verification.authorized || !verification.book) {
      if (verification.reason === "ACCESS_REVOKED") {
        return {
          success: false,
          error: "এডমিন কর্তৃক আপনার রিডার এক্সেস সাময়িকভাবে বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে সাপোর্টে যোগাযোগ করুন।",
        };
      }
      if (verification.reason === "NO_ACCESS") {
        return {
          success: false,
          error: "বইটি পড়ার জন্য সক্রিয় BookAccess প্রয়োজন। অনুগ্রহ করে ড্যাশবোর্ড থেকে পেমেন্ট সম্পন্ন করুন।",
        };
      }
      if (verification.reason === "USER_INACTIVE") {
        return {
          success: false,
          error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় অবস্থায় রয়েছে।",
        };
      }
      return {
        success: false,
        error: "বইটি বর্তমানে পড়ার জন্য উপলব্ধ নয়।",
      };
    }

    const book = verification.book;

    // 4. Return protected same-origin streaming endpoint to client (never expose raw B2 URL)
    return {
      success: true,
      data: {
        presignedUrl: `/api/books/${cleanSlug}/pdf`,
        expiresIn: 3600,
        bookTitle: book.title,
        totalPages: book.totalPages,
        userWatermark: `@${user.username} (${user.email})`,
      },
    };
  } catch (error: unknown) {
    console.error("[Presigned URL Error]: Failed in getBookReadUrlAction:", error);
    return {
      success: false,
      error: "সার্ভারে রিডিং লিংক প্রক্রিয়াকরণে সমস্যা হয়েছে।",
    };
  }
}
