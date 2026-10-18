// Modales: cada .md-trigger abre el modal indicado en data-modal.
// Se cierran con el overlay, .md-close o .logout-close. Requiere classie.js.
(function () {
  const overlay = document.querySelector(".md-overlay");

  document.querySelectorAll(".md-trigger").forEach((trigger) => {
    const modal = document.getElementById(trigger.dataset.modal);
    if (!modal) return;

    const hasPerspective = classie.has(trigger, "md-setperspective");

    function closeModal(ev) {
      if (ev) ev.stopPropagation();
      classie.remove(modal, "md-show");
      if (hasPerspective) {
        classie.remove(document.documentElement, "md-perspective");
      }
    }

    trigger.addEventListener("click", () => {
      classie.add(modal, "md-show");
      overlay.removeEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);

      if (hasPerspective) {
        setTimeout(() => classie.add(document.documentElement, "md-perspective"), 25);
      }
    });

    modal.querySelectorAll(".md-close, .logout-close").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });
  });
})();
