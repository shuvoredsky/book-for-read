export const siteConfig = {
  name: "BoiGhor",
  nameBn: "বইঘর",
  tagline: "ডিজিটাল বুক রিডার",
  description:
    "একটি আধুনিক, সহজ ও সুরক্ষিত ডিজিটাল বই পড়ার প্ল্যাটফর্ম।",
  descriptionBn:
    "একটি আধুনিক, সহজ ও সুরক্ষিত ডিজিটাল বই পড়ার প্ল্যাটফর্ম।",
  book: {
    title: "বিস্ময় মানবদেহ",
    subtitle: "১২১ দিনের মেডিকেল যাত্রা",
    author: "Shuvo Chakrabrati",
    price: 100, // 100 BDT as per specification
    currency: "BDT",
    slug: "medical-handbook",
    totalPages: 384,
    r2ObjectKey: "books/121_days_medical_book.pdf",
    description:
      "মানবদেহের গঠন ও কার্যপ্রণালীর চমকপ্রদ ব্যাখ্যা এবং শিক্ষণীয় অন্তর্দৃষ্টি নিয়ে রচিত পূর্ণাঙ্গ ডিজিটাল বই।",
    highlights: [
      "স্মার্ট অনলাইন রিডার (মোবাইল, ট্যাবলেট ও ডেস্কটপ সাপোর্ট)",
      "বুকমার্কিং এবং রিয়েল-টাইম রিডিং প্রগ্রেস ট্র্যাকিং",
      "ইন-বুক টেক্সট সার্চ ও চ্যাপ্টারভিত্তিক টেবিল অব কন্টেন্টস",
    ],
  },
  links: {
    // Direct Facebook profile contact URL (used across all CTAs and support links)
    messengerContact:
      process.env.NEXT_PUBLIC_MESSENGER_URL ||
      process.env.FACEBOOK_MESSENGER_URL ||
      "https://www.facebook.com/sk.shuvo.129794",
    whatsappContact: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/8801700000000",
  },
  mainNav: [
    { title: "হোম", href: "/" },
    { title: "নিয়মাবলী", href: "/rules" },
  ],
};

export type SiteConfig = typeof siteConfig;
