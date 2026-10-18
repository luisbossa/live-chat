// Utilidades compartidas. Se carga en <head> para aplicar el tema antes de pintar.
const Yabla = (() => {
  const THEME_KEY = "yabla:theme";

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* sin persistencia: la app sigue funcionando */
    }
  }

  // --- Tema ---
  function getTheme() {
    return read(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    write(THEME_KEY, theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }

  const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

  document.documentElement.dataset.theme = getTheme();

  // --- Apariencia (color, fondo del chat y tamaño del texto) ---
  // Se aplica aquí, antes de pintar, para que no parpadee al cargar.
  const APPEARANCE = { accent: "blue", wallpaper: "dots", textSize: "md" };

  function getAppearance(key) {
    return read(`yabla:${key}`) || APPEARANCE[key];
  }

  function setAppearance(key, value) {
    document.documentElement.dataset[key] = value;
    write(`yabla:${key}`, value);
  }

  Object.keys(APPEARANCE).forEach((key) => (document.documentElement.dataset[key] = getAppearance(key)));

  // --- Peticiones al backend ---
  /** fetch con JSON o FormData. Lanza un Error con .status y .data si la respuesta no es 2xx. */
  async function request(url, { method = "GET", body } = {}) {
    const options = { method, headers: { Accept: "application/json" }, credentials: "same-origin" };
    if (body instanceof FormData) options.body = body;
    else if (body !== undefined) {
      options.body = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && !url.includes("/login")) window.location.href = "/";
      throw Object.assign(new Error(data.error || "No se pudo completar la acción."), { status: res.status, data });
    }
    return data;
  }

  // --- Toast ---
  // Icono por defecto de cada tipo de aviso
  const TOAST_ICONS = { success: "check", error: "alert", info: "info" };
  let toastTimer;

  /**
   * Aviso en la parte inferior, con icono SVG (sin emojis).
   * toast("Perfil actualizado", { tone: "success" })
   * toast("Saldo insuficiente", { tone: "error" })
   * toast("Chat fijado", { icon: "pin" })
   * toast("Karla: hola", { avatar: "/foto.jpg", title: "Karla" })  // mensaje nuevo
   */
  function toast(message, { tone = "info", icon: iconName, avatar, title, duration = 2800 } = {}) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = Object.assign(document.createElement("div"), { className: "toast" });
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.append(el);
    }
    el.className = `toast is-${tone}${avatar ? " has-avatar" : ""}`;
    el.replaceChildren();

    if (avatar) {
      const img = Object.assign(document.createElement("img"), { className: "toast-avatar", src: avatar, alt: "" });
      el.append(img);
    } else {
      const badge = Object.assign(document.createElement("span"), { className: "toast-icon" });
      badge.innerHTML = icon(iconName || TOAST_ICONS[tone] || "info");
      el.append(badge);
    }

    const body = Object.assign(document.createElement("span"), { className: "toast-body" });
    if (title) body.append(Object.assign(document.createElement("strong"), { textContent: title }));
    body.append(Object.assign(document.createElement("span"), { textContent: message }));
    el.append(body);

    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), duration);
  }

  /** Icono del sprite como HTML. */
  function icon(name, extra = "") {
    return `<svg class="icon ${extra}" aria-hidden="true"><use href="/assets/images/icons.svg#i-${name}"></use></svg>`;
  }

  return { getTheme, setTheme, toggleTheme, getAppearance, setAppearance, request, toast, icon };
})();
