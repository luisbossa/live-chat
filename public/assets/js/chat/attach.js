// Vista previa de adjuntos antes de enviar (varios archivos, quitar/añadir y comentario por archivo).
import { $, icon, escapeHTML, fileSize, toast } from "./utils.js";
import { openModal, closeModal } from "./ui.js";
import { sendAttachment } from "./conversation.js";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 16 * 1024 * 1024;

let items = []; // { id, file, kind, url, caption, tooBig }
let current = 0;
let nextId = 1;

const isImageFile = (item) => item.file.type.startsWith("image/");
const isVideo = (item) => item.kind === "video";
const limitOf = (item) => (isVideo(item) ? VIDEO_MAX_SIZE : MAX_SIZE);
// Se envía como foto (si se eligió como documento, va como archivo con su calidad original)
const isImage = (item) => item.kind === "image";
const isPdf = (item) => item.file.type === "application/pdf";
const extension = (name) => (name.includes(".") ? name.split(".").pop().slice(0, 4).toUpperCase() : "ARCHIVO");

/**
 * Abre la vista previa con estos archivos (o los añade si ya está abierta).
 * kind: "auto" detecta cada archivo por su tipo; "file" los envía todos como documento.
 */
export function openAttachPreview(fileList, kind = "auto") {
  const incoming = [...fileList];
  if (!incoming.length) return;

  const room = MAX_FILES - items.length;
  if (incoming.length > room) toast(`Puedes enviar hasta ${MAX_FILES} archivos a la vez.`, { tone: "error" });

  incoming.slice(0, Math.max(room, 0)).forEach((file) => {
    const itemKind = kind === "file" ? "file" : file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
    const item = { id: nextId++, file, kind: itemKind, caption: "" };
    item.tooBig = file.size > limitOf(item);
    if (isImageFile(item) || isVideo(item) || isPdf(item)) item.url = URL.createObjectURL(file);
    items.push(item);
  });

  const wasOpen = $("#modal-attach").classList.contains("is-open");
  current = wasOpen ? items.length - 1 : 0;
  render();
  if (!wasOpen) openModal("modal-attach");
  focusCaption();
}

function focusCaption() {
  requestAnimationFrame(() => $("#attachCaption").focus());
}

function saveCaption() {
  if (items[current]) items[current].caption = $("#attachCaption").value;
}

function select(index) {
  saveCaption();
  current = index;
  render();
  focusCaption();
}

function remove(index) {
  saveCaption();
  const [item] = items.splice(index, 1);
  if (item?.url) URL.revokeObjectURL(item.url);
  if (!items.length) return closeModal("modal-attach");
  current = Math.min(current >= index ? current - 1 : current, items.length - 1);
  current = Math.max(current, 0);
  render();
}

function stageHTML(item) {
  const warning = item.tooBig ? `<p class="attach-warning">${icon("info", "icon-sm")} Supera el límite de ${limitOf(item) / 1024 / 1024} MB y no se enviará.</p>` : "";
  if (isVideo(item)) {
    return `<video src="${item.url}" controls playsinline preload="metadata"></video>${warning || `<p class="attach-note">${icon("video", "icon-sm")} Video de hasta 1 minuto · ${fileSize(item.file.size)}</p>`}`;
  }
  if (isImageFile(item)) {
    const asDocument = !isImage(item) ? `<p class="attach-note">${icon("file", "icon-sm")} Se enviará como documento (calidad original)</p>` : "";
    return `<img src="${item.url}" alt="${escapeHTML(item.file.name)}">${warning || asDocument}`;
  }
  if (isPdf(item) && !item.tooBig) {
    return `<iframe src="${item.url}#toolbar=0&navpanes=0" title="${escapeHTML(item.file.name)}"></iframe>`;
  }
  return `
    <div class="attach-file">
      <span class="attach-file-icon">${icon("file")}<b>${escapeHTML(extension(item.file.name))}</b></span>
      <strong>${escapeHTML(item.file.name)}</strong>
      <small>${fileSize(item.file.size)}</small>
      ${warning}
    </div>`;
}

