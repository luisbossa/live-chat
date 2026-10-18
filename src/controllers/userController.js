const QRCode = require("qrcode");
const config = require("../config");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Story = require("../models/Story");
const upload = require("../middleware/upload");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

/** Todo lo que necesita el cliente al abrir la app. */
exports.bootstrap = async (req, res) => {
  const [conversations, stories, blockedIds] = await Promise.all([
    Conversation.listForUser(req.user),
    Story.feedFor(req.user.id),
    User.blockedIds(req.user.id),
  ]);
  res.json({ me: User.toSelf(req.user), conversations, stories, blockedIds });
};

exports.search = async (req, res) => {
  const q = validate.str(req.query.q, 60);
  const [found, blockedIds] = await Promise.all([User.search(req.user.id, q, 30), User.blockedIds(req.user.id)]);
  const blocked = new Set(blockedIds);
  res.json({ users: found.filter((u) => !blocked.has(u.id)).map(User.toPublic) });
};

exports.updateProfile = async (req, res) => {
  const name = req.body.name !== undefined ? validate.str(req.body.name, 60) : undefined;
  const username = req.body.username !== undefined ? validate.str(req.body.username, 20).replace(/^@/, "").toLowerCase() : undefined;

  if (name !== undefined && name.length < 2) throw httpError(422, "El nombre es demasiado corto.");
  if (username !== undefined) {
    if (!validate.USERNAME.test(username)) throw httpError(422, "Nombre de usuario no válido.");
    const owner = await User.findByUsername(username);
    if (owner && owner.id !== req.user.id) throw httpError(409, "Ese nombre de usuario ya está en uso.");
  }

  const user = await User.update(req.user.id, {
    name,
    username,
    bio: req.body.bio !== undefined ? validate.str(req.body.bio, 140) : undefined,
    phone: req.body.phone !== undefined ? validate.str(req.body.phone, 30) : undefined,
    avatar: (await upload.save(req.file)) || undefined,
  });

  // Los contactos ven el cambio al instante
  realtime.toUsers([...(await User.contactIds(user.id)), user.id], "user:update", User.toPublic(user));
  res.json({ me: User.toSelf(user) });
};

exports.updateSettings = async (req, res) => {
  const settings = {};
  if ("readReceipts" in req.body) settings.readReceipts = validate.toBool(req.body.readReceipts);
  if ("showLastSeen" in req.body) settings.showLastSeen = validate.toBool(req.body.showLastSeen);
  const user = await User.updateSettings(req.user.id, settings);
  if ("showLastSeen" in settings) await realtime.presence(user);
  res.json({ me: User.toSelf(user) });
};

exports.toggleBlock = async (req, res) => {
  const targetId = validate.toId(req.params.id);
  if (!targetId || targetId === req.user.id || !(await User.findById(targetId))) throw httpError(404, "Usuario no encontrado.");
  const blocked = await User.toggleBlock(req.user.id, targetId);
  res.json({ blocked, blockedIds: await User.blockedIds(req.user.id) });
};

exports.qr = async (req, res) => {
  const url = `${config.baseUrl}/u/${encodeURIComponent(req.user.username)}`;
  const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#262424", light: "#ffffff" } });
  res.json({ url, dataUrl });
};
