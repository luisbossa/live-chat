const db = require("../config/database");
const User = require("./User");

const SQL = {
  debit: "UPDATE users SET balance_cents = balance_cents - @amount WHERE id = @id AND balance_cents >= @amount",
  credit: "UPDATE users SET balance_cents = balance_cents + @amount WHERE id = @id",
  insert: "INSERT INTO transactions (from_user_id, to_user_id, amount_cents, note, created_at) VALUES (?, ?, ?, ?, ?)",
  history: `
    SELECT * FROM transactions WHERE from_user_id = ? OR to_user_id = ?
    ORDER BY created_at DESC LIMIT 30`,
};

class InsufficientFundsError extends Error {}

const Transaction = {
  InsufficientFundsError,

  /** Transferencia atómica: o se mueven los dos saldos o ninguno. */
  send(fromId, toId, amountCents, note = null, createdAt = Date.now()) {
    return db.transaction(async (tx) => {
      if (!(await tx.run(SQL.debit, { id: fromId, amount: amountCents })).changes) {
        throw new InsufficientFundsError("Saldo insuficiente");
      }
      await tx.run(SQL.credit, { id: toId, amount: amountCents });
      return (await tx.run(SQL.insert, [fromId, toId, amountCents, note, createdAt])).lastInsertRowid;
    });
  },

  async history(userId) {
    const rows = await db.all(SQL.history, [userId, userId]);
    const people = await User.findMany(rows.flatMap((r) => [r.from_user_id, r.to_user_id]));
    return rows.map((row) => {
      const outgoing = row.from_user_id === userId;
      return {
        id: row.id,
        direction: outgoing ? "out" : "in",
        amountCents: row.amount_cents,
        note: row.note,
        counterpart: User.toPublic(people.get(outgoing ? row.to_user_id : row.from_user_id)),
        createdAt: row.created_at,
      };
    });
  },
};

module.exports = Transaction;
