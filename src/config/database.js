const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");
const config = require("./index");

const isLocal = config.databaseUrl.startsWith("file:");

// En local, la carpeta del archivo SQLite debe existir
if (isLocal) fs.mkdirSync(path.dirname(config.databaseUrl.slice("file:".length)), { recursive: true });

const client = createClient({ url: config.databaseUrl, authToken: config.databaseAuthToken });

/** Las filas de libSQL son objetos especiales: se convierten a objetos planos. */
function rowsOf(result) {
  return result.rows.map((row) => Object.fromEntries(result.columns.map((col, i) => [col, row[i]])));
}

function normalize(args) {
  if (args === undefined) return [];
  if (Array.isArray(args) || (typeof args === "object" && args !== null)) return args;
  return [args];
}

/** Capa fina sobre un cliente o una transacción: all / get / run. */
function wrap(executor) {
  const exec = (sql, args) => executor.execute({ sql, args: normalize(args) });
  return {
    async all(sql, args) {
      return rowsOf(await exec(sql, args));
    },
    async get(sql, args) {
      return rowsOf(await exec(sql, args))[0];
    },
    async run(sql, args) {
      const result = await exec(sql, args);
      return { changes: result.rowsAffected, lastInsertRowid: Number(result.lastInsertRowid ?? 0) };
    },
  };
}

const db = {
  ...wrap(client),
  isLocal,

  /** Ejecuta `fn(tx)` en una transacción de escritura: commit si termina, rollback si falla. */
  async transaction(fn) {
    const tx = await client.transaction("write");
    try {
      const result = await fn(wrap(tx));
      await tx.commit();
      return result;
    } catch (err) {
      await tx.rollback().catch(() => {});
      throw err;
    } finally {
      tx.close();
    }
  },

  /**
   * Varias sentencias atómicas en UNA sola petición (mejor que una transacción
   * interactiva cuando la base de datos está en la red, como Turso).
   */
  async batch(statements) {
    const results = await client.batch(statements.map(([sql, args]) => ({ sql, args: normalize(args) })), "write");
    return results.map((r) => ({ changes: r.rowsAffected, lastInsertRowid: Number(r.lastInsertRowid ?? 0) }));
  },

  /** Crea las tablas si no existen. Se llama una vez al arrancar. */
  async init() {
    if (isLocal) await client.execute("PRAGMA journal_mode = WAL");
    await client.execute("PRAGMA foreign_keys = ON");
    await client.executeMultiple(fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8"));
  },

  close() {
    client.close();
  },
};

module.exports = db;