function thumbHTML(item, index) {
  return `
    <div class="attach-thumb ${index === current ? "is-active" : ""} ${item.tooBig ? "is-invalid" : ""}" data-attach-select="${index}" role="button" tabindex="0" aria-label="${escapeHTML(item.file.name)}">
      ${isVideo(item) ? `<video src="${item.url}#t=0.1" muted playsinline preload="metadata"></video><i class="attach-thumb-play">${icon("play", "icon-sm")}</i>` : isImageFile(item) ? `<img src="${item.url}" alt="">` : `<span>${icon("file", "icon-sm")}<b>${escapeHTML(extension(item.file.name))}</b></span>`}
      <button type="button" class="attach-remove" data-attach-remove="${index}" aria-label="Quitar">${icon("x", "icon-sm")}</button>
    </div>`;
}

function render() {
  const item = items[current];
  if (!item) return;
  const valid = items.filter((i) => !i.tooBig).length;
  const images = items.every(isImage);
  const videos = items.every(isVideo);
  const noun = images ? ["foto", "fotos"] : videos ? ["video", "videos"] : items.every((i) => isImage(i) || isVideo(i)) ? ["archivo", "fotos y videos"] : ["archivo", "archivos"];
  $("#attachTitle").textContent = items.length === 1 ? `Enviar ${noun[0]}` : `Enviar ${items.length} ${noun[1]}`;
  $("#attachStage").innerHTML = stageHTML(item);
  $("#attachStrip").innerHTML =
    items.map(thumbHTML).join("") +
    (items.length < MAX_FILES ? `<button type="button" class="attach-add" data-attach-add aria-label="Añadir más">${icon("plus")}</button>` : "");
  $("#attachCaption").value = item.caption;
  $("#attachCaption").placeholder = items.length > 1 ? "Añade un comentario a este archivo…" : "Añade un comentario…";
  $("#attachCount").textContent = valid > 1 ? valid : "";
  $("#attachForm .send-btn").disabled = !valid;
}

async function sendAll() {
  saveCaption();
  const toSend = items.filter((i) => !i.tooBig);
  const skipped = items.length - toSend.length;
  const batch = items;
  items = [];
  closeModal("modal-attach");

  // En orden, para que lleguen como se eligieron
  for (const item of toSend) {
    await sendAttachment(item.file, item.caption.trim(), item.kind);
  }
  batch.forEach((i) => i.url && URL.revokeObjectURL(i.url));
  if (skipped) toast(`${skipped} archivo${skipped === 1 ? " no se envió" : "s no se enviaron"} por superar el límite (5 MB; videos 16 MB).`, { tone: "error", icon: "file" });
}

export function initAttach() {
  $("#attachForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendAll();
  });

  $("#attachStrip").addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-attach-remove]");
    if (removeBtn) return remove(Number(removeBtn.dataset.attachRemove));
    const thumb = e.target.closest("[data-attach-select]");
    if (thumb) return select(Number(thumb.dataset.attachSelect));
    if (e.target.closest("[data-attach-add]")) {
      // Reutiliza el selector de archivos del chat en modo "añadir"
      const input = $("#fileInput");
      input.dataset.kind = items.every(isImage) ? "image" : "auto";
      input.dataset.adding = "1";
      input.accept = items.every(isImage) ? "image/*" : "";
      input.removeAttribute("capture");
      input.click();
    }
  });

  $("#attachStrip").addEventListener("keydown", (e) => {
    const thumb = e.target.closest("[data-attach-select]");
    if (thumb && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      select(Number(thumb.dataset.attachSelect));
    }
  });

  // Al cerrar sin enviar se descartan los archivos
  $("#modal-attach").addEventListener("modal:close", () => {
    items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
    items = [];
    current = 0;
  });
}
