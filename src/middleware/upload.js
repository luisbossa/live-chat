const multer = require("multer");
const config = require("../config");
const File = require("../models/File");

// En memoria: el archivo se guarda después en la base de datos (no hay disco en el hosting gratuito)
const storage = multer.memoryStorage();
const limits = { fileSize: config.uploadLimit };

function onlyImages(req, file, cb) {
  if (file.mimetype.startsWith("image/") && file.mimetype !== "image/svg+xml") return cb(null, true);
  cb(Object.assign(new Error("Solo se permiten imágenes."), { status: 400 }));
}

const BLOCKED = /\.(exe|bat|cmd|com|msi|sh|ps1|js|html?|svg)$/i;
function safeFiles(req, file, cb) {
  if (BLOCKED.test(file.originalname)) return cb(Object.assign(new Error("Ese tipo de archivo no está permitido."), { status: 400 }));
  cb(null, true);
}

module.exports = {
  image: multer({ storage, limits, fileFilter: onlyImages }),
  file: multer({ storage, limits, fileFilter: safeFiles }),

  /** Guarda el archivo subido y devuelve su URL pública (o null si no hay archivo). */
  async save(file) {
    return file ? `/uploads/${await File.save(file)}` : null;
  },
};
