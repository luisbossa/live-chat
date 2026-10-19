// Landing: acordeón y filtros de preguntas, aparición al hacer scroll y "Volver arriba".
(() => {
  const list = document.getElementById("faqList");
  if (!list) return;

  // --- Acordeón: una pregunta abierta a la vez --------------------------------
  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelector(".yl-q").setAttribute("aria-expanded", open);
  }

  list.addEventListener("click", (e) => {
    const q = e.target.closest(".yl-q");
    if (!q) return;
    const item = q.closest(".yl-item");
    const open = !item.classList.contains("is-open");
    list.querySelectorAll(".yl-item.is-open").forEach((other) => other !== item && setOpen(other, false));
    setOpen(item, open);
  });

  // --- Filtros por categoría ---------------------------------------------------
  document.querySelector(".yl-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-faq-filter]");
    if (!btn) return;
    const cat = btn.dataset.faqFilter;
    document.querySelectorAll("[data-faq-filter]").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    let first = null;
    list.querySelectorAll(".yl-item").forEach((item) => {
      const show = cat === "all" || item.dataset.cat === cat;
      item.hidden = !show;
      if (show) item.classList.add("is-visible"); // los filtrados no esperan al scroll
      if (show && !first) first = item;
    });
    // Se abre la primera pregunta de la categoría
    list.querySelectorAll(".yl-item.is-open").forEach((item) => setOpen(item, false));
    if (first) setOpen(first, true);
  });

  // --- Alto fijo de la lista: el footer no se mueve al filtrar ni al abrir ----
  // Se reserva el alto de "Todas" con la respuesta más larga abierta.
  const items = [...list.querySelectorAll(".yl-item")];
  function reserveHeight() {
    if (items.some((i) => i.hidden)) return; // solo se mide con todas visibles
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const questions = items.reduce((sum, i) => sum + i.querySelector(".yl-q").offsetHeight, 0);
    const tallest = Math.max(...items.map((i) => i.querySelector(".yl-a > div").scrollHeight));
    list.style.minHeight = `${Math.ceil(questions + gap * (items.length - 1) + tallest)}px`;
  }
  reserveHeight();
  document.fonts?.ready.then(reserveHeight);
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Al cambiar el ancho cambian los altos: se mide de nuevo (con todas visibles)
      const hidden = items.filter((i) => i.hidden);
      hidden.forEach((i) => (i.hidden = false));
      list.style.minHeight = "";
      reserveHeight();
      hidden.forEach((i) => (i.hidden = true));
    }, 150);
  });

  // --- Aparición al hacer scroll (con un pequeño escalonado) -----------------
  const reveal = document.querySelectorAll(".yl-reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    list.querySelectorAll(".yl-item").forEach((item, i) => item.style.setProperty("--delay", `${i * 0.06}s`));
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("is-visible"));
  }

  // --- Volver arriba ------------------------------------------------------------
  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
})();

// Llamadas alrededor del teléfono: la capa sigue la posición real de la sección de
// Framer (cambia según el ancho) y se anima cuando entra en pantalla.
(() => {
  const deco = document.getElementById("visualDeco");
  if (!deco) return;

  function place() {
    const visual = [...document.querySelectorAll('[data-framer-name="visual"]')].find((el) => el.offsetParent);
    if (!visual) return;
    const r = visual.getBoundingClientRect();
    deco.style.top = `${Math.round(r.top + scrollY)}px`;
    deco.style.left = `${Math.round(r.left + scrollX)}px`;
    deco.style.width = `${Math.round(r.width)}px`;
    deco.style.height = `${Math.round(r.height)}px`;
  }

  // Framer hidrata y coloca la sección un poco después de cargar
  [0, 400, 1200, 2500].forEach((ms) => setTimeout(place, ms));
  window.addEventListener("load", place);
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(place, 120);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        deco.classList.add("is-visible");
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(deco);
  } else {
    deco.classList.add("is-visible");
  }
})();
