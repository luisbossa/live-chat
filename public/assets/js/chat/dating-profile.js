// Asistente del perfil de citas de «Conocer»: fotos, datos, intereses, preguntas y seguridad.
import { $, $$, icon, escapeHTML, toast, toastError } from "./utils.js";
import { state, emit } from "./state.js";
import { api } from "./api.js";
import { onModalOpen, closeModal } from "./ui.js";
import { dz } from "./discover.js";

const MAX_PHOTOS = 6;
const wiz = { step: 1, photos: [], interests: new Set(), prompts: [], choices: {} };

const choice = (name) => wiz.choices[name] || "";

function setChoice(name, value) {
  wiz.choices[name] = value;
  $$(`.dz-choice[data-name="${name}"] button`).forEach((b) => b.classList.toggle("is-selected", b.dataset.value === value));
}

// --- Paso 1: fotos ------------------------------------------------------------
function renderPhotos() {
  const slots = [];
  for (let i = 0; i < MAX_PHOTOS; i++) {
    const url = wiz.photos[i];
    slots.push(
      url
        ? `<div class="dz-photo-slot has-photo ${i === 0 ? "is-main" : ""}" data-photo-index="${i}" style="background-image:url('${escapeHTML(url)}')">
             ${i === 0 ? `<span class="dz-photo-main">Principal</span>` : ""}
             <button type="button" class="dz-photo-del" data-photo-del="${i}" aria-label="Quitar foto">${icon("x", "icon-sm")}</button>
           </div>`
        : `<button type="button" class="dz-photo-slot" data-photo-add aria-label="Añadir foto">${icon("plus")}</button>`
    );
  }
  $("#dzPhotos").innerHTML = slots.join("");
}

// --- Paso 3: intereses y preguntas -------------------------------------------
function renderInterests() {
  const list = dz.options?.interests || [];
  $("#dzInterests").innerHTML = list
    .map((i) => `<button type="button" class="${wiz.interests.has(i) ? "is-selected" : ""}" data-interest="${escapeHTML(i)}">${escapeHTML(i)}</button>`)
    .join("");
  $("#dzInterestCount").textContent = `${wiz.interests.size}/8`;
}

function renderPrompts() {
  const all = dz.options?.prompts || [];
  const rows = [0, 1, 2].map((i) => wiz.prompts[i] || { q: "", a: "" });
  $("#dzPrompts").innerHTML = rows
    .map(
      (p, i) => `
      <div class="dz-prompt-edit">
        <select class="input" data-prompt-q="${i}">
          <option value="">Elige una pregunta…</option>
          ${all.map((q) => `<option ${q === p.q ? "selected" : ""}>${escapeHTML(q)}</option>`).join("")}
        </select>
        <input class="input" data-prompt-a="${i}" maxlength="150" placeholder="Tu respuesta" value="${escapeHTML(p.a)}" ${p.q ? "" : "disabled"}>
      </div>`
    )
    .join("");
}

function readPrompts() {
  wiz.prompts = [0, 1, 2]
    .map((i) => ({ q: $(`[data-prompt-q="${i}"]`)?.value || "", a: $(`[data-prompt-a="${i}"]`)?.value.trim() || "" }))
    .filter((p) => p.q);
}

// --- Navegación ---------------------------------------------------------------
const age = (birth) => {
  const [y, m, d] = birth.split("-").map(Number);
  if (!y) return null;
  const now = new Date();
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years -= 1;
  return years;
};

function validate(step) {
  if (step === 1 && !wiz.photos.length) return "Sube al menos una foto.";
  if (step === 2) {
    const years = age($("#dzBirth").value);
    if (years === null) return "Escribe tu fecha de nacimiento.";
    if (years < 18) return "Debes ser mayor de 18 años para usar «Conocer».";
    if (!choice("gender")) return "Elige tu género.";
    if (!choice("interestedIn")) return "Elige a quién quieres conocer.";
    if (!choice("lookingFor")) return "Elige qué buscas.";
    if (!$("#dzProvince").value) return "Elige tu provincia.";
  }
  if (step === 3 && wiz.interests.size < 3) return "Elige al menos 3 intereses.";
  return "";
}

function showStep(n) {
  wiz.step = n;
  $$(".dz-step").forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
  $$("#dzProgress i").forEach((bar, i) => bar.classList.toggle("is-on", i < n));
  $("#dzBack").hidden = n === 1;
  $("#dzNext").textContent = n === 4 ? (dz.profile ? "Guardar cambios" : "Activar mi perfil") : "Siguiente";
  $("#dzAlert").hidden = true;
  $("#dzForm").scrollTop = 0;
}

async function save() {
  readPrompts();
  const data = {
    birthdate: $("#dzBirth").value,
    gender: choice("gender"),
    interestedIn: choice("interestedIn"),
    lookingFor: choice("lookingFor"),
    province: $("#dzProvince").value,
    about: $("#dzAbout").value.trim(),
    interests: [...wiz.interests],
    prompts: wiz.prompts.filter((p) => p.a),
    photos: wiz.photos,
    ageMin: dz.profile?.ageMin ?? 21,
    ageMax: dz.profile?.ageMax ?? 40,
    maxKm: dz.profile?.maxKm ?? 200,
    paused: $("#dzPaused").checked,
  };
  const btn = $("#dzNext");
  btn.disabled = true;
  try {
    const firstTime = !dz.profile;
    await api.saveDatingProfile(data);
    closeModal("modal-dating");
    emit("profile-dating");
    toast(firstTime ? "¡Tu perfil de citas está listo! Empieza a deslizar 🔥" : "Perfil de citas guardado", { tone: "success", icon: "flame" });
  } catch (err) {
    $("#dzAlert").textContent = err.message;
    $("#dzAlert").hidden = false;
    const field = Object.keys(err.data?.errors || {})[0];
    if (field === "photos") showStep(1);
    else if (["birthdate", "gender", "interestedIn", "lookingFor", "province"].includes(field)) showStep(2);
    else if (field === "interests") showStep(3);
  } finally {
    btn.disabled = false;
  }
}

