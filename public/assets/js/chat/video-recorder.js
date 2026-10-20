// Grabar video y enviarlo al chat (como WhatsApp): cámara a pantalla completa, cambiar de
// cámara, hasta 1 minuto con anillo de progreso, vista previa con comentario y envío.
import { $, toast, toastError, isMobile, duration, fileSize } from "./utils.js";
import { openModal, closeModal, confirmDialog } from "./ui.js";
import { sendVideo, VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS } from "./conversation.js";

const RING = 2 * Math.PI * 46; // perímetro del anillo (r = 46 en el viewBox de 100)

// H.264 (mp4) primero: se reproduce en todos los navegadores, también en iPhone
const FORMATS = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

const rec = {
  stream: null,
  media: null,
  chunks: [],
  facing: "user",
  started: 0,
  timer: null,
  blob: null,
  url: null,
  seconds: 0,
  width: 0,
  height: 0,
  cancelled: false,
  closing: false,
};

const pickFormat = () => FORMATS.find((f) => window.MediaRecorder?.isTypeSupported?.(f)) || "";

function showError(text) {
  $("#vrError").innerHTML = text;
  $("#vrError").hidden = false;
  $("#vrControls").hidden = true;
}

function setTime(seconds) {
  $("#vrTime b").textContent = duration(seconds);
  $("#vrRing").style.strokeDashoffset = String(RING * (1 - Math.min(seconds / VIDEO_MAX_SECONDS, 1)));
}

function stopStream() {
  rec.stream?.getTracks().forEach((t) => t.stop());
  rec.stream = null;
  $("#vrLive").srcObject = null;
}

async function startCamera() {
  stopStream();
  $("#vrError").hidden = true;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return showError("<strong>No se puede usar la cámara</strong>Grabar video necesita una conexión segura (https).");
  }
  if (!window.MediaRecorder) return showError("<strong>Tu navegador no permite grabar video</strong>Prueba con Chrome, Edge, Firefox o Safari actualizados.");
  try {
    rec.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: rec.facing }, width: { ideal: 854 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
      audio: { echoCancellation: true, noiseSuppression: true },
    });
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return showError("<strong>Permite la cámara y el micrófono</strong>Toca el icono del candado junto a la dirección y activa ambos permisos.");
    }
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") return showError("<strong>No encontramos una cámara</strong>Conecta una cámara o prueba en tu teléfono.");
    if (err.name === "NotReadableError") return showError("<strong>La cámara está ocupada</strong>Ciérrala en otra app o pestaña y vuelve a intentarlo.");
    return showError(`<strong>No se pudo abrir la cámara</strong>${err.message || ""}`);
  }
  // Si la app ya se cerró mientras se pedía permiso, se libera enseguida
  if (!$("#modal-video").classList.contains("is-open")) return stopStream();
  const live = $("#vrLive");
  live.srcObject = rec.stream;
  live.classList.toggle("is-mirrored", rec.facing === "user");
  $("#vrControls").hidden = false;
  // Solo se ofrece cambiar de cámara si hay más de una
  try {
    const cams = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
    $("#vrFlip").hidden = cams.length < 2;
  } catch {
    $("#vrFlip").hidden = true;
  }
}

function resetUI() {
  clearInterval(rec.timer);
  rec.chunks = [];
  rec.blob = null;
  if (rec.url) URL.revokeObjectURL(rec.url);
  rec.url = null;
  rec.seconds = 0;
  rec.cancelled = false;
  const modal = $("#modal-video");
  modal.classList.remove("is-recording", "is-review");
  $("#vrLive").hidden = false;
  const preview = $("#vrPreview");
  preview.pause();
  preview.removeAttribute("src");
  preview.load();
  preview.hidden = true;
  $("#vrReview").hidden = true;
  $("#vrCaption").value = "";
  $("#vrShutter").setAttribute("aria-label", "Empezar a grabar");
  $("#vrHint").textContent = "Toca para grabar · hasta 1 minuto";
  setTime(0);
}

function startRecording() {
  if (!rec.stream) return;
  const mimeType = pickFormat();
  try {
    rec.media = new MediaRecorder(rec.stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 64_000 });
  } catch {
    rec.media = new MediaRecorder(rec.stream);
  }
  rec.chunks = [];
  rec.cancelled = false;
  rec.media.ondataavailable = (e) => e.data.size && rec.chunks.push(e.data);
  rec.media.onstop = finishRecording;
  rec.media.start(250);
  rec.started = Date.now();
  $("#modal-video").classList.add("is-recording");
  $("#vrShutter").setAttribute("aria-label", "Detener la grabación");
  $("#vrHint").textContent = "Toca para terminar";
  $("#vrFlip").disabled = true;
  rec.timer = setInterval(() => {
    const s = (Date.now() - rec.started) / 1000;
    setTime(s);
    if (s >= VIDEO_MAX_SECONDS) stopRecording();
  }, 100);
}

