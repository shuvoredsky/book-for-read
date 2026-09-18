import { z } from "zod";

export const paymentMethods = ["bKash", "Nagad", "Rocket"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentSubmissionSchema = z.object({
  paymentMethod: z.enum(paymentMethods, {
    error: "অনুগ্রহ করে একটি সঠিক পেমেন্ট মেথড (bKash, Nagad বা Rocket) নির্বাচন করুন",
  }),
  transactionId: z
    .string()
    .min(5, "ট্রানজেকশন আইডি (TxID) কমপক্ষে ৫ অক্ষরের হতে হবে")
    .max(40, "ট্রানজেকশন আইডি (TxID) সর্বোচ্চ ৪০ অক্ষরের হতে হবে")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "ট্রানজেকশন আইডিতে শুধুমাত্র ইংরেজি বর্ণ এবং সংখ্যা ব্যবহার করুন"
    ),
  senderNumber: z
    .string()
    .min(11, "প্রেরক মোবাইল নম্বর কমপক্ষে ১১ ডিজিটের হতে হবে")
    .max(15, "প্রেরক মোবাইল নম্বর সর্বোচ্চ ১৫ ডিজিটের হতে হবে")
    .regex(
      /^(?:\+88|88)?(01[3-9]\d{8})$/,
      "সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)"
    ),
  amount: z.number().min(100, "বইয়ের মূল্য ১০০ টাকা").max(100, "বইয়ের মূল্য ১০০ টাকা"),
  note: z.string().max(300, "নোট সর্বোচ্চ ৩০০ অক্ষরের হতে হবে").optional(),
});

export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;
