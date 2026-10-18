// Vista previa de enlaces (título, descripción e imagen de la página), como en WhatsApp.
// El servidor descarga la página para que el navegador no tenga que hacerlo, con
// protecciones: solo http(s), sin direcciones internas, tiempo y tamaño limitados.
const dns = require("dns").promises;
const net = require("net");
const config = require("../config");

const TIMEOUT = 4000;
const MAX_BYTES = 256 * 1024;
const MAX_REDIRECTS = 3;
const CACHE_SIZE = 300;
const CACHE_TTL = 60 * 60 * 1000; // 1 h
const FAIL_TTL = 10 * 60 * 1000; // los fallos se reintentan a los 10 min

const cache = new Map(); // url -> { value, expires }

/** IPs privadas, locales o reservadas (evita que se use el servidor para entrar en la red interna). */
function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

async function assertPublic(url) {
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocolo no permitido");
  if (url.username || url.password) throw new Error("credenciales en la URL");
  if (config.linkPreviewAllowPrivate) return;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((a) => a.address);
  if (!addresses.length || addresses.some(isPrivateIp)) throw new Error("dirección no permitida");
}

/** Descarga siguiendo redirecciones a mano para revisar cada destino. */
async function download(startUrl) {
  let url = new URL(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "User-Agent": "YablaBot/1.0 (vista previa de enlaces)", Accept: "text/html,application/xhtml+xml,image/*;q=0.8" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location"), url);
      res.body?.cancel();
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const type = res.headers.get("content-type") || "";
    if (type.startsWith("image/")) {
      res.body?.cancel();
      return { url, image: true };
    }
    if (!type.includes("html")) throw new Error("no es una página");

    // Solo los primeros KB (las etiquetas <meta> están en <head>)
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    reader.cancel().catch(() => {});
    return { url, html: Buffer.concat(chunks).toString("utf8") };
  }
  throw new Error("demasiadas redirecciones");
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " " };
const decode = (text = "") =>
  text
    .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
      if (e[0] === "#") {
        const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();

/** Lee <meta property|name="..." content="..."> sin depender del orden de los atributos. */
function metaTags(html) {
  const head = html.slice(0, MAX_BYTES).split(/<\/head>/i)[0];
  const tags = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /content\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag)?.[2];
    if (key && content && !(key in tags)) tags[key] = decode(content);
  }
  tags.title = decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1] || "");
  return tags;
}

function absolute(src, base) {
  try {
    const url = new URL(src, base);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

async function build(rawUrl) {
  const { url, html, image } = await download(rawUrl);
  const site = url.hostname.replace(/^www\./, "");
  if (image) return { url: url.href, site, image: url.href, title: null, description: null, imageOnly: true };

  const t = metaTags(html);
  const title = (t["og:title"] || t["twitter:title"] || t.title || "").slice(0, 160);
  const description = (t["og:description"] || t["twitter:description"] || t.description || "").slice(0, 300);
  const img = t["og:image"] || t["og:image:url"] || t["twitter:image"] || t["twitter:image:src"];
  if (!title && !description) return null;
  return {
    url: url.href,
    site: (t["og:site_name"] || site).slice(0, 60),
    title: title || null,
    description: description || null,
    image: img ? absolute(img, url) : null,
  };
}

async function linkPreview(rawUrl) {
  const key = String(rawUrl);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  let value = null;
  try {
    value = await build(key);
  } catch {
    value = null;
  }
  cache.delete(key);
  cache.set(key, { value, expires: Date.now() + (value ? CACHE_TTL : FAIL_TTL) });
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value);
  return value;
}

module.exports = { linkPreview, isPrivateIp };
