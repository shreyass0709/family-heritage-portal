const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { PrismaClient } = require("@prisma/client");
const { UTApi } = require("uploadthing/server");
const sharp = require("sharp");

// 1. Load .env environment variables manually
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  console.log("Loading environment variables from .env file...");
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

const token = process.env.UPLOADTHING_TOKEN;
if (!token) {
  console.error("Error: UPLOADTHING_TOKEN is not configured in .env!");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not configured in .env!");
  process.exit(1);
}

// 2. Initialize database clients
console.log("Initializing database clients...");
const localDb = new DatabaseSync("./prisma/dev.db");
const prisma = new PrismaClient();
const utapi = new UTApi({ token });

// Helper to convert date values safely
function parseDate(val) {
  if (!val) return new Date();
  const date = new Date(val);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Map local files and upload them to UploadThing in WebP format
async function uploadLocalFile(localPath, prefix) {
  if (!localPath) return null;
  
  // Skip if it is already a remote URL (e.g. starts with http or https)
  if (localPath.startsWith("http://") || localPath.startsWith("https://")) {
    return localPath;
  }
  
  // Normalize the path
  let relativePath = localPath;
  if (relativePath.startsWith("/")) {
    relativePath = relativePath.substring(1);
  }
  
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(absolutePath)) {
    console.warn(`[WARNING] File not found locally at: ${absolutePath}`);
    return localPath; // Keep the original path if the file is missing
  }
  
  try {
    const buffer = fs.readFileSync(absolutePath);
    let webpBuffer = buffer;
    let mimeType = "image/png";
    let filename = path.basename(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    
    // Convert to WebP using sharp if it's an image
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      if (ext !== ".webp") {
        console.log(`Converting local image ${filename} to WebP...`);
        webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        mimeType = "image/webp";
        filename = path.basename(absolutePath, ext) + ".webp";
      } else {
        mimeType = "image/webp";
      }
    } else {
      console.warn(`[WARNING] Skipping non-image file: ${filename}`);
      return localPath;
    }
    
    // Create custom prefix
    const safePrefix = prefix ? prefix.toLowerCase().replace(/[^a-z0-9]/g, "_") : "photo";
    const finalFilename = `${safePrefix}_${Date.now()}_${filename}`;
    
    const file = new File([new Uint8Array(webpBuffer)], finalFilename, { type: mimeType });
    console.log(`Uploading ${finalFilename} to UploadThing...`);
    const response = await utapi.uploadFiles([file]);
    
    if (response && response[0] && response[0].data) {
      const remoteUrl = response[0].data.url;
      console.log(`Uploaded: ${localPath} -> ${remoteUrl}`);
      return remoteUrl;
    }
    
    const errMsg = response && response[0] && response[0].error ? response[0].error.message : "Unknown upload error";
    console.error(`[ERROR] UploadThing failed for ${filename}: ${errMsg}`);
    return localPath; // Fallback to original
  } catch (err) {
    console.error(`[ERROR] Processing/uploading local file ${localPath}:`, err);
    return localPath;
  }
}

