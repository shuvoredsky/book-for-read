import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.nameBn} (${siteConfig.name}) - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.nameBn}`,
  },
  description: siteConfig.description,
  keywords: [
    "Digital Book Reader",
    "Bangla Book Reader",
    "PDF Book Platform",
    "বইঘর",
    "ডিজিটাল বই",
    "অনলাইন বই রিডার",
    "বিস্ময় মানবদেহ",
  ],
  authors: [{ name: siteConfig.book.author }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteConfig.links.messengerContact,
    title: `${siteConfig.nameBn} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.nameBn,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.nameBn} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary font-sans flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