function stopRecording(cancel = false) {
  if (!rec.media || rec.media.state === "inactive") return;
  rec.cancelled = cancel;
  clearInterval(rec.timer);
  rec.media.stop();
}

function finishRecording() {
  $("#modal-video").classList.remove("is-recording");
  $("#vrFlip").disabled = false;
  rec.seconds = Math.min((Date.now() - rec.started) / 1000, VIDEO_MAX_SECONDS);
  if (rec.cancelled || rec.closing) return;
  if (rec.seconds < 1) {
    toast("Mantén la grabación al menos un segundo", { icon: "video" });
    return resetUI();
  }
  const type = (rec.media.mimeType || pickFormat() || "video/webm").split(";")[0];
  rec.blob = new Blob(rec.chunks, { type });
  rec.url = URL.createObjectURL(rec.blob);
  // La cámara se apaga mientras revisas el video (se vuelve a encender al repetir)
  const settings = rec.stream?.getVideoTracks()[0]?.getSettings() || {};
  stopStream();

  const preview = $("#vrPreview");
  preview.src = rec.url;
  preview.classList.toggle("is-mirrored", rec.facing === "user");
  preview.onloadedmetadata = () => {
    rec.width = preview.videoWidth || settings.width || 0;
    rec.height = preview.videoHeight || settings.height || 0;
  };
  preview.hidden = false;
  $("#vrLive").hidden = true;
  $("#vrControls").hidden = true;
  $("#vrReview").hidden = false;
  $("#modal-video").classList.add("is-review");
  setTime(rec.seconds);

  const tooBig = rec.blob.size > VIDEO_MAX_BYTES;
  $("#vrSize").textContent = tooBig ? `Pesa ${fileSize(rec.blob.size)}: supera el límite de ${fileSize(VIDEO_MAX_BYTES)}. Repítelo más corto.` : `${duration(rec.seconds)} · ${fileSize(rec.blob.size)}`;
  $("#vrSize").classList.toggle("is-error", tooBig);
  $("#vrSend").disabled = tooBig;
  preview.play().then(() => $("#modal-video").classList.add("is-playing")).catch(() => {});
}

async function retake() {
  resetUI();
  await startCamera();
}

function togglePreview() {
  const preview = $("#vrPreview");
  if (preview.paused) preview.play().catch(() => {});
  else preview.pause();
}

async function send() {
  if (!rec.blob) return;
  const ext = rec.blob.type.includes("mp4") ? "mp4" : "webm";
  const file = new File([rec.blob], `video-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${ext}`, { type: rec.blob.type });
  const info = { duration: rec.seconds, width: rec.width, height: rec.height, caption: $("#vrCaption").value.trim() };
  rec.blob = null; // la URL de vista previa la sigue usando el mensaje provisional
  rec.url = null;
  closeModal("modal-video");
  sendVideo(file, info);
}

/** Cierra (con confirmación si hay una grabación sin enviar). */
async function requestClose() {
  const busy = rec.media?.state === "recording" || Boolean(rec.blob);
  if (busy && !(await confirmDialog({ title: "¿Descartar el video?", text: "Se perderá lo que grabaste.", okText: "Descartar" }))) return;
  closeModal("modal-video");
}

function cleanup() {
  rec.closing = true;
  stopRecording(true);
  stopStream();
  resetUI();
  rec.closing = false;
}

export function openVideoRecorder() {
  rec.facing = isMobile() ? "environment" : "user";
  resetUI();
  openModal("modal-video");
  startCamera();
}

export function initVideoRecorder() {
  const modal = $("#modal-video");
  modal.addEventListener("modal:close", cleanup);
  modal.addEventListener("click", (e) => {
    const action = e.target.closest("[data-vr]")?.dataset.vr;
    if (action === "close") requestClose();
    else if (action === "retake") retake();
    else if (action === "flip" && rec.media?.state !== "recording") {
      rec.facing = rec.facing === "user" ? "environment" : "user";
      startCamera();
    }
  });
  $("#vrShutter").addEventListener("click", () => (rec.media?.state === "recording" ? stopRecording() : startRecording()));
  $("#vrPlay").addEventListener("click", togglePreview);
  $("#vrPreview").addEventListener("click", togglePreview);
  $("#vrPreview").addEventListener("play", () => modal.classList.add("is-playing"));
  $("#vrPreview").addEventListener("pause", () => modal.classList.remove("is-playing"));
  $("#vrReview").addEventListener("submit", (e) => {
    e.preventDefault();
    send().catch((err) => toastError(err.message));
  });
  // Si la app pasa a segundo plano mientras graba, se detiene y queda para revisar
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rec.media?.state === "recording") stopRecording();
  });
}
