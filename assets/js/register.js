const registerContainer = document.getElementById("registerContainer");
const onboardingContainer = document.getElementById("onboardingContainer");
const registerForm = document.getElementById("registerForm");
const onboardingForm = document.getElementById("onboardingForm");
const strength = document.getElementById("strength");
const themeToggle = document.getElementById("themeToggle");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/i;

let account = {};

// --- Tema ---
function syncThemeIcon() {
  const icon = Yabla.getTheme() === "dark" ? "sun" : "moon";
  themeToggle.querySelector("use").setAttribute("href", `/assets/images/icons.svg#i-${icon}`);
}
themeToggle.addEventListener("click", () => {
  Yabla.toggleTheme();
  syncThemeIcon();
});
syncThemeIcon();

// --- Mostrar/ocultar contraseña ---
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("use").setAttribute("href", `/assets/images/icons.svg#i-${show ? "eye-off" : "eye"}`);
    btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
  });
});

// --- Errores en línea ---
function setError(form, name, message) {
  const input = form.elements[name];
  const slot = form.querySelector(`[data-error-for="${name}"]`);
  input.classList.toggle("is-invalid", Boolean(message));
  slot.textContent = message || "";
}

function clearErrorOnInput(form) {
  form.addEventListener("input", (e) => {
    if (e.target.name) setError(form, e.target.name, "");
  });
}
clearErrorOnInput(registerForm);
clearErrorOnInput(onboardingForm);

// --- Seguridad de la contraseña (0-3) ---
function passwordLevel(value) {
  if (!value) return 0;
  let level = 1;
  if (value.length >= 6 && /\d/.test(value) && /[A-Za-z]/.test(value)) level = 2;
  if (level === 2 && value.length >= 10 && /[^A-Za-z0-9]|[A-Z]/.test(value)) level = 3;
  return level;
}

registerForm.elements.password.addEventListener("input", (e) => {
  strength.dataset.level = passwordLevel(e.target.value);
});

// --- Pasos ---
function goToStep(step) {
  const toProfile = step === 2;
  registerContainer.classList.toggle("is-active", !toProfile);
  onboardingContainer.classList.toggle("is-active", toProfile);
  document.getElementById("step1Dot").className = toProfile ? "is-done" : "is-active";
  document.getElementById("step2Dot").className = toProfile ? "is-active" : "";
  (toProfile ? onboardingForm.elements.username : registerForm.elements.name).focus();
}

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = registerForm.elements.name.value.trim();
  const email = registerForm.elements.email.value.trim();
  const password = registerForm.elements.password.value;

  const errors = {
    name: name.length < 2 ? "Ingresa tu nombre." : "",
    email: EMAIL_REGEX.test(email) ? "" : "Ingresa un correo electrónico válido.",
    password: PASSWORD_REGEX.test(password) ? "" : "Mínimo 6 caracteres, con al menos una letra y un número.",
  };

  Object.entries(errors).forEach(([field, message]) => setError(registerForm, field, message));
  const firstInvalid = Object.keys(errors).find((field) => errors[field]);
  if (firstInvalid) {
    registerForm.elements[firstInvalid].focus();
    return;
  }

  account = { name, email };
  // Sugerir un nombre de usuario a partir del nombre
  const usernameInput = onboardingForm.elements.username;
  if (!usernameInput.value) {
    usernameInput.value = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "")
      .slice(0, 20);
  }
  goToStep(2);
});

onboardingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = onboardingForm.elements.username.value.trim().replace(/^@/, "");
  if (!USERNAME_REGEX.test(username)) {
    setError(onboardingForm, "username", "De 3 a 20 caracteres: letras, números, punto o guion bajo.");
    onboardingForm.elements.username.focus();
    return;
  }

  const user = { ...account, username };
  const file = document.getElementById("imageUpload1").files[0];
  if (file) {
    try {
      user.avatar = await Yabla.resizeImage(file);
    } catch {
      /* se mantiene el avatar por defecto */
    }
  }

  Yabla.saveUser(user);
  window.location.href = "/pages/dashboard.html";
});

document.getElementById("backToRegister").addEventListener("click", () => goToStep(1));
