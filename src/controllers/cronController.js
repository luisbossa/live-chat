const crypto = require("crypto");
const config = require("../config");
const cron = require("../services/cron");

const sameSecret = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** GET /api/cron/tick con "Authorization: Bearer <CRON_SECRET>" (cron-job.org o Vercel Cron). */
exports.tick = async (req, res) => {
  const token = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!config.cronSecret || !sameSecret(token, config.cronSecret)) return res.status(401).json({ error: "No autorizado" });
  const failed = await cron.tick();
  res.status(failed.length ? 500 : 200).json({ ok: !failed.length, failed });
};
