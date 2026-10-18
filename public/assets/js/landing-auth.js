// Conecta el formulario de login de la landing (generado por Framer) con el backend.
// Framer vuelve a pintar el formulario al hidratar, por eso se escucha en el documento.
(() => {
  const visible = (el) => el && el.offsetParent !== null;

  function fields() {
    const pick = (name) => [...document.querySelectorAll(`input[name="${name}"]`)].find(visible);
    return { email: pick("Email"), password: pick("Password") };
  }

  // Mensaje de error bajo el formulario
  function showError(message) {
    let box = document.getElementById("landingAuthError");
    if (!box) {
      box = Object.assign(document.createElement("p"), { id: "landingAuthError" });
      box.setAttribute("role", "alert");
      Object.assign(box.style, {
        position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)", zIndex: 1000,
        margin: 0, padding: "12px 20px", borderRadius: "999px", background: "#262424", color: "#fff",
        font: "500 14px Inter, system-ui, sans-serif", boxShadow: "0 12px 32px rgba(0,0,0,.2)", maxWidth: "calc(100% - 32px)",
      });
      document.body.append(box);
    }
    box.textContent = message;
    box.hidden = false;
    clearTimeout(showError.timer);
    showError.timer = setTimeout(() => (box.hidden = true), 3500);
  }

  let sending = false;
  async function login(e) {
    e.preventDefault();
    e.stopPropagation();
    if (sending) return;

    const { email, password } = fields();
    if (!email?.value.trim() || !password?.value) return showError("Escribe tu correo y tu contraseña.");

    sending = true;
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value,
          next: new URLSearchParams(location.search).get("next") || "/chat",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión.");
      location.href = data.redirect || "/chat";
    } catch (err) {
      showError(err.message);
    } finally {
      sending = false;
    }
  }

  // Clic en el botón "Login" (es un enlace dentro del botón de Framer)
  document.addEventListener("click", (e) => {
    if (e.target.closest('form a[href="/chat"], form button')) login(e);
  }, true);

  // Enter dentro de los campos
  document.addEventListener("submit", (e) => {
    if (e.target.closest("form")) login(e);
  }, true);
})();
