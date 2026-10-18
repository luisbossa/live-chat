const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

// Máximo por envío en cada moneda (en centavos/céntimos)
const LIMITS = {
  USD: { max: 100000, label: "$1.000" },
  CRC: { max: 50000000, label: "₡500.000" },
};

exports.show = async (req, res) => {
  res.json({ balances: User.balancesOf(req.user), history: await Transaction.history(req.user.id) });
};

/** Envía dinero (dólares o colones) a un contacto y lo deja registrado como mensaje en el chat. */
exports.send = async (req, res) => {
  const me = req.user;
  const currency = String(req.body.currency || "USD").toUpperCase();
  const toId = validate.toId(req.body.toUserId);
  const amountCents = Math.round(Number(String(req.body.amount).replace(",", ".")) * 100);
  const note = validate.str(req.body.note, 80) || null;

  if (!LIMITS[currency]) throw httpError(422, "Moneda no válida.");
  if (!toId || toId === me.id || !(await User.findById(toId))) throw httpError(404, "Elige a quién enviar el dinero.");
  if (!Number.isFinite(amountCents) || amountCents < 1) throw httpError(422, "Ingresa un monto válido.");
  if (amountCents > LIMITS[currency].max) throw httpError(422, `El máximo por envío es ${LIMITS[currency].label}.`);
  if (await User.isBlocked(me.id, toId)) throw httpError(403, "No puedes enviar dinero a este contacto.");

  let transactionId;
  try {
    transactionId = await Transaction.send(me.id, toId, amountCents, note, { currency });
  } catch (err) {
    if (err instanceof Transaction.InsufficientFundsError) {
      throw httpError(422, currency === "CRC" ? "No tienes suficientes colones." : "No tienes suficientes dólares.");
    }
    throw err;
  }

  const { id: conversationId, created } = await Conversation.getOrCreateDirect(me.id, toId);
  const message = await Message.create({
    conversationId,
    senderId: me.id,
    type: "payment",
    body: note,
    meta: { amountCents, currency, transactionId, toUserId: toId },
  });

  if (created) await realtime.conversation(conversationId);
  else await realtime.message(message);

  const users = await User.findMany([me.id, toId]);
  [me.id, toId].forEach((id) => realtime.toUsers([id], "wallet:update", { balances: User.balancesOf(users.get(id)) }));
  res.status(201).json({ balances: User.balancesOf(users.get(me.id)), message, conversationId });
};
