// Controles comunes de las pantallas de acceso: tema y mostrar contraseña.
(() => {
  const setIcon = (btn, name) => btn.querySelector("use").setAttribute("href", `/assets/images/icons.svg#i-${name}`);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const sync = () => setIcon(btn, Yabla.getTheme() === "dark" ? "sun" : "moon");
    btn.addEventListener("click", () => {
      Yabla.toggleTheme();
      sync();
    });
    sync();
  });

  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      setIcon(btn, show ? "eye-off" : "eye");
      btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });
})();
