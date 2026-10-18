const config = require("../config");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
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
exports.profileLink = (req, res) => {
  const target = User.findByUsername(req.params.username);
  if (!target || target.id === req.user.id) return res.redirect("/chat");

  const { id, created } = Conversation.getOrCreateDirect(req.user.id, target.id);
  if (created) realtime.conversation(id, [target.id]);
  res.redirect(`/chat?c=${id}`);
};
