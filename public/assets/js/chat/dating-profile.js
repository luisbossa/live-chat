// Asistente del perfil de citas de «Conocer»: fotos, datos, intereses, preguntas y seguridad.
import { $, $$, icon, escapeHTML, toast, toastError } from "./utils.js";
import { state, emit } from "./state.js";
import { api } from "./api.js";
import { onModalOpen, closeModal } from "./ui.js";
import { dz, dzAlert, markInvalid, clearInvalid } from "./discover.js";
import { labelHTML, plainLabel } from "./dz-icons.js";

const MAX_PHOTOS = 6;
const MIN_INTERESTS = 3;
const MAX_INTERESTS = 8;
const wiz = { step: 1, photos: [], uploading: 0, interests: new Set(), prompts: [], choices: {}, error: null };

const choice = (name) => wiz.choices[name] || "";

function setChoice(name, value) {
  wiz.choices[name] = value;
  $$(`.dz-choice[data-name="${name}"] button`).forEach((b) => b.classList.toggle("is-selected", b.dataset.value === value));
}

// --- Paso 1: fotos (la principal ocupa el doble) ------------------------------
function renderPhotos() {
  const slots = [];
  for (let i = 0; i < MAX_PHOTOS; i++) {
    const url = wiz.photos[i];
    if (url) {
      slots.push(`
        <div class="dz-photo-slot has-photo ${i === 0 ? "is-main" : ""}" data-photo-index="${i}" style="background-image:url('${escapeHTML(url)}')" title="${i ? "Hacer principal" : "Foto principal"}">
          ${i === 0 ? `<span class="dz-photo-main">${icon("star-fill", "icon-sm")}Principal</span>` : `<span class="dz-slot-n">${i + 1}</span>`}
          <button type="button" class="dz-photo-del" data-photo-del="${i}" aria-label="Quitar foto">${icon("x", "icon-sm")}</button>
        </div>`);
    } else if (i < wiz.photos.length + wiz.uploading) {
      slots.push(`<div class="dz-photo-slot is-loading ${i === 0 ? "is-main" : ""}"><span class="spinner"></span><small>Subiendo…</small></div>`);
    } else if (i === 0) {
      slots.push(`
        <button type="button" class="dz-photo-slot is-empty is-main" data-photo-add>
          <span class="dz-slot-ico">${icon("camera")}</span>
          <strong>Foto principal</strong>
          <small>Toca para subirla</small>
        </button>`);
    } else {
      slots.push(`<button type="button" class="dz-photo-slot is-empty" data-photo-add aria-label="Añadir foto ${i + 1}"><span class="dz-slot-n">${i + 1}</span>${icon("plus")}</button>`);
    }
  }
  $("#dzPhotos").innerHTML = slots.join("");
  const n = wiz.photos.length;
  $("#dzPhotoCount").textContent = `${n}/${MAX_PHOTOS}`;
  $("#dzPhotoCount").classList.toggle("is-ok", n > 0);
}

// --- Paso 2: edad en vivo -----------------------------------------------------
const age = (birth) => {
  const [y, m, d] = String(birth || "").split("-").map(Number);
  if (!y || y < 1900) return null;
  const now = new Date();
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years -= 1;
  return years;
};

function renderBirthNote() {
  const note = $("#dzBirthNote");
  const years = age($("#dzBirth").value);
  note.classList.remove("is-ok", "is-error");
  if (years === null) note.textContent = "Debes ser mayor de 18. Solo se muestra tu edad.";
  else if (years < 18) {
    note.classList.add("is-error");
    note.innerHTML = `${icon("alert", "icon-sm")}Tienes ${Math.max(0, years)} años: «Conocer» es solo para mayores de 18.`;
  } else if (years > 99) {
    note.classList.add("is-error");
    note.innerHTML = `${icon("alert", "icon-sm")}Revisa el año de nacimiento.`;
  } else {
    note.classList.add("is-ok");
    note.innerHTML = `${icon("check", "icon-sm")}Tienes ${years} años. Solo se mostrará tu edad.`;
  }
}

