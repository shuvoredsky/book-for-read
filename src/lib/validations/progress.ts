import { z } from "zod";

export const saveProgressSchema = z.object({
  bookSlug: z
    .string()
    .trim()
    .min(1, "বইয়ের স্লাগ আবশ্যক")
    .max(100, "বইয়ের স্লাগ ১০০ অক্ষরের বেশি হতে পারে না")
    .regex(/^[a-zA-Z0-9_-]+$/, "অবৈধ বইয়ের স্লাগ ফরম্যাট"),
  currentPage: z
    .number()
    .int("পৃষ্ঠা নম্বর পূর্ণসংখ্যা হতে হবে")
    .min(1, "পৃষ্ঠা নম্বর অন্তত ১ হতে হবে")
    .max(5000, "পৃষ্ঠা নম্বর ৫০০০ এর বেশি হতে পারে না"),
  totalPages: z
    .number()
    .int("মোট পৃষ্ঠা সংখ্যা পূর্ণসংখ্যা হতে হবে")
    .min(1, "মোট পৃষ্ঠা সংখ্যা অন্তত ১ হতে হবে")
    .max(5000, "মোট পৃষ্ঠা সংখ্যা ৫০০০ এর বেশি হতে পারে না"),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
