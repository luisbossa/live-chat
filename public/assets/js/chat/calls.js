// Llamadas 1 a 1 con WebRTC. Socket.IO solo transporta la señalización;
// el audio y el video viajan directamente entre los navegadores.
import { $, toast, duration, toastError } from "./utils.js";
import { state, activeConv, isGroup, peerOf, convTitle, convAvatar, isBlockedConv } from "./state.js";
import { socket } from "./socket.js";
import { registerAction, openModal, closeModal } from "./ui.js";

const config = JSON.parse($("#clientConfig").textContent);

const call = {
  id: null,
  type: "audio",
  role: null, // caller | callee
  pc: null,
  local: null,
  remote: null,
  pendingCandidates: [],
  timer: null,
  startedAt: 0,
  incoming: null,
  screen: null,
};

const box = $("#callBox");
const setState = (text) => ($("#callState").textContent = text);
const setPhase = (phase) => (document.body.dataset.callState = phase); // útil para pruebas y estilos

// --- Tono de llamada (sin archivos de audio) ---
let ringCtx;
let ringTimer;
function ring(kind) {
  stopRing();
  try {
    ringCtx = new AudioContext();
    const beep = () => {
      const o = ringCtx.createOscillator();
      const g = ringCtx.createGain();
      o.frequency.value = kind === "incoming" ? 660 : 440;
      g.gain.setValueAtTime(0.0001, ringCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ringCtx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ringCtx.currentTime + 0.8);
      o.connect(g).connect(ringCtx.destination);
      o.start();
      o.stop(ringCtx.currentTime + 0.85);
    };
    beep();
    ringTimer = setInterval(beep, kind === "incoming" ? 1500 : 3000);
  } catch {
    /* sin audio */
  }
}

function stopRing() {
  clearInterval(ringTimer);
  ringCtx?.close().catch(() => {});
  ringCtx = null;
}

// --- Medios ---
async function getMedia(type) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Tu navegador no permite llamadas (se necesita HTTPS o localhost).");
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: type === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false });
  } catch (err) {
    if (type === "video") {
      // Sin cámara: se sigue solo con audio
      toast("No se pudo usar la cámara; la llamada será solo de voz.", { tone: "error", icon: "video-off" });
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
    throw new Error(err.name === "NotAllowedError" ? "Necesitamos permiso para usar el micrófono." : "No se encontró un micrófono.");
  }
}

function createPeer() {
  const pc = new RTCPeerConnection({ iceServers: config.iceServers });
  call.local.getTracks().forEach((track) => pc.addTrack(track, call.local));

  pc.onicecandidate = ({ candidate }) => candidate && socket.emit("call:signal", { callId: call.id, data: { candidate } });

  pc.ontrack = ({ streams }) => {
    call.remote = streams[0];
    $("#remoteVideo").srcObject = call.remote;
    const hasVideo = call.remote.getVideoTracks().length > 0;
    box.classList.toggle("has-remote-video", hasVideo);
    call.remote.onaddtrack = () => box.classList.toggle("has-remote-video", call.remote.getVideoTracks().length > 0);
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") onConnected();
    if (pc.connectionState === "failed") {
      toast("Se perdió la conexión de la llamada.", { tone: "error", icon: "phone-off" });
      hangUp();
    }
  };
  call.pc = pc;
  return pc;
}

async function flushCandidates() {
  for (const candidate of call.pendingCandidates.splice(0)) {
    await call.pc.addIceCandidate(candidate).catch(() => {});
  }
}

function onConnected() {
  if (call.timer) return;
  stopRing();
  setPhase("connected");
  box.classList.add("is-live");
  call.startedAt = Date.now();
  setState("0:00");
  call.timer = setInterval(() => setState(duration((Date.now() - call.startedAt) / 1000)), 1000);
}

