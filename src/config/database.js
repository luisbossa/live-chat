const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const config = require("./index");

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

const db = new Database(config.databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Crea las tablas si no existen
db.exec(fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8"));

module.exports = db;
