"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { verifyPassword } from "better-auth/crypto";
import prisma from "@/lib/prisma";
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth";
import type { ActionResponse, SafeUser } from "@/types";

export async function registerUserAction(
  data: RegisterInput
): Promise<ActionResponse<SafeUser>> {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ ইনপুট ডাটা",
      };
    }

    const { name, username, email, password } = parsed.data;
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });
    if (existingUsername) {
      return {
        success: false,
        error: "এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে অন্য ইউজারনেম দিন।",
      };
    }

    // 2. Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return {
        success: false,
        error: "এই ইমেইল এড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন।",
      };
    }

    // 3. Register user via Better Auth API
    const reqHeaders = await headers();
    const res = await auth.api.signUpEmail({
      headers: reqHeaders,
      body: {
        name: name.trim(),
        email: cleanEmail,
        password,
        username: cleanUsername,
      },
    });

    if (!res || !res.user) {
      return {
        success: false,
        error: "রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
      };
    }

    return {
      success: true,
      message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      data: {
        id: res.user.id,
        name: res.user.name,
        username: cleanUsername,
        email: cleanEmail,
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }
}

export async function loginUserAction(
  data: LoginInput
): Promise<ActionResponse<{ redirectUrl?: string; existingSessionDetected?: boolean; message?: string }>> {
  try {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ ইনপুট ডাটা",
      };
    }

    const { email, password, forceLogin } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      return {
        success: false,
        error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        error: "আপনার একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।",
      };
    }

    // 2. Validate password against Account credential
    const account = await prisma.account.findFirst({
      where: { userId: user.id },
      select: { password: true },
    });

    if (!account?.password) {
      return {
        success: false,
        error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    const isPasswordValid = await verifyPassword({
      hash: account.password,
      password,
    });

    if (!isPasswordValid) {
      return {
        success: false,
        error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    // 3. Single-Device Check: Check for existing active sessions in database
    const now = new Date();
    const existingSessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: now },
      },
      select: { id: true },
    });

    // If active session exists and user has NOT explicitly confirmed force login:
    if (existingSessions.length > 0 && !forceLogin) {
      return {
        success: true,
        data: {
          existingSessionDetected: true,
          message:
            "আপনার অ্যাকাউন্ট অন্য একটি ডিভাইসে সক্রিয় আছে। এখানে লগইন করতে চাইলে আগের ডিভাইস থেকে স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে। আপনি কি চালিয়ে যেতে চান?",
        },
      };
    }

    // 4. Invalidate all existing sessions for this user (both Session and DeviceSession tables)
    if (existingSessions.length > 0) {
      await prisma.$transaction([
        prisma.session.deleteMany({
          where: { userId: user.id },
        }),
        prisma.deviceSession.deleteMany({
          where: { userId: user.id },
        }),
      ]);
    }

    // 5. Sign in user via Better Auth API and issue new session cookie
    const reqHeaders = await headers();
    const res = await auth.api.signInEmail({
      headers: reqHeaders,
      body: {
        email: cleanEmail,
        password,
      },
    });

    if (!res || !res.user) {
      return {
        success: false,
        error: "লগইন প্রক্রিয়া সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।",
      };
    }

    // 6. Record DeviceSession for active device tracking
    try {
      const userAgent = reqHeaders.get("user-agent") || undefined;
      const ipAddress =
        reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        reqHeaders.get("x-real-ip") ||
        undefined;

      await prisma.deviceSession.create({
        data: {
          userId: user.id,
          deviceId: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          deviceName: userAgent ? userAgent.substring(0, 100) : "Web Browser",
          userAgent,
          ipAddress,
          lastActiveAt: new Date(),
        },
      });
    } catch {
      // Non-critical device session logging fallback
    }

    const redirectUrl = user.role === "ADMIN" ? "/admin" : "/dashboard";

    return {
      success: true,
      data: {
        redirectUrl,
        existingSessionDetected: false,
      },
    };
  } catch (error: unknown) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
    };
  }
}
