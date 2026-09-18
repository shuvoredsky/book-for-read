import { z } from "zod";

export const saveProgressSchema = z.object({
  bookSlug: z.string().min(1, "বইয়ের স্লাগ আবশ্যক"),
  currentPage: z
    .number()
    .int("পৃষ্ঠা নম্বর পূর্ণসংখ্যা হতে হবে")
    .min(1, "পৃষ্ঠা নম্বর অন্তত ১ হতে হবে"),
  totalPages: z
    .number()
    .int("মোট পৃষ্ঠা সংখ্যা পূর্ণসংখ্যা হতে হবে")
    .min(1, "মোট পৃষ্ঠা সংখ্যা অন্তত ১ হতে হবে"),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
