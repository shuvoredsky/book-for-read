export const siteConfig = {
  name: "Medical Clinical Handbook",
  nameBn: "মেডিকেল ক্লিনিক্যাল হ্যান্ডবুক",
  description:
    "A comprehensive, high-yield digital clinical handbook for medical students, interns, and healthcare professionals in Bangladesh.",
  descriptionBn:
    "মেডিকেল শিক্ষার্থী, ইন্টার্ন ডক্টর এবং স্বাস্থ্যসেবা পেশাজীবীদের জন্য একটি পূর্ণাঙ্গ ডিজিটাল ক্লিনিক্যাল গাইড।",
  book: {
    title: "Essential Clinical Medicine & Practical Guide",
    titleBn: "এসেনশিয়াল ক্লিনিক্যাল মেডিসিন ও প্র্যাকটিক্যাল গাইড",
    price: 100, // 100 BDT as per specification
    currency: "BDT",
    slug: "medical-handbook",
    totalPages: 240,
    r2ObjectKey: "books/medical-book.pdf",
    highlights: [
      "কমপ্লিট ওয়ার্ড রাউন্ড গাইড এবং ক্লিনিক্যাল কেস ডায়াগনোসিস",
      "জরুরি চিকিৎসা ও প্রেসক্রিপশন হ্যান্ডলিং প্রোটোকল",
      "স্মার্ট অনলাইন রিডার (মোবাইল, ট্যাবলেট ও ডেস্কটপ সাপোর্ট)",
      "বুকমার্কিং (৩টি পর্যন্ত) এবং কন্টিনিউ রিডিং সুবিধা",
      "সার্চ ও চ্যাপ্টারভিত্তিক টেবিল অব কন্টেন্টস",
    ],
  },
  links: {
    // Configurable Facebook / Messenger payment contact URL
    messengerContact:
      process.env.NEXT_PUBLIC_MESSENGER_URL ||
      process.env.FACEBOOK_MESSENGER_URL ||
      "https://m.me/your-facebook-page",
    whatsappContact: "https://wa.me/8801700000000",
  },
  mainNav: [
    { title: "হোম (Home)", href: "/" },
    { title: "বইয়ের বিবরণ (About Book)", href: "/#about" },
    { title: "ফিচারসমূহ (Features)", href: "/#features" },
    { title: "পেমেন্ট পদ্ধতি (Payment)", href: "/#pricing" },
  ],
};

export type SiteConfig = typeof siteConfig;
