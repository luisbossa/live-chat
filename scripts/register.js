// Mostrar/Ocultar contraseña
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const target = document.getElementById(icon.dataset.target);
    const isHidden = target.type === "password";

    target.type = isHidden ? "text" : "password";
    icon.textContent = isHidden ? "visibility_off" : "visibility";
  });
});

// Validaciones + transición al onboarding
document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (name.length === 0) {
      alert("Por favor, ingresa tu nombre.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "La contraseña debe tener al menos 6 caracteres, incluir una letra y un número."
      );
      return;
    }

    const registerContainer = document.getElementById("registerContainer");
    const onboardingContainer = document.getElementById("onboardingContainer");

    registerContainer.classList.add("slide-out-left");

    setTimeout(() => {
      registerContainer.style.display = "none";
      onboardingContainer.style.display = "block";
      onboardingContainer.classList.remove("hidden");
      onboardingContainer.classList.add("fade-in-right-blur");
    }, 500);
  });

// Volver al registro desde onboarding
document
  .getElementById("backToRegister")
  .addEventListener("click", function (e) {
    e.preventDefault();

    const registerContainer = document.getElementById("registerContainer");
    const onboardingContainer = document.getElementById("onboardingContainer");

    onboardingContainer.style.display = "none";
    registerContainer.style.display = "block";
    registerContainer.classList.remove("slide-out-left");
    registerContainer.classList.add("fade-in-left-blur");
  });
