const express = require("express");
const auth = require("../controllers/authController");
const pages = require("../controllers/pageController");
const upload = require("../middleware/upload");
const { requireAuth, guestOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", pages.landing);

router.get("/register", guestOnly, auth.showRegister);
router.post("/register", guestOnly, upload.image.single("avatar"), auth.register);
router.get("/login", guestOnly, auth.showLogin);
router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/chat", requireAuth, pages.chat);
router.get("/u/:username", requireAuth, pages.profileLink);

// URLs de la versión estática anterior
router.get("/index.html", (req, res) => res.redirect(301, "/"));
router.get("/pages/register.html", (req, res) => res.redirect(301, "/register"));
router.get("/pages/dashboard.html", (req, res) => res.redirect(301, "/chat"));

module.exports = router;