// --- Paso 3: intereses y preguntas -------------------------------------------
function renderInterests() {
  const list = dz.options?.interests || [];
  $("#dzInterests").innerHTML = list
    .map((i) => `<button type="button" class="${wiz.interests.has(i) ? "is-selected" : ""}" data-interest="${escapeHTML(i)}" aria-pressed="${wiz.interests.has(i)}" aria-label="${escapeHTML(plainLabel(i))}">${labelHTML(i)}</button>`)
    .join("");
  const n = wiz.interests.size;
  const count = $("#dzInterestCount");
  count.textContent = `${n}/${MAX_INTERESTS}`;
  count.classList.toggle("is-ok", n >= MIN_INTERESTS);
  count.classList.toggle("is-full", n >= MAX_INTERESTS);
  const hint = $("#dzInterestHint");
  hint.classList.toggle("is-ok", n >= MIN_INTERESTS);
  hint.classList.toggle("is-error", n < MIN_INTERESTS && wiz.error?.el?.id === "dzInterests");
  hint.innerHTML =
    n >= MAX_INTERESTS
      ? `${icon("check", "icon-sm")}¡Listo! Llegaste al máximo de ${MAX_INTERESTS}.`
      : n >= MIN_INTERESTS
        ? `${icon("check", "icon-sm")}¡Bien! Puedes elegir ${MAX_INTERESTS - n} más si quieres.`
        : `Elige ${MIN_INTERESTS - n} ${MIN_INTERESTS - n === 1 ? "interés" : "intereses"} más. Te mostraremos la afinidad con cada persona.`;
}