async function migrate() {
  console.log("Starting Migration...");
  
  try {
    // Clear remote database first to prevent duplicate entries from prior seed scripts
    console.log("Clearing remote PostgreSQL database tables...");
    await prisma.photo.deleteMany({});
    await prisma.album.deleteMany({});
    await prisma.familyMember.deleteMany({});
    await prisma.storyChapter.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Remote database cleared successfully.");

    // -----------------------------------------------------------------
    // 1. Migrate Users
    // -----------------------------------------------------------------
    console.log("\n--- Migrating Users ---");
    const localUsers = localDb.prepare("SELECT * FROM User").all();
    console.log(`Found ${localUsers.length} users in local database.`);
    
    for (const u of localUsers) {
      console.log(`Migrating User: ${u.email}...`);
      let photoUrl = u.photo;
      if (photoUrl && !photoUrl.startsWith("http")) {
        photoUrl = await uploadLocalFile(photoUrl, "user_" + u.name);
      }
      
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          password: u.password,
          role: u.role,
          photo: photoUrl,
          createdAt: parseDate(u.createdAt),
          updatedAt: parseDate(u.updatedAt),
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          photo: photoUrl,
          createdAt: parseDate(u.createdAt),
          updatedAt: parseDate(u.updatedAt),
        }
      });
    }
    
    // -----------------------------------------------------------------
    // 2. Migrate Albums
    // -----------------------------------------------------------------
    console.log("\n--- Migrating Albums ---");
    const localAlbums = localDb.prepare("SELECT * FROM Album").all();
    console.log(`Found ${localAlbums.length} albums in local database.`);
    
    for (const a of localAlbums) {
      console.log(`Migrating Album: ${a.title}...`);
      await prisma.album.upsert({
        where: { id: a.id },
        update: {
          title: a.title,
          category: a.category,
          familyGroup: a.familyGroup,
          createdAt: parseDate(a.createdAt),
          updatedAt: parseDate(a.updatedAt),
        },
        create: {
          id: a.id,
          title: a.title,
          category: a.category,
          familyGroup: a.familyGroup,
          createdAt: parseDate(a.createdAt),
          updatedAt: parseDate(a.updatedAt),
        }
      });
    }

    // -----------------------------------------------------------------
    // 3. Migrate FamilyMembers (Pass 1 - Records without relationships)
    // -----------------------------------------------------------------
    console.log("\n--- Migrating FamilyMembers (Pass 1) ---");
    const localMembers = localDb.prepare("SELECT * FROM FamilyMember").all();
    console.log(`Found ${localMembers.length} family members in local database.`);
    
    const memberRelationships = []; // Storing links to apply in Pass 2
    
    for (const m of localMembers) {
      console.log(`Migrating FamilyMember: ${m.name}...`);
      
      let photoUrl = m.photo;
      if (photoUrl && !photoUrl.startsWith("http")) {
        photoUrl = await uploadLocalFile(photoUrl, "member_" + m.name);
      }
      
      // Store relationship details for pass 2
      memberRelationships.push({
        id: m.id,
        fatherId: m.fatherId,
        motherId: m.motherId,
        spouseId: m.spouseId,
      });

      await prisma.familyMember.upsert({
        where: { id: m.id },
        update: {
          name: m.name,
          gender: m.gender,
          birthDate: m.birthDate,
          deathDate: m.deathDate,
          occupation: m.occupation,
          education: m.education,
          bio: m.bio,
          photo: photoUrl,
          // Set to null temporarily to avoid foreign key violations in Pass 1
          fatherId: null,
          motherId: null,
          spouseId: null,
          timeline: m.timeline || "[]",
          achievements: m.achievements || "[]",
          createdAt: parseDate(m.createdAt),
          updatedAt: parseDate(m.updatedAt),
        },
        create: {
          id: m.id,
          name: m.name,
          gender: m.gender,
          birthDate: m.birthDate,
          deathDate: m.deathDate,
          occupation: m.occupation,
          education: m.education,
          bio: m.bio,
          photo: photoUrl,
          fatherId: null,
          motherId: null,
          spouseId: null,
          timeline: m.timeline || "[]",
          achievements: m.achievements || "[]",
          createdAt: parseDate(m.createdAt),
          updatedAt: parseDate(m.updatedAt),
        }
      });
    }

    // -----------------------------------------------------------------
    // 4. Update FamilyMembers (Pass 2 - Link relationships)
    // -----------------------------------------------------------------
    console.log("\n--- Linking FamilyMember Relationships (Pass 2) ---");
    for (const rel of memberRelationships) {
      if (rel.fatherId || rel.motherId || rel.spouseId) {
        console.log(`Updating links for member ID: ${rel.id}...`);
        await prisma.familyMember.update({
          where: { id: rel.id },
          data: {
            fatherId: rel.fatherId || null,
            motherId: rel.motherId || null,
            spouseId: rel.spouseId || null,
          }
        });
      }
    }

    // -----------------------------------------------------------------
    // 5. Migrate Photos
    // -----------------------------------------------------------------
    console.log("\n--- Migrating Photos ---");
    const localPhotos = localDb.prepare("SELECT * FROM Photo").all();
    console.log(`Found ${localPhotos.length} photos in local database.`);
    
    for (const p of localPhotos) {
      console.log(`Migrating Photo: ${p.caption || p.id}...`);
      let imageUrl = p.imageUrl;
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = await uploadLocalFile(imageUrl, "gallery");
      }
      
      await prisma.photo.upsert({
        where: { id: p.id },
        update: {
          albumId: p.albumId,
          imageUrl: imageUrl,
          caption: p.caption,
          createdAt: parseDate(p.createdAt),
        },
        create: {
          id: p.id,
          albumId: p.albumId,
          imageUrl: imageUrl,
          caption: p.caption,
          createdAt: parseDate(p.createdAt),
        }
      });
    }

    // -----------------------------------------------------------------
    // 6. Migrate StoryChapters
    // -----------------------------------------------------------------
    console.log("\n--- Migrating StoryChapters ---");
    const localChapters = localDb.prepare("SELECT * FROM StoryChapter").all();
    console.log(`Found ${localChapters.length} story chapters in local database.`);
    
    for (const c of localChapters) {
      console.log(`Migrating StoryChapter ${c.chapter}: ${c.title}...`);
      await prisma.storyChapter.upsert({
        where: { chapter: c.chapter },
        update: {
          title: c.title,
          content: c.content,
          createdAt: parseDate(c.createdAt),
          updatedAt: parseDate(c.updatedAt),
        },
        create: {
          id: c.id,
          chapter: c.chapter,
          title: c.title,
          content: c.content,
          createdAt: parseDate(c.createdAt),
          updatedAt: parseDate(c.updatedAt),
        }
      });
    }

    console.log("\n[SUCCESS] Migration completed successfully!");
  } catch (err) {
    console.error("\n[FATAL ERROR] Migration failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
