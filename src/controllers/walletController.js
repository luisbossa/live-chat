const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const MAX_CENTS = 100000; // $1.000 por envío

exports.show = async (req, res) => {
  res.json({ balanceCents: req.user.balance_cents, history: await Transaction.history(req.user.id) });
};

/** Envía dinero a un contacto y lo deja registrado como mensaje en el chat. */
exports.send = async (req, res) => {
  const me = req.user;
  const toId = validate.toId(req.body.toUserId);
  const amountCents = Math.round(Number(String(req.body.amount).replace(",", ".")) * 100);
  const note = validate.str(req.body.note, 80) || null;

  if (!toId || toId === me.id || !(await User.findById(toId))) throw httpError(404, "Elige a quién enviar el dinero.");
  if (!Number.isFinite(amountCents) || amountCents < 1) throw httpError(422, "Ingresa un monto válido.");
  if (amountCents > MAX_CENTS) throw httpError(422, "El máximo por envío es $1.000.");
  if (await User.isBlocked(me.id, toId)) throw httpError(403, "No puedes enviar dinero a este contacto.");

  let transactionId;
  try {
    transactionId = await Transaction.send(me.id, toId, amountCents, note);
  } catch (err) {
    if (err instanceof Transaction.InsufficientFundsError) throw httpError(422, "No tienes saldo suficiente.");
    throw err;
  }

  const { id: conversationId, created } = await Conversation.getOrCreateDirect(me.id, toId);
  const message = await Message.create({
    conversationId,
    senderId: me.id,
    type: "payment",
    body: note,
    meta: { amountCents, transactionId, toUserId: toId },
  });

  if (created) await realtime.conversation(conversationId);
  else await realtime.message(message);

  const balances = await User.findMany([me.id, toId]);
  [me.id, toId].forEach((id) => realtime.toUsers([id], "wallet:update", { balanceCents: balances.get(id).balance_cents }));
  res.status(201).json({ balanceCents: balances.get(me.id).balance_cents, message, conversationId });
};
