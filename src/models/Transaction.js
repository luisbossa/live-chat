const db = require("../config/database");
const User = require("./User");

// Columna de saldo de cada moneda (lista cerrada: nunca se interpola texto del usuario)
const BALANCE_COLUMN = { USD: "balance_cents", CRC: "balance_crc_cents" };
const CURRENCIES = Object.keys(BALANCE_COLUMN);

const SQL = {
  debit: (col) => `UPDATE users SET ${col} = ${col} - @amount WHERE id = @id AND ${col} >= @amount`,
  credit: (col) => `UPDATE users SET ${col} = ${col} + @amount WHERE id = @id`,
  insert: "INSERT INTO transactions (from_user_id, to_user_id, amount_cents, currency, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  history: `
    SELECT * FROM transactions WHERE from_user_id = ? OR to_user_id = ?
    ORDER BY created_at DESC LIMIT 30`,
};

class InsufficientFundsError extends Error {}

const Transaction = {
  CURRENCIES,
  InsufficientFundsError,

  /** Transferencia atómica en una moneda: o se mueven los dos saldos o ninguno. */
  send(fromId, toId, amountCents, note = null, { currency = "USD", createdAt = Date.now() } = {}) {
    const col = BALANCE_COLUMN[currency];
    if (!col) throw new Error(`Moneda no soportada: ${currency}`);
    return db.transaction(async (tx) => {
      if (!(await tx.run(SQL.debit(col), { id: fromId, amount: amountCents })).changes) {
        throw new InsufficientFundsError("Saldo insuficiente");
      }
      await tx.run(SQL.credit(col), { id: toId, amount: amountCents });
      return (await tx.run(SQL.insert, [fromId, toId, amountCents, currency, note, createdAt])).lastInsertRowid;
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
        currency: row.currency || "USD",
        note: row.note,
        counterpart: User.toPublic(people.get(outgoing ? row.to_user_id : row.from_user_id)),
        createdAt: row.created_at,
      };
    });
  },
};

module.exports = Transaction;
