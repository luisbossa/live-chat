const express = require("express");
const auth = require("../controllers/authController");
const users = require("../controllers/userController");
const conversations = require("../controllers/conversationController");
const messages = require("../controllers/messageController");
const stories = require("../controllers/storyController");
const wallet = require("../controllers/walletController");
const upload = require("../middleware/upload");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

// Pública: disponibilidad del nombre de usuario durante el registro
router.get("/username-available", auth.checkUsername);

router.use(requireApiAuth);

// Usuario actual
router.get("/bootstrap", users.bootstrap);
router.patch("/me", upload.image.single("avatar"), users.updateProfile);
router.patch("/me/settings", users.updateSettings);
router.get("/me/qr", users.qr);

// Usuarios
router.get("/users", users.search);
router.post("/users/:id/block", users.toggleBlock);

// Conversaciones
router.post("/conversations", upload.image.single("avatar"), conversations.create);
router.use("/conversations/:id", conversations.loadMembership);
router.get("/conversations/:id/messages", conversations.messages);
router.post("/conversations/:id/messages", upload.file.single("file"), conversations.send);
router.get("/conversations/:id/media", conversations.media);
router.patch("/conversations/:id", upload.image.single("avatar"), conversations.updateGroup);
router.patch("/conversations/:id/settings", conversations.updateSettings);
router.post("/conversations/:id/clear", conversations.clear);
router.post("/conversations/:id/members", conversations.addMembers);
router.delete("/conversations/:id/members/me", conversations.leave);

// Mensajes
router.use("/messages/:id", messages.load);
router.patch("/messages/:id", messages.edit);
router.delete("/messages/:id", messages.remove);
router.post("/messages/:id/reactions", messages.react);

// Estados
router.get("/stories", stories.feed);
router.post("/stories", upload.image.single("media"), stories.create);
router.post("/stories/:id/view", stories.view);
router.get("/stories/:id/viewers", stories.viewers);
router.delete("/stories/:id", stories.remove);

// Billetera
router.get("/wallet", wallet.show);
router.post("/wallet/send", wallet.send);

module.exports = router;
