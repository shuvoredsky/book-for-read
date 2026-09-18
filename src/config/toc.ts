export interface TocItem {
  id: string;
  title: string;
  titleBn?: string;
  page: number;
  level?: number;
  children?: TocItem[];
}

export const defaultTableOfContents: TocItem[] = [
  {
    id: "chap-1",
    title: "Chapter 1: History Taking & General Physical Examination",
    titleBn: "অধ্যায় ১: হিস্ট্রি টেকিং ও জেনারেল ফিজিক্যাল এক্সামিনেশন",
    page: 1,
    level: 1,
  },
  {
    id: "chap-2",
    title: "Chapter 2: Cardiovascular System (CVS) Management",
    titleBn: "অধ্যায় ২: কার্ডিওভাসকুলার সিস্টেম (CVS) ম্যানেজমেন্ট",
    page: 25,
    level: 1,
  },
  {
    id: "chap-3",
    title: "Chapter 3: Respiratory System & Emergency Protocol",
    titleBn: "অধ্যায় ৩: রেসপিরেটরি সিস্টেম ও ইমার্জেন্সি প্রোটোকল",
    page: 65,
    level: 1,
  },
  {
    id: "chap-4",
    title: "Chapter 4: Gastrointestinal & Hepatobiliary System",
    titleBn: "অধ্যায় ৪: গ্যাস্ট্রোইন্টেস্টাইনাল ও হেপাটোবিলিয়ারি সিস্টেম",
    page: 110,
    level: 1,
  },
  {
    id: "chap-5",
    title: "Chapter 5: Neurology & Acute Stroke Protocol",
    titleBn: "অধ্যায় ৫: নিউরোলজি ও স্ট্রোক প্রোটোকল",
    page: 160,
    level: 1,
  },
  {
    id: "chap-6",
    title: "Chapter 6: Emergency Drug Dosing & Fluid Calculation",
    titleBn: "অধ্যায় ৬: জরুরি ওষুধের ডোজ ও ফ্লুইড ক্যালকুলেশন",
    page: 210,
    level: 1,
  },
];
