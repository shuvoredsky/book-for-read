"use client";

import dynamic from "next/dynamic";
import { ReaderLoading } from "./reader-loading";

const DynamicPdfReader = dynamic(
  () => import("./pdf-reader").then((mod) => mod.PdfReader),
  {
    ssr: false,
    loading: () => <ReaderLoading message="রিডার ইঞ্জিন চালু হচ্ছে..." />,
  }
);

interface ReaderViewProps {
  bookSlug: string;
  bookTitle: string;
  totalPages: number;
  initialPage?: number;
  userWatermark: {
    username: string;
    displayName?: string;
    email?: string;
  };
}

export function ReaderView({
  bookSlug,
  bookTitle,
  totalPages,
  initialPage = 1,
  userWatermark,
}: ReaderViewProps) {
  return (
    <DynamicPdfReader
      bookSlug={bookSlug}
      bookTitle={bookTitle}
      initialTotalPages={totalPages}
      initialPage={initialPage}
      userWatermark={userWatermark}
    />
  );
}
