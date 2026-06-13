const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Clear database
  await prisma.user.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.storyChapter.deleteMany({});
  await prisma.familyMember.deleteMany({});

  // 2. Create Admin and default Member users using env config
  const adminEmail = process.env.ADMIN_EMAIL || "madubana2005@gmail.com";
  const adminRawPassword = process.env.ADMIN_PASSWORD || "Madubana@01012005";
  const adminPassword = bcrypt.hashSync(adminRawPassword, 12);
  const memberPassword = bcrypt.hashSync("Sadasyaru@01012005", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Shreyas Poojari",
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "ADMIN",
      photo: "/images/shreyas.png",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Shridhar Poojari",
      email: "sadasyaru@poojari.com",
      password: memberPassword,
      role: "MEMBER",
      photo: null,
    },
  });

  console.log("Admin and default member users created.");

  // 3. Load dynamic seed data if present
  const seedDataPath = path.join(__dirname, "seedData.json");
  if (!fs.existsSync(seedDataPath)) {
    console.warn("⚠️  prisma/seedData.json not found. Skipping family tree, photos, and chapters seeding.");
    console.log("Seeding completed (admin users only).");
    return;
  }

  console.log("Loading family tree and gallery records from seedData.json...");
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

  // Seed family members
  if (seedData.members && Array.isArray(seedData.members)) {
    console.log(`Seeding ${seedData.members.length} family members...`);
    for (const item of seedData.members) {
      await prisma.familyMember.create({
        data: {
          id: item.id,
          name: item.name,
          gender: item.gender,
          birthDate: item.birthDate,
          deathDate: item.deathDate,
          occupation: item.occupation,
          education: item.education,
          bio: item.bio,
          photo: item.photo,
          fatherId: item.fatherId,
          motherId: item.motherId,
          spouseId: item.spouseId,
          timeline: item.timeline,
          achievements: item.achievements,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        }
      });
    }
  }

  // Seed albums & photos
  if (seedData.albums && Array.isArray(seedData.albums)) {
    console.log(`Seeding ${seedData.albums.length} albums...`);
    for (const album of seedData.albums) {
      await prisma.album.create({
        data: {
          id: album.id,
          title: album.title,
          category: album.category,
          familyGroup: album.familyGroup,
          createdAt: album.createdAt ? new Date(album.createdAt) : undefined,
          updatedAt: album.updatedAt ? new Date(album.updatedAt) : undefined,
        }
      });

      if (album.photos && Array.isArray(album.photos)) {
        for (const photo of album.photos) {
          await prisma.photo.create({
            data: {
              id: photo.id,
              albumId: album.id,
              imageUrl: photo.imageUrl,
              caption: photo.caption,
              createdAt: photo.createdAt ? new Date(photo.createdAt) : undefined,
            }
          });
        }
      }
    }
  }

  // Seed chapters
  if (seedData.chapters && Array.isArray(seedData.chapters)) {
    console.log(`Seeding ${seedData.chapters.length} book chapters...`);
    for (const ch of seedData.chapters) {
      await prisma.storyChapter.create({
        data: {
          id: ch.id,
          chapter: ch.chapter,
          title: ch.title,
          content: ch.content,
          createdAt: ch.createdAt ? new Date(ch.createdAt) : undefined,
          updatedAt: ch.updatedAt ? new Date(ch.updatedAt) : undefined,
        }
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
