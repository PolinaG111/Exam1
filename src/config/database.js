const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");
const schemaPath = path.join(__dirname, "schema.sql");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(schemaPath, "utf8"));

module.exports = db;
