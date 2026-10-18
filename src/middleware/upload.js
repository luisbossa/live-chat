const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const config = require("../config");

fs.mkdirSync(config.uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: config.uploadsDir,
  // Nombre aleatorio: no se puede adivinar ni pisar otro archivo
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 10);
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

function onlyImages(req, file, cb) {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(Object.assign(new Error("Solo se permiten imágenes."), { status: 400 }));
}

const BLOCKED = /\.(exe|bat|cmd|com|msi|sh|ps1|js|html?|svg)$/i;
function safeFiles(req, file, cb) {
  if (BLOCKED.test(file.originalname)) return cb(Object.assign(new Error("Ese tipo de archivo no está permitido."), { status: 400 }));
  cb(null, true);
}

const limits = { fileSize: config.uploadLimit };

module.exports = {
  image: multer({ storage, limits, fileFilter: onlyImages }),
  file: multer({ storage, limits, fileFilter: safeFiles }),
  /** URL pública de un archivo subido. */
  urlFor: (file) => (file ? `/uploads/${file.filename}` : null),
};
