import fs from "fs";
import path from "path";

// Generic fallback data containing no sensitive family data
export const defaultBookChapters = [
  {
    chapter: 1,
    title: "Chapter 1: Our Family Beginnings",
    content: "The story of our family heritage begins here. Detailed records, photos, chapters, and biographical milestones are securely stored in the cloud database. You can manage, update, and add new chapters dynamically via the Admin Dashboard."
  }
];

let chapters = defaultBookChapters;

try {
  const jsonPath = path.join(process.cwd(), "data", "bookChapters.json");
  if (fs.existsSync(jsonPath)) {
    chapters = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  }
} catch (err) {
  console.warn("Failed to dynamically load bookChapters.json:", err);
}

export const bookChaptersData = chapters;