// --- Pantalla de llamada ---
function showCallScreen(person, type) {
  box.className = `call ${type === "video" ? "is-video" : ""}`;
  $("#callBg").style.backgroundImage = `url(${person.avatar})`;
  $("#callAvatar").src = person.avatar;
  $("#callName").textContent = person.name;
  $("#localVideo").srcObject = call.local;
  $$controls().forEach((b) => b.classList.remove("is-off"));
  $('[data-action="call-camera"]').hidden = !call.local?.getVideoTracks().length;
  $('[data-action="call-screen"]').hidden = !navigator.mediaDevices?.getDisplayMedia || !call.local?.getVideoTracks().length;
  openModal("modal-call");
}

const $$controls = () => [...box.querySelectorAll(".call-btn")];

function cleanup() {
  stopRing();
  clearInterval(call.timer);
  call.pc?.close();
  [call.local, call.screen].forEach((s) => s?.getTracks().forEach((t) => t.stop()));
  $("#remoteVideo").srcObject = null;
  $("#localVideo").srcObject = null;
  Object.assign(call, { id: null, role: null, pc: null, local: null, remote: null, screen: null, pendingCandidates: [], timer: null, startedAt: 0, incoming: null });
  closeModal("modal-call");
  closeModal("modal-incoming");
  setPhase("idle");
}

export const inCall = () => Boolean(call.id || call.incoming);

// ==========================================================================
// Llamar
// ==========================================================================
export async function startCall(type, conv = activeConv()) {
  if (!conv || isGroup(conv)) return toast("Las llamadas están disponibles en chats individuales.", { icon: "phone" });
  if (isBlockedConv(conv)) return toast("Desbloquea al contacto para llamarle.", { tone: "error", icon: "ban" });
  if (inCall()) return toast("Ya tienes una llamada en curso.", { icon: "phone" });

  const peer = peerOf(conv);
  try {
    call.local = await getMedia(type);
  } catch (err) {
    return toastError(err.message);
  }
  call.type = call.local.getVideoTracks().length ? "video" : "audio";
  call.role = "caller";
  call.id = "pending";
  showCallScreen({ name: convTitle(conv), avatar: convAvatar(conv) }, call.type);
  setState(peer?.online ? "Llamando…" : "Conectando…");
  setPhase("calling");
  ring("outgoing");

  socket.emit("call:invite", { conversationId: conv.id, type: call.type }, (res) => {
    if (res?.error) {
      toastError(res.error);
      return cleanup();
    }
    call.id = res.callId;
    setState("Sonando…");
  });
}

// Llamante: el otro aceptó → se envía la oferta SDP
socket.on("call:accepted", async ({ callId }) => {
  if (callId !== call.id || call.role !== "caller") return;
  setState("Conectando…");
  stopRing();
  const pc = createPeer();
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("call:signal", { callId, data: { sdp: pc.localDescription } });
});

// ==========================================================================
// Recibir
// ==========================================================================
socket.on("call:incoming", (incoming) => {
  if (inCall()) return; // el servidor ya marca "ocupado" si procede
  call.incoming = incoming;
  state.users.set(incoming.from.id, { ...state.users.get(incoming.from.id), ...incoming.from });
  $("#incomingAvatar").src = incoming.from.avatar;
  $("#incomingName").textContent = incoming.from.name;
  $("#incomingLabel").textContent = incoming.type === "video" ? "Videollamada entrante" : "Llamada de voz entrante";
  openModal("modal-incoming");
  setPhase("ringing");
  ring("incoming");
  if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
    new Notification(incoming.from.name, { body: $("#incomingLabel").textContent, icon: incoming.from.avatar, tag: "yabla-call" });
  }
});

async function accept() {
  const incoming = call.incoming;
  if (!incoming) return;
  // Se limpia antes de cerrar el modal: su evento de cierre significa "rechazar"
  call.incoming = null;
  call.id = incoming.callId;
  call.type = incoming.type;
  call.role = "callee";
  stopRing();
  closeModal("modal-incoming");
  try {
    call.local = await getMedia(incoming.type);
  } catch (err) {
    toastError(err.message);
    socket.emit("call:reject", { callId: incoming.callId });
    return cleanup();
  }
  showCallScreen(incoming.from, call.type);
  setState("Conectando…");
  setPhase("connecting");
  createPeer();
  socket.emit("call:accept", { callId: call.id });
}

