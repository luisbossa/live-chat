const crypto = require("crypto");
const path = require("path");
const db = require("../config/database");

const SQL = {
  insert: "INSERT INTO files (id, mime, name, size, data, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  byId: "SELECT * FROM files WHERE id = ?",
};

const File = {
  /** Guarda el archivo (Buffer) y devuelve su id público, p. ej. "1729…-a1b2c3.jpg". */
  async save({ buffer, mimetype, originalname, size }) {
    const ext = path.extname(originalname || "").toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 10);
    const id = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    await db.run(SQL.insert, [id, mimetype, (originalname || "").slice(0, 120), size, buffer, Date.now()]);
    return id;
  },

  async find(id) {
    const row = await db.get(SQL.byId, [id]);
    if (!row) return null;
    return { ...row, data: Buffer.from(row.data) };
  },
};

module.exports = File;
