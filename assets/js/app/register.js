const registerContainer = document.getElementById("registerContainer");
const onboardingContainer = document.getElementById("onboardingContainer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// Mostrar/ocultar contraseña
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const target = document.getElementById(icon.dataset.target);
    const isHidden = target.type === "password";

    target.type = isHidden ? "text" : "password";
    icon.textContent = isHidden ? "visibility_off" : "visibility";
  });
});

// Devuelve el primer error de validación o null si todo es correcto
function validate({ name, email, password }) {
  if (!name) return "Por favor, ingresa tu nombre.";
  if (!EMAIL_REGEX.test(email)) return "Ingresa un correo electrónico válido.";
  if (!PASSWORD_REGEX.test(password)) {
    return "La contraseña debe tener al menos 6 caracteres, incluir una letra y un número.";
  }
  return null;
}

function showOnboarding() {
  registerContainer.classList.add("slide-out-left");

  setTimeout(() => {
    registerContainer.style.display = "none";
    onboardingContainer.style.display = "block";
    onboardingContainer.classList.remove("hidden");
    onboardingContainer.classList.add("fade-in-right-blur");
  }, 500);
}

function showRegister() {
  onboardingContainer.style.display = "none";
  registerContainer.style.display = "block";
  registerContainer.classList.remove("slide-out-left");
  registerContainer.classList.add("fade-in-left-blur");
}

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const error = validate({
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  });

  if (error) {
    alert(error);
    return;
  }
  showOnboarding();
});

document.getElementById("backToRegister").addEventListener("click", (e) => {
  e.preventDefault();
  showRegister();
});