function renderPrompts() {
  const all = dz.options?.prompts || [];
  const rows = [0, 1, 2].map((i) => wiz.prompts[i] || { q: "", a: "" });
  $("#dzPrompts").innerHTML = rows
    .map(
      (p, i) => `
      <div class="dz-prompt-edit ${p.q ? "is-filled" : ""}">
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

// --- Validación por paso --------------------------------------------------------
function validate(step) {
  if (step === 1 && !wiz.photos.length) {
    if (wiz.uploading) return { el: $("#dzPhotos"), title: "Un momento", text: "Espera a que termine de subir tu foto.", inline: "" };
    return { el: $("#dzPhotos"), title: "Falta tu foto", text: "Sube al menos una foto para que puedan conocerte.", inline: "" };
  }
  if (step === 2) {
    const years = age($("#dzBirth").value);
    if (years === null) return { el: $("#dzBirth"), title: "Falta tu fecha de nacimiento", text: "La usamos solo para mostrar tu edad.", inline: "" };
    if (years < 18) return { el: $("#dzBirth"), title: "Solo para mayores de 18", text: "Debes tener 18 años o más para usar «Conocer».", inline: "" };
    if (years > 99) return { el: $("#dzBirth"), title: "Revisa la fecha", text: "El año de nacimiento no parece correcto.", inline: "" };
    if (!$("#dzProvince").value) return { el: $("#dzProvince"), title: "Falta tu provincia", text: "La usamos para calcular la distancia aproximada.", inline: "Elige tu provincia." };
    if (!choice("gender")) return { el: $('.dz-choice[data-name="gender"]'), title: "Cuéntanos quién eres", text: "Elige la opción con la que te identificas.", inline: "Elige una opción." };
    if (!choice("interestedIn")) return { el: $('.dz-choice[data-name="interestedIn"]'), title: "¿A quién quieres conocer?", text: "Así te mostramos las personas indicadas.", inline: "Elige una opción." };
    if (!choice("lookingFor")) return { el: $('.dz-choice[data-name="lookingFor"]'), title: "¿Qué buscas?", text: "Ayuda a que hagas match con gente que busca lo mismo.", inline: "Elige una opción." };
  }
  if (step === 3 && wiz.interests.size < MIN_INTERESTS) {
    const left = MIN_INTERESTS - wiz.interests.size;
    return { el: $("#dzInterests"), title: "Elige tus intereses", text: `Te ${left === 1 ? "falta" : "faltan"} ${left} ${left === 1 ? "interés" : "intereses"} para continuar.`, inline: "" };
  }
  return null;
}

function showError(err) {
  wiz.error = err;
  dzAlert($("#dzAlert"), err.text, { title: err.title });
  markInvalid(err.el, err.inline ?? err.text);
  if (err.el?.id === "dzInterests") $("#dzInterestHint").classList.add("is-error");
}

function clearError() {
  wiz.error = null;
  $("#dzAlert").hidden = true;
  $("#dzInterestHint")?.classList.remove("is-error");
  clearInvalid($("#dzForm"));
}

/** Al corregir el campo marcado, el aviso desaparece (el siguiente error se muestra al pulsar «Siguiente»). */
function revalidate() {
  if (!wiz.error) return;
  const next = validate(wiz.step);
  if (!next || next.el !== wiz.error.el) clearError();
}

function showStep(n) {
  wiz.step = n;
  clearError();
  $$(".dz-step").forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
  $$("#dzProgress li").forEach((li, i) => {
    li.classList.toggle("is-done", i + 1 < n);
    li.classList.toggle("is-current", i + 1 === n);
    li.setAttribute("aria-current", i + 1 === n ? "step" : "false");
  });
  $("#dzBack").hidden = n === 1;
  $("#dzNext").innerHTML = n === 4 ? `${icon("flame", "icon-sm")}${dz.profile ? "Guardar cambios" : "Activar mi perfil"}` : `Siguiente${icon("chevron-right", "icon-sm")}`;
  $("#dzForm").closest(".modal-dialog").scrollTop = 0;
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
  btn.classList.add("is-loading");
  try {
    const firstTime = !dz.profile;
    await api.saveDatingProfile(data);
    closeModal("modal-dating");
    emit("profile-dating");
    toast(firstTime ? "¡Tu perfil de citas está listo! Empieza a deslizar" : "Perfil de citas guardado", { tone: "success", icon: "flame" });
  } catch (err) {
    // El servidor indica el campo: se vuelve a su paso y se marca
    const field = Object.keys(err.data?.errors || {})[0];
    const stepOf = { photos: 1, birthdate: 2, gender: 2, interestedIn: 2, lookingFor: 2, province: 2, interests: 3 };
    if (stepOf[field] && stepOf[field] !== wiz.step) showStep(stepOf[field]);
    const els = { photos: "#dzPhotos", birthdate: "#dzBirth", province: "#dzProvince", interests: "#dzInterests", gender: '.dz-choice[data-name="gender"]', interestedIn: '.dz-choice[data-name="interestedIn"]', lookingFor: '.dz-choice[data-name="lookingFor"]' };
    const message = err.data?.errors?.[field] || err.message;
    showError({ el: els[field] ? $(els[field]) : null, title: "No se pudo guardar", text: message, inline: message });
  } finally {
    btn.disabled = false;
    btn.classList.remove("is-loading");
  }
}

export function initDatingProfile() {
  onModalOpen("modal-dating", () => {
    const p = dz.profile;
    wiz.photos = p ? [...p.photos] : state.me.avatar && !state.me.avatar.includes("avatar-default") ? [state.me.avatar] : [];
    wiz.uploading = 0;
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
    renderBirthNote();
    renderInterests();
    renderPrompts();
    showStep(1);
  });

  $$(".dz-choice").forEach((group) =>
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-value]");
      if (btn && group.closest("#dzForm")) {
        setChoice(group.dataset.name, btn.dataset.value);
        revalidate();
      }
    })
  );

  // Pasos ya completados: se puede volver tocando su etiqueta
  $("#dzProgress").addEventListener("click", (e) => {
    const li = e.target.closest("li.is-done");
    if (li) showStep(Number(li.dataset.goto));
  });

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
    wiz.uploading = files.length;
    renderPhotos();
    try {
      const { urls } = await api.uploadDatingPhotos(files);
      wiz.photos.push(...urls);
    } catch (err) {
      dzAlert($("#dzAlert"), err.message, { title: "No se pudo subir la foto" });
    } finally {
      wiz.uploading = 0;
      renderPhotos();
      revalidate();
    }
  });

  $("#dzInterests").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-interest]");
    if (!btn) return;
    const v = btn.dataset.interest;
    if (wiz.interests.has(v)) wiz.interests.delete(v);
    else if (wiz.interests.size < MAX_INTERESTS) wiz.interests.add(v);
    else {
      dzAlert($("#dzAlert"), "Quita uno para elegir otro.", { title: `Máximo ${MAX_INTERESTS} intereses`, tone: "warn" });
      return;
    }
    renderInterests();
    revalidate();
  });
  $("#dzPrompts").addEventListener("change", (e) => {
    const q = e.target.closest("[data-prompt-q]");
    if (!q) return;
    const input = $(`[data-prompt-a="${q.dataset.promptQ}"]`);
    input.disabled = !q.value;
    q.closest(".dz-prompt-edit").classList.toggle("is-filled", Boolean(q.value));
    if (q.value) input.focus();
  });
  $("#dzAbout").addEventListener("input", () => ($("#dzAboutCount").textContent = `${$("#dzAbout").value.length}/300`));
  $("#dzBirth").addEventListener("input", () => {
    renderBirthNote();
    revalidate();
  });
  $("#dzProvince").addEventListener("change", revalidate);

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
    if (error) return showError(error);
    if (wiz.step === 3) readPrompts();
    if (wiz.step < 4) showStep(wiz.step + 1);
    else save();
  });
}
