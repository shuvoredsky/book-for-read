"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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
): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "অবৈধ ইনপুট ডাটা",
      };
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if account exists and status is active
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, role: true, status: true },
    });

    if (user && user.status === "SUSPENDED") {
      return {
        success: false,
        error: "আপনার একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।",
      };
    }

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
        error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    const redirectUrl = user?.role === "ADMIN" ? "/admin" : "/dashboard";

    return {
      success: true,
      data: { redirectUrl },
    };
  } catch (error: unknown) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
    };
  }
}
