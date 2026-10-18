const express = require("express");
const auth = require("../controllers/authController");
const users = require("../controllers/userController");
const conversations = require("../controllers/conversationController");
const messages = require("../controllers/messageController");
const stories = require("../controllers/storyController");
const wallet = require("../controllers/walletController");
const upload = require("../middleware/upload");
const h = require("../utils/asyncHandler");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

// Pública: disponibilidad del nombre de usuario durante el registro
router.get("/username-available", h(auth.checkUsername));

router.use(requireApiAuth);

// Usuario actual
router.get("/bootstrap", h(users.bootstrap));
router.patch("/me", upload.image.single("avatar"), h(users.updateProfile));
router.patch("/me/settings", h(users.updateSettings));
router.get("/me/qr", h(users.qr));

// Usuarios
router.get("/users", h(users.search));
router.post("/users/:id/block", h(users.toggleBlock));

// Conversaciones
router.post("/conversations", upload.image.single("avatar"), h(conversations.create));
router.use("/conversations/:id", h(conversations.loadMembership));
router.get("/conversations/:id", h(conversations.show));
router.delete("/conversations/:id", h(conversations.remove));
router.get("/conversations/:id/messages", h(conversations.messages));
router.post("/conversations/:id/messages", upload.file.single("file"), h(conversations.send));
router.get("/conversations/:id/media", h(conversations.media));
router.patch("/conversations/:id", upload.image.single("avatar"), h(conversations.updateGroup));
router.patch("/conversations/:id/settings", h(conversations.updateSettings));
router.post("/conversations/:id/clear", h(conversations.clear));
router.post("/conversations/:id/members", h(conversations.addMembers));
router.delete("/conversations/:id/members/me", h(conversations.leave));

// Mensajes
router.get("/stars", h(messages.starred));
router.get("/link-preview", h(messages.linkPreview));
router.use("/messages/:id", h(messages.load));
router.patch("/messages/:id", h(messages.edit));
router.delete("/messages/:id", h(messages.remove));
router.post("/messages/:id/reactions", h(messages.react));
router.post("/messages/:id/star", h(messages.star));
router.post("/messages/:id/forward", h(messages.forward));

// Estados
router.get("/stories", h(stories.feed));
router.post("/stories", upload.image.single("media"), h(stories.create));
router.post("/stories/:id/view", h(stories.view));
router.get("/stories/:id/viewers", h(stories.viewers));
router.delete("/stories/:id", h(stories.remove));

// Billetera
router.get("/wallet", h(wallet.show));
router.post("/wallet/send", h(wallet.send));

module.exports = router;
