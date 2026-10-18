// Funciones disponibles en todas las vistas EJS.

/** Icono del sprite SVG: <%- icon('send') %> */
function icon(name, extraClass = "") {
  return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="/assets/images/icons.svg#i-${name}"></use></svg>`;
}

/** Serializa datos para un <script type="application/json"> sin romper el HTML. */
function json(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

module.exports = { icon, json, appName: "Yabla" };
