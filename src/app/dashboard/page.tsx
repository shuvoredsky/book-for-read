import { Metadata } from "next";
import { requireAuth } from "@/server/auth";
import { getUserDashboardData } from "@/server/services/dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AccessStatusCard } from "@/components/dashboard/access-status-card";
import { ContinueReadingCard } from "@/components/dashboard/continue-reading-card";
import { BookmarksCard } from "@/components/dashboard/bookmarks-card";
import { BookInfoCard } from "@/components/dashboard/book-info-card";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ইউজার ড্যাশবোর্ড (Dashboard)",
  description: "আপনার মেডিকেল বুক রিডিং ড্যাশবোর্ড, বুকমার্ক এবং প্রগ্রেস ট্র্যাকার",
};

export default async function DashboardPage() {
  // 1. Enforce Server-Side Authentication
  const user = await requireAuth();

  // 2. Fetch real database entities
  const data = await getUserDashboardData(user);

  const hasActiveAccess = data.bookAccess?.status === "ACTIVE";
  const bookSlug = data.book?.slug || siteConfig.book.slug;
  const totalPages = data.book?.totalPages || siteConfig.book.totalPages;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Section */}
          <DashboardHeader user={user} hasAccess={hasActiveAccess} />

          {/* Access / Payment Status Banner */}
          <AccessStatusCard
            bookSlug={bookSlug}
            hasActiveAccess={hasActiveAccess}
            latestPayment={data.latestPayment}
          />

          {/* Main 2-Column Responsive Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols on desktop): Reading Progress & Bookmarks */}
            <div className="lg:col-span-8 space-y-6">
              <ContinueReadingCard
                bookSlug={bookSlug}
                hasAccess={hasActiveAccess}
                readingProgress={data.readingProgress}
                totalBookPages={totalPages}
              />

              <BookmarksCard
                bookSlug={bookSlug}
                hasAccess={hasActiveAccess}
                bookmarks={data.bookmarks}
              />
            </div>

            {/* Right Column (4 cols on desktop): Book Details & User Info */}
            <div className="lg:col-span-4 space-y-6">
              <BookInfoCard
                book={{
                  title: data.book?.title || siteConfig.book.title,
                  description:
                    data.book?.description || siteConfig.description,
                  price: data.book?.price || siteConfig.book.price,
                  totalPages: totalPages,
                }}
              />

              <UserProfileCard user={user} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
