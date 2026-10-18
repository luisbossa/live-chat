// Registro en un solo paso, sin correo: nombre, usuario y contraseña.
// Se valida en el navegador y el servidor tiene la última palabra.
(() => {
  const form = document.getElementById("registerForm");
  const alertBox = document.getElementById("formAlert");
  const submitBtn = document.getElementById("submitBtn");
  const status = document.getElementById("usernameStatus");
  const ideas = document.getElementById("usernameIdeas");
  const USERNAME = /^[a-z0-9_.]{3,20}$/;
  const field = (name) => form.elements[name];
  const icon = (name) => Yabla.icon(name, "icon-sm");

  let usernameEdited = false; // si el usuario lo escribió a mano, ya no se sugiere desde el nombre
  let usernameOk = null; // null = sin comprobar, true / false

  function setError(name, message) {
    field(name).classList.toggle("is-invalid", Boolean(message));
    form.querySelector(`[data-error-for="${name}"]`).textContent = message || "";
  }

  // --- Vista previa en vivo -------------------------------------------------
  const preview = {
    name: document.getElementById("previewName"),
    user: document.getElementById("previewUser"),
    first: document.getElementById("previewFirst"),
    avatar: document.getElementById("previewAvatar"),
  };

  function updatePreview() {
    const name = field("name").value.trim();
    const username = field("username").value.trim();
    preview.name.textContent = name || "Tu nombre";
    preview.first.textContent = name.split(" ")[0] || "amigo";
    preview.user.textContent = `@${username || "tu_usuario"}`;
  }

  field("avatar").addEventListener("change", () => {
    const file = field("avatar").files[0];
    if (file) preview.avatar.src = URL.createObjectURL(file);
  });

  // --- Nombre de usuario ----------------------------------------------------
  const slug = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .slice(0, 20);

  function setStatus(state, text = "") {
    status.dataset.state = state;
    status.innerHTML = { checking: '<span class="spinner"></span>', ok: icon("check"), taken: icon("x"), invalid: icon("alert") }[state] || "";
    status.title = text;
    document.getElementById("usernameHint").textContent = text || "Con él entrarás y te encontrarán tus amigos.";
    document.getElementById("usernameHint").dataset.state = state;
  }

  let checkTimer;
  let checkSeq = 0;
  function checkUsername() {
    clearTimeout(checkTimer);
    ideas.hidden = true;
    usernameOk = null;
    const username = field("username").value.trim().replace(/^@/, "").toLowerCase();
    if (!username) return setStatus("");
    if (!USERNAME.test(username)) {
      usernameOk = false;
      return setStatus("invalid", username.length < 3 ? "Mínimo 3 caracteres." : "Solo letras, números, punto o guion bajo.");
    }
    setStatus("checking", "Comprobando…");
    const seq = ++checkSeq;
    checkTimer = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ username, name: field("name").value.trim() });
        const { available, suggestions } = await Yabla.request(`/api/username-available?${q}`);
        if (seq !== checkSeq) return; // llegó tarde una respuesta antigua
        usernameOk = available;
        if (available) return setStatus("ok", `¡@${username} está libre!`);
        setStatus("taken", `@${username} ya está en uso. Prueba con:`);
        ideas.innerHTML = suggestions.map((s) => `<button type="button" class="chip" data-idea="${s}">@${s}</button>`).join("");
        ideas.hidden = !suggestions.length;
      } catch {
        if (seq === checkSeq) setStatus("");
      }
    }, 300);
  }

  ideas.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-idea]");
    if (!btn) return;
    field("username").value = btn.dataset.idea;
    usernameEdited = true;
    setError("username", "");
    updatePreview();
    checkUsername();
  });

  field("name").addEventListener("input", () => {
    // Propone un usuario a partir del nombre mientras no se haya escrito uno a mano
    if (!usernameEdited) {
      field("username").value = slug(field("name").value);
      checkUsername();
    }
    updatePreview();
  });

  field("username").addEventListener("input", () => {
    // Solo minúsculas, números, punto y guion bajo (como en la app)
    const el = field("username");
    const clean = el.value.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_.]/g, "");
    if (clean !== el.value) el.value = clean;
    usernameEdited = Boolean(clean);
    updatePreview();
    checkUsername();
  });

  // --- Contraseña -----------------------------------------------------------
  const STRENGTH = ["Usa al menos 6 caracteres.", "Aceptable. Más larga es más segura.", "Buena contraseña.", "¡Contraseña fuerte!"];
  field("password").addEventListener("input", (e) => {
    const v = e.target.value;
    let level = 0;
    if (v.length >= 6) level = 1;
    if (v.length >= 8 && /\d/.test(v) && /[a-z]/i.test(v)) level = 2;
    if (v.length >= 10 && /\d/.test(v) && /[A-Z]/.test(v) && /[^A-Za-z0-9]/.test(v)) level = 3;
    document.getElementById("strength").dataset.level = v ? Math.max(level, 0) : 0;
    document.getElementById("strength").classList.toggle("is-short", Boolean(v) && v.length < 6);
    document.getElementById("strengthLabel").textContent = v && v.length < 6 ? `Faltan ${6 - v.length} caracteres.` : STRENGTH[level];
  });

  form.addEventListener("input", (e) => {
    if (e.target.name && e.target.name !== "avatar") setError(e.target.name, "");
    alertBox.hidden = true;
  });

  // --- Enviar -----------------------------------------------------------------
  function validate() {
    const username = field("username").value.trim();
    const errors = {
      name: field("name").value.trim().length < 2 ? "Escribe tu nombre." : "",
      // Si está ocupado, la pista con sugerencias ya lo dice: no se repite
      username: !USERNAME.test(username) ? "De 3 a 20 caracteres: letras, números, punto o guion bajo." : "",
      password: field("password").value.length < 6 ? "La contraseña necesita al menos 6 caracteres." : "",
    };
    Object.entries(errors).forEach(([name, msg]) => setError(name, msg));
    const first = ["name", "username", "password"].find((name) => errors[name]) || (usernameOk === false ? "username" : null);
    if (first) field(first).focus();
    return !first;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    submitBtn.querySelector(".label-text").textContent = loading ? "Creando tu cuenta…" : "Crear cuenta";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { redirect } = await Yabla.request("/register", { method: "POST", body: new FormData(form) });
      submitBtn.querySelector(".label-text").textContent = "¡Listo! Entrando…";
      window.location.href = redirect;
    } catch (err) {
      const errors = err.data?.errors || {};
      Object.entries(errors).forEach(([name, msg]) => setError(name, msg));
      if (errors.username) checkUsername();
      alertBox.textContent = err.message;
      alertBox.hidden = Object.keys(errors).length > 0;
      setLoading(false);
    }
  });

  field("name").focus();
})();
