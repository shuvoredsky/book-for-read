import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed or Upsert the Medical Book record
  const book = await prisma.book.upsert({
    where: { slug: "medical-handbook" },
    update: {
      title: "Essential Clinical Medicine & Practical Guide",
      description:
        "A comprehensive, high-yield digital clinical handbook for medical students, interns, and healthcare professionals in Bangladesh.",
      price: 100,
      r2ObjectKey: "books/medical-book.pdf",
      totalPages: 240,
      isActive: true,
    },
    create: {
      title: "Essential Clinical Medicine & Practical Guide",
      slug: "medical-handbook",
      description:
        "A comprehensive, high-yield digital clinical handbook for medical students, interns, and healthcare professionals in Bangladesh.",
      price: 100,
      r2ObjectKey: "books/medical-book.pdf",
      totalPages: 240,
      isActive: true,
    },
  });

  console.log(`✅ Medical book seeded: "${book.title}" (ID: ${book.id}, Price: ৳${book.price})`);

  // 2. Seed Initial Admin Account (if not exists)
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@medicalbook.com";
  const adminUsername = process.env.ADMIN_INITIAL_USERNAME || "admin";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "System Administrator",
      username: adminUsername,
      email: adminEmail,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`✅ Administrator user verified: ${admin.email} (Role: ${admin.role})`);
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
