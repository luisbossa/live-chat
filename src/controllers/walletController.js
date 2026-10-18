const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const MAX_CENTS = 100000; // $1.000 por envío

exports.show = (req, res) => {
  res.json({ balanceCents: req.user.balance_cents, history: Transaction.history(req.user.id) });
};

/** Envía dinero a un contacto y lo deja registrado como mensaje en el chat. */
exports.send = (req, res, next) => {
  try {
    const me = req.user;
    const toId = validate.toId(req.body.toUserId);
    const amountCents = Math.round(Number(String(req.body.amount).replace(",", ".")) * 100);
    const note = validate.str(req.body.note, 80) || null;

    if (!toId || toId === me.id || !User.findById(toId)) throw httpError(404, "Elige a quién enviar el dinero.");
    if (!Number.isFinite(amountCents) || amountCents < 1) throw httpError(422, "Ingresa un monto válido.");
    if (amountCents > MAX_CENTS) throw httpError(422, "El máximo por envío es $1.000.");
    if (User.isBlocked(me.id, toId)) throw httpError(403, "No puedes enviar dinero a este contacto.");

    let transactionId;
    try {
      transactionId = Transaction.send(me.id, toId, amountCents, note);
    } catch (err) {
      if (err instanceof Transaction.InsufficientFundsError) throw httpError(422, "No tienes saldo suficiente.");
      throw err;
    }

    const { id: conversationId, created } = Conversation.getOrCreateDirect(me.id, toId);
    const message = Message.create({
      conversationId,
      senderId: me.id,
      type: "payment",
      body: note,
      meta: { amountCents, transactionId, toUserId: toId },
    });

    if (created) realtime.conversation(conversationId);
    else realtime.message(message);

    [me.id, toId].forEach((id) => realtime.toUsers([id], "wallet:update", { balanceCents: User.findById(id).balance_cents }));
    res.status(201).json({ balanceCents: User.findById(me.id).balance_cents, message, conversationId });
  } catch (err) {
    next(err);
  }
};
