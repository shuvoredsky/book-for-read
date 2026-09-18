import { z } from "zod";

export const createBookmarkSchema = z.object({
  bookSlug: z.string().min(1, "বইয়ের স্লাগ আবশ্যক"),
  pageNumber: z
    .number()
    .int("পৃষ্ঠা নম্বর পূর্ণসংখ্যা হতে হবে")
    .min(1, "পৃষ্ঠা নম্বর অন্তত ১ হতে হবে"),
  label: z
    .string()
    .max(50, "বুকমার্কের নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে")
    .optional(),
});

export const deleteBookmarkSchema = z.object({
  bookmarkId: z.string().min(1, "বুকমার্ক আইডি আবশ্যক"),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type DeleteBookmarkInput = z.infer<typeof deleteBookmarkSchema>;