export function initDatingProfile() {
  onModalOpen("modal-dating", () => {
    const p = dz.profile;
    wiz.photos = p ? [...p.photos] : state.me.avatar && !state.me.avatar.includes("avatar-default") ? [state.me.avatar] : [];
    wiz.interests = new Set(p?.interests || []);
    wiz.prompts = p?.prompts ? [...p.prompts] : [];
    $("#dzWizTitle").textContent = p ? "Editar perfil de citas" : "Crea tu perfil de citas";
    $("#dzBirth").value = p?.birthdate || "";
    $("#dzBirth").max = new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10);
    $("#dzProvince").innerHTML =
      `<option value="">Elige…</option>` + (dz.options?.provinces || []).map((pr) => `<option value="${pr.id}">${escapeHTML(pr.name)}</option>`).join("");
    $("#dzProvince").value = p?.province || "";
    $("#dzAbout").value = p?.about || "";
    $("#dzAboutCount").textContent = `${$("#dzAbout").value.length}/300`;
    $("#dzPaused").checked = Boolean(p?.paused);
    setChoice("gender", p?.gender || "");
    setChoice("interestedIn", p?.interestedIn || "");
    setChoice("lookingFor", p?.lookingFor || "");
    $("#dzVerify").classList.toggle("is-verified", Boolean(p?.verified));
    $("#dzSelfieBtn").innerHTML = p?.verified ? `${icon("shield-check", "icon-sm")}Perfil verificado` : `${icon("camera", "icon-sm")}Tomar selfie`;
    $("#dzSelfieBtn").disabled = Boolean(p?.verified) || !p;
    renderPhotos();
    renderInterests();
    renderPrompts();
    showStep(1);
  });

  $$(".dz-choice").forEach((group) =>
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-value]");
      if (btn && group.closest("#dzForm")) setChoice(group.dataset.name, btn.dataset.value);
    })
  );

  // Fotos: añadir, quitar y elegir la principal
  $("#dzPhotos").addEventListener("click", (e) => {
    const del = e.target.closest("[data-photo-del]");
    if (del) {
      wiz.photos.splice(Number(del.dataset.photoDel), 1);
      return renderPhotos();
    }
    if (e.target.closest("[data-photo-add]")) return $("#dzPhotoInput").click();
    const slot = e.target.closest("[data-photo-index]");
    if (slot && Number(slot.dataset.photoIndex) > 0) {
      const [url] = wiz.photos.splice(Number(slot.dataset.photoIndex), 1);
      wiz.photos.unshift(url);
      renderPhotos();
    }
  });
  $("#dzPhotoInput").addEventListener("change", async (e) => {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - wiz.photos.length);
    e.target.value = "";
    if (!files.length) return;
    try {
      const { urls } = await api.uploadDatingPhotos(files);
      wiz.photos.push(...urls);
      renderPhotos();
    } catch (err) {
      toastError(err.message);
    }
  });

  $("#dzInterests").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-interest]");
    if (!btn) return;
    const v = btn.dataset.interest;
    if (wiz.interests.has(v)) wiz.interests.delete(v);
    else if (wiz.interests.size < 8) wiz.interests.add(v);
    else toast("Puedes elegir hasta 8 intereses", { icon: "alert" });
    renderInterests();
  });
  $("#dzPrompts").addEventListener("change", (e) => {
    const q = e.target.closest("[data-prompt-q]");
    if (!q) return;
    const input = $(`[data-prompt-a="${q.dataset.promptQ}"]`);
    input.disabled = !q.value;
    if (q.value) input.focus();
  });
  $("#dzAbout").addEventListener("input", () => ($("#dzAboutCount").textContent = `${$("#dzAbout").value.length}/300`));

  // Verificación con selfie (solo con el perfil ya creado)
  $("#dzSelfieBtn").addEventListener("click", () => $("#dzSelfie").click());
  $("#dzSelfie").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      await api.verifyDating(file);
      $("#dzVerify").classList.add("is-verified");
      $("#dzSelfieBtn").innerHTML = `${icon("shield-check", "icon-sm")}Perfil verificado`;
      $("#dzSelfieBtn").disabled = true;
      emit("profile-dating");
      toast("¡Perfil verificado! Ahora tienes la insignia azul", { tone: "success", icon: "shield-check" });
    } catch (err) {
      toastError(err.message);
    }
  });

  $("#dzBack").addEventListener("click", () => showStep(Math.max(1, wiz.step - 1)));
  $("#dzNext").addEventListener("click", () => {
    const error = validate(wiz.step);
    if (error) {
      $("#dzAlert").textContent = error;
      $("#dzAlert").hidden = false;
      return;
    }
    if (wiz.step === 3) readPrompts();
    if (wiz.step < 4) showStep(wiz.step + 1);
    else save();
  });
}
