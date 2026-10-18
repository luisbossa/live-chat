const config = require("../config");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const File = require("../models/File");
const realtime = require("../services/realtime");

exports.landing = (req, res) => {
  if (req.user) return res.redirect("/chat");
  res.render("pages/landing", { layout: false });
};

exports.chat = (req, res) => {
  res.render("pages/chat", {
    title: "Chats",
    styles: ["dashboard"],
    bodyClass: "is-app",
    clientConfig: { iceServers: config.iceServers, userId: req.user.id },
  });
};

/** Enlace del QR de perfil: abre (o crea) el chat con ese usuario. */
exports.profileLink = async (req, res) => {
  const target = await User.findByUsername(req.params.username);
  if (!target || target.id === req.user.id) return res.redirect("/chat");

  const { id, created } = await Conversation.getOrCreateDirect(req.user.id, target.id);
  if (created) await realtime.conversation(id, [target.id]);
  res.redirect(`/chat?c=${id}`);
};

/** Archivos subidos (guardados en la base de datos). */
exports.upload = async (req, res, next) => {
  const file = await File.find(req.params.id);
  if (!file) return next();
  const inline = /^(image|audio|video)\//.test(file.mime);
  res.set({
    "Content-Type": file.mime,
    "Content-Length": file.size,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name || file.id)}`,
  });
  res.send(file.data);
};
