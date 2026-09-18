import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
    .max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  username: z
    .string()
    .min(3, "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে")
    .max(30, "ইউজারনেম ৩০ অক্ষরের মধ্যে হতে হবে")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "ইউজারনেমে শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং আন্ডারস্কোর (_) ব্যবহার করা যাবে"
    ),
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

export const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
