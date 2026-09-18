import { z } from "zod";

export const createBookmarkSchema = z.object({
  bookSlug: z
    .string()
    .trim()
    .min(1, "বইয়ের স্লাগ আবশ্যক")
    .max(100, "বইয়ের স্লাগ ১০০ অক্ষরের বেশি হতে পারে না")
    .regex(/^[a-zA-Z0-9_-]+$/, "অবৈধ বইয়ের স্লাগ ফরম্যাট"),
  pageNumber: z
    .number()
    .int("পৃষ্ঠা নম্বর পূর্ণসংখ্যা হতে হবে")
    .min(1, "পৃষ্ঠা নম্বর অন্তত ১ হতে হবে")
    .max(5000, "পৃষ্ঠা নম্বর ৫০০০ এর বেশি হতে পারে না"),
  label: z
    .string()
    .trim()
    .max(50, "বুকমার্কের নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে")
    .optional(),
});

export const deleteBookmarkSchema = z.object({
  bookmarkId: z
    .string()
    .trim()
    .min(1, "বুকমার্ক আইডি আবশ্যক")
    .max(100, "অবৈধ বুকমার্ক আইডি"),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type DeleteBookmarkInput = z.infer<typeof deleteBookmarkSchema>;
