// Registro en dos pasos. Se valida en el navegador y el servidor tiene la última palabra.
(() => {
  const form = document.getElementById("registerForm");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const strength = document.getElementById("strength");
  const alertBox = document.getElementById("formAlert");
  const submitBtn = document.getElementById("submitBtn");

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  const USERNAME = /^[a-z0-9_.]{3,20}$/i;
  const STEP1_FIELDS = ["name", "email", "password"];

  const field = (name) => form.elements[name];

  function setError(name, message) {
    field(name).classList.toggle("is-invalid", Boolean(message));
    form.querySelector(`[data-error-for="${name}"]`).textContent = message || "";
  }

  form.addEventListener("input", (e) => {
    if (e.target.name) setError(e.target.name, "");
    alertBox.hidden = true;
  });

  // Seguridad de la contraseña (0-3)
  field("password").addEventListener("input", (e) => {
    const v = e.target.value;
    let level = v ? 1 : 0;
    if (PASSWORD.test(v)) level = 2;
    if (level === 2 && v.length >= 10 && /[^A-Za-z0-9]|[A-Z]/.test(v)) level = 3;
    strength.dataset.level = level;
  });

  function goToStep(n) {
    step1.classList.toggle("is-active", n === 1);
    step2.classList.toggle("is-active", n === 2);
    document.getElementById("step1Dot").className = n === 2 ? "is-done" : "is-active";
    document.getElementById("step2Dot").className = n === 2 ? "is-active" : "";
    field(n === 2 ? "username" : "name").focus();
  }

  function validateStep1() {
    const errors = {
      name: field("name").value.trim().length < 2 ? "Ingresa tu nombre." : "",
      email: EMAIL.test(field("email").value.trim()) ? "" : "Ingresa un correo electrónico válido.",
      password: PASSWORD.test(field("password").value) ? "" : "Mínimo 6 caracteres, con al menos una letra y un número.",
    };
    Object.entries(errors).forEach(([name, msg]) => setError(name, msg));
    const first = STEP1_FIELDS.find((name) => errors[name]);
    if (first) field(first).focus();
    return !first;
  }

  function suggestUsername() {
    if (field("username").value) return;
    field("username").value = field("name").value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "")
      .slice(0, 20);
    checkUsername();
  }

  // Disponibilidad del nombre de usuario mientras se escribe
  let checkTimer;
  function checkUsername() {
    clearTimeout(checkTimer);
    const username = field("username").value.trim().replace(/^@/, "");
    if (!USERNAME.test(username)) return;
    checkTimer = setTimeout(async () => {
      try {
        const { available } = await Yabla.request(`/api/username-available?username=${encodeURIComponent(username)}`);
        if (!available) setError("username", "Este nombre de usuario ya está en uso.");
      } catch {
        /* se valida de nuevo al enviar */
      }
    }, 350);
  }

  field("username").addEventListener("input", checkUsername);

  document.getElementById("toStep2").addEventListener("click", () => {
    if (!validateStep1()) return;
    suggestUsername();
    goToStep(2);
  });

  // Enter en el paso 1 avanza en lugar de enviar
  step1.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("toStep2").click();
    }
  });

  document.getElementById("backToStep1").addEventListener("click", () => goToStep(1));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = field("username").value.trim().replace(/^@/, "");
    if (!USERNAME.test(username)) {
      setError("username", "De 3 a 20 caracteres: letras, números, punto o guion bajo.");
      return field("username").focus();
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta…";
    try {
      const { redirect } = await Yabla.request("/register", { method: "POST", body: new FormData(form) });
      window.location.href = redirect;
    } catch (err) {
      const errors = err.data?.errors || {};
      Object.entries(errors).forEach(([name, msg]) => setError(name, msg));
      if (STEP1_FIELDS.some((name) => errors[name])) goToStep(1);
      alertBox.textContent = err.message;
      alertBox.hidden = Object.keys(errors).length > 0;
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar al chat";
    }
  });
})();
