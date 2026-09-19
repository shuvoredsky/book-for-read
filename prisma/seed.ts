import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed or Upsert the initial Book record
  const book = await prisma.book.upsert({
    where: { slug: "medical-handbook" },
    update: {
      title: "বিস্ময় মানবদেহ",
      description:
        "১২১ দিনের মেডিকেল যাত্রা - লেখক: Shuvo Chakrabrati। শিক্ষণীয় ডিজিটাল মেডিকেল গাইডবুক।",
      price: 100,
      totalPages: 384,
      isActive: true,
    },
    create: {
      title: "বিস্ময় মানবদেহ",
      slug: "medical-handbook",
      description:
        "১২১ দিনের মেডিকেল যাত্রা - লেখক: Shuvo Chakrabrati। শিক্ষণীয় ডিজিটাল মেডিকেল গাইডবুক।",
      price: 100,
      r2ObjectKey: "books/121_days_medical_book.pdf",
      totalPages: 384,
      isActive: true,
    },
  });

  console.log(`✅ Book verified: "${book.title}" (ID: ${book.id}, Price: ৳${book.price})`);

  // 2. Seed Initial Admin Account (if not exists)
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "kumarshuvo265@gmail.com").toLowerCase().trim();
  const adminUsername = (process.env.ADMIN_INITIAL_USERNAME || "kumarshuvo").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD;

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (existingAdmin) {
    // Admin user already exists; ensure role is ADMIN
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Existing administrator account verified: ${adminEmail} (Role: ADMIN)`);
  } else if (adminPassword) {
    // Create new admin account via Better Auth API with hashed password
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: "Shuvo Chakrabrati",
          email: adminEmail,
          password: adminPassword,
          username: adminUsername,
        },
      });

      if (res?.user) {
        await prisma.user.update({
          where: { id: res.user.id },
          data: { role: "ADMIN", status: "ACTIVE" },
        });
        console.log(`✅ Initial administrator created via Better Auth: ${adminEmail} (Role: ADMIN)`);
      }
    } catch (authError) {
      console.warn("⚠️ Better Auth signUpEmail encountered an error, falling back to direct database upsert:", authError);
      const fallbackUser = await prisma.user.create({
        data: {
          name: "Shuvo Chakrabrati",
          username: adminUsername,
          email: adminEmail,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
      console.log(`✅ Administrator record created: ${fallbackUser.email} (Role: ADMIN)`);
    }
  } else {
    // Admin password not set in env; create base user record and prompt
    const userRecord = await prisma.user.create({
      data: {
        name: "Shuvo Chakrabrati",
        username: adminUsername,
        email: adminEmail,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Administrator record created: ${userRecord.email} (Role: ADMIN)`);
    console.log("ℹ️ To enable instant password login for this admin, either set ADMIN_INITIAL_PASSWORD in .env before seeding or use /register with this email.");
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

