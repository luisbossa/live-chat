// Utilidades compartidas por registro y dashboard.
// Se carga en <head> para aplicar el tema antes de pintar (sin parpadeo).
const Yabla = (() => {
  const THEME_KEY = "yabla:theme";
  const USER_KEY = "yabla:user";

  // localStorage puede no estar disponible (modo privado, bloqueos)
  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* sin persistencia: la app sigue funcionando */
    }
  }

  // --- Tema ---
  function getTheme() {
    const saved = read(THEME_KEY);
    if (saved) return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    write(THEME_KEY, theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }

  function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  document.documentElement.dataset.theme = getTheme();

  // --- Usuario (lo crea el registro, lo usa el dashboard) ---
  const DEFAULT_USER = {
    name: "Alex Rivera",
    username: "alex.rivera",
    bio: "Disponible para chatear ✨",
    phone: "+34 600 123 456",
    avatar: "/assets/images/avatars/avatar-male-1.jpg",
  };

  function getUser() {
    return { ...DEFAULT_USER, ...(read(USER_KEY) || {}) };
  }

  function saveUser(data) {
    write(USER_KEY, { ...getUser(), ...data });
  }

  function clearUser() {
    write(USER_KEY, null);
  }

  // Reduce una imagen a un dataURL pequeño para poder guardarla
  function resizeImage(file, size = 160) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const side = Math.min(img.width, img.height);
        canvas.width = canvas.height = size;
        canvas
          .getContext("2d")
          .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // --- Toast ---
  let toastTimer;
  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.append(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  // Icono del sprite como string HTML
  function icon(name, extra = "") {
    return `<svg class="icon ${extra}" aria-hidden="true"><use href="/assets/images/icons.svg#i-${name}"></use></svg>`;
  }

  return { getTheme, setTheme, toggleTheme, getUser, saveUser, clearUser, resizeImage, toast, icon };
})();
