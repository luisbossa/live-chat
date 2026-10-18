const db = require("../config/database");
const User = require("./User");

const stmt = {
  debit: db.prepare("UPDATE users SET balance_cents = balance_cents - @amount WHERE id = @id AND balance_cents >= @amount"),
  credit: db.prepare("UPDATE users SET balance_cents = balance_cents + @amount WHERE id = @id"),
  insert: db.prepare("INSERT INTO transactions (from_user_id, to_user_id, amount_cents, note, created_at) VALUES (?, ?, ?, ?, ?)"),
  history: db.prepare(`
    SELECT * FROM transactions WHERE from_user_id = ? OR to_user_id = ?
    ORDER BY created_at DESC LIMIT 30
  `),
};

class InsufficientFundsError extends Error {}

const Transaction = {
  InsufficientFundsError,

  /** Transferencia atómica: o se mueven los dos saldos o ninguno. */
  send: db.transaction((fromId, toId, amountCents, note = null) => {
    if (!stmt.debit.run({ id: fromId, amount: amountCents }).changes) {
      throw new InsufficientFundsError("Saldo insuficiente");
    }
    stmt.credit.run({ id: toId, amount: amountCents });
    const { lastInsertRowid } = stmt.insert.run(fromId, toId, amountCents, note, Date.now());
    return lastInsertRowid;
  }),

  history(userId) {
    const users = new Map();
    const person = (id) => {
      if (!users.has(id)) users.set(id, User.toPublic(User.findById(id)));
      return users.get(id);
    };
    return stmt.history.all(userId, userId).map((row) => {
      const outgoing = row.from_user_id === userId;
      return {
        id: row.id,
        direction: outgoing ? "out" : "in",
        amountCents: row.amount_cents,
        note: row.note,
        counterpart: person(outgoing ? row.to_user_id : row.from_user_id),
        createdAt: row.created_at,
      };
    });
  },
};

module.exports = Transaction;
