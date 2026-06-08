const { DatabaseSync } = require("node:sqlite");

try {
  const db = new DatabaseSync("./prisma/dev.db");
  const query = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = query.all();
  console.log("SQLite tables:", tables);
} catch (err) {
  console.error("Error reading SQLite database:", err);
}
