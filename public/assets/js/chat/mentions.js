// @menciones en grupos: sugerencias al escribir "@" y resaltado dentro de los mensajes.
import { $, escapeHTML } from "./utils.js";
import { state, activeConv, isGroup } from "./state.js";

const box = $("#mentionBox");
const input = $("#messageInput");
let options = [];
let cursor = 0;
let range = null; // { start, end } del texto "@algo" que se está escribiendo

const norm = (t = "") => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const mentionsMe = (msg) => Boolean(msg?.meta?.mentions?.includes(state.me.id));

/** Convierte "@usuario" de un participante en una etiqueta con su nombre (sobre HTML ya escapado). */
export function renderMentions(conv, html) {
  if (!html.includes("@") || !isGroup(conv)) return html;
  const members = new Map(conv.members.map((m) => [m.username?.toLowerCase(), m]));
  return html.replace(/(^|[\s(>])@([a-z0-9_.]{3,20})/gi, (match, pre, name) => {
    const clean = name.replace(/\.+$/, "");
    const member = members.get(clean.toLowerCase());
    if (!member) return match;
    const rest = name.slice(clean.length);
    const mine = member.id === state.me.id;
    return `${pre}<span class="mention ${mine ? "is-me" : ""}" title="@${escapeHTML(member.username)}">@${escapeHTML(member.name)}</span>${rest}`;
  });
}

function close() {
  box.hidden = true;
  options = [];
  range = null;
}

function render() {
  box.innerHTML = options
    .map(
      (m, i) => `
      <button type="button" role="option" class="mention-option ${i === cursor ? "is-active" : ""}" data-mention="${i}" aria-selected="${i === cursor}">
        <img src="${escapeHTML(m.avatar)}" alt="">
        <span><strong>${escapeHTML(m.name)}</strong><small>@${escapeHTML(m.username)}</small></span>
      </button>`
    )
    .join("");
}

/** Busca "@texto" justo antes del cursor y muestra los participantes que coinciden. */
function update() {
  const conv = activeConv();
  if (!isGroup(conv)) return close();
  const before = input.value.slice(0, input.selectionStart);
  const match = /(^|\s)@([\p{L}\p{N}_.]{0,20})$/u.exec(before);
  if (!match) return close();

  const q = norm(match[2]);
  options = conv.members
    .filter((m) => m.id !== state.me.id && m.username)
    .filter((m) => !q || norm(m.name).split(" ").some((w) => w.startsWith(q)) || norm(m.username).startsWith(q))
    .slice(0, 6);
  if (!options.length) return close();
  range = { start: before.length - match[2].length - 1, end: input.selectionStart };
  cursor = Math.min(cursor, options.length - 1);
  box.hidden = false;
  render();
}

function choose(i) {
  const m = options[i];
  if (!m || !range) return;
  const text = `@${m.username} `;
  input.setRangeText(text, range.start, range.end, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  close();
  input.focus();
}

export function initMentions() {
  input.addEventListener("input", () => {
    cursor = 0;
    update();
  });
  input.addEventListener("click", update);
  input.addEventListener("blur", () => setTimeout(close, 150));

  // Se registra en captura para ganar al Enter que envía el mensaje
  input.addEventListener(
    "keydown",
    (e) => {
      if (box.hidden) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        cursor = (cursor + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        render();
      } else if (e.key === "Enter" || e.key === "Tab") {
        choose(cursor);
      } else if (e.key === "Escape") {
        close();
      } else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    true
  );

  // mousedown: elige antes de que el campo pierda el foco
  box.addEventListener("mousedown", (e) => {
    const opt = e.target.closest("[data-mention]");
    if (!opt) return;
    e.preventDefault();
    choose(Number(opt.dataset.mention));
  });
}