function decline() {
  if (!call.incoming) return;
  socket.emit("call:reject", { callId: call.incoming.callId });
  cleanup();
}

// Oferta/respuesta SDP y candidatos ICE
socket.on("call:signal", async ({ callId, data }) => {
  if (callId !== call.id || !call.pc) return;
  const pc = call.pc;
  try {
    if (data.sdp) {
      await pc.setRemoteDescription(data.sdp);
      await flushCandidates();
      if (data.sdp.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:signal", { callId, data: { sdp: pc.localDescription } });
      }
    } else if (data.candidate) {
      if (pc.remoteDescription) await pc.addIceCandidate(data.candidate);
      else call.pendingCandidates.push(data.candidate);
    }
  } catch (err) {
    console.error("WebRTC", err);
  }
});

const END_REASONS = {
  declined: "Llamada rechazada",
  timeout: "Sin respuesta",
  hangup: "Llamada finalizada",
  disconnected: "El contacto se desconectó",
  cancelled: "Llamada cancelada",
};

socket.on("call:ended", ({ callId, reason }) => {
  const matches = callId === call.id || callId === call.incoming?.callId;
  if (!matches) return;
  const talked = call.startedAt ? ` · ${duration((Date.now() - call.startedAt) / 1000)}` : "";
  if (reason !== "answered-elsewhere") toast(`${END_REASONS[reason] || "Llamada finalizada"}${talked}`, { icon: "phone-off", tone: ["declined", "disconnected", "timeout"].includes(reason) ? "error" : "info" });
  cleanup();
});

function hangUp() {
  if (call.id && call.id !== "pending") socket.emit("call:end", { callId: call.id });
  const talked = call.startedAt ? `Llamada finalizada · ${duration((Date.now() - call.startedAt) / 1000)}` : "Llamada cancelada";
  toast(talked, { icon: "phone-off" });
  cleanup();
}

// ==========================================================================
// Controles
// ==========================================================================
function toggleTrack(kind, btn, onIcon, offIcon) {
  const tracks = kind === "audio" ? call.local?.getAudioTracks() : call.local?.getVideoTracks();
  if (!tracks?.length) return;
  const enabled = !tracks[0].enabled;
  tracks.forEach((t) => (t.enabled = enabled));
  btn.classList.toggle("is-off", !enabled);
  btn.querySelector("use").setAttribute("href", `/assets/images/icons.svg#i-${enabled ? onIcon : offIcon}`);
  if (kind === "video") box.classList.toggle("cam-off", !enabled);
}

async function toggleScreen(btn) {
  const sender = call.pc?.getSenders().find((s) => s.track?.kind === "video");
  if (!sender) return;
  if (call.screen) {
    call.screen.getTracks().forEach((t) => t.stop());
    call.screen = null;
    await sender.replaceTrack(call.local.getVideoTracks()[0]);
    $("#localVideo").srcObject = call.local;
    return btn.classList.remove("is-off");
  }
  try {
    call.screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = call.screen.getVideoTracks()[0];
    await sender.replaceTrack(track);
    $("#localVideo").srcObject = call.screen;
    btn.classList.add("is-off");
    track.onended = () => call.screen && toggleScreen(btn);
  } catch {
    /* el usuario canceló */
  }
}

export function initCalls() {
  registerAction("call-accept", accept);
  registerAction("call-decline", decline);
  registerAction("call-end", hangUp);
  registerAction("call-mute", (btn) => toggleTrack("audio", btn, "mic", "mic-off"));
  registerAction("call-camera", (btn) => toggleTrack("video", btn, "video", "video-off"));
  registerAction("call-screen", (btn) => toggleScreen(btn));
  // Cerrar la ventana de llamada con Esc o clic fuera = colgar
  $("#modal-call").addEventListener("modal:close", () => call.id && hangUp());
  $("#modal-incoming").addEventListener("modal:close", () => call.incoming && decline());
  window.addEventListener("beforeunload", () => call.id && call.id !== "pending" && socket.emit("call:end", { callId: call.id }));
  setPhase("idle");
}
