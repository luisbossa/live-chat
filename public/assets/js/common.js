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
  let toastTimer;
  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = Object.assign(document.createElement("div"), { className: "toast" });
      el.setAttribute("role", "status");
      document.body.append(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  }

  /** Icono del sprite como HTML. */
  function icon(name, extra = "") {
    return `<svg class="icon ${extra}" aria-hidden="true"><use href="/assets/images/icons.svg#i-${name}"></use></svg>`;
  }

  return { getTheme, setTheme, toggleTheme, request, toast, icon };
})();
