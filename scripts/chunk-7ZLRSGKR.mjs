import {
  Ba as V,
  Da as C,
  Ia as L,
  J as y,
  Ka as k,
  R as v,
  U as w,
  X as l,
  _ as R,
  b as d,
  e as p,
  ha as S,
  j as h,
  l as b,
  n as g,
  o as u,
  s as o,
  v as f,
  w as s,
  x,
} from "./chunk-TLFILSQI.mjs";
var j = ["R9mZ0VH2f", "JfsBUuEvR"],
  G = "framer-VSirs",
  I = { JfsBUuEvR: "framer-v-1hc0h5", R9mZ0VH2f: "framer-v-ztdeh6" };
function X(r, ...t) {
  let a = {};
  return t?.forEach((e) => e && Object.assign(a, r[e])), a;
}
var Q = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: "spring" },
  T = ({ value: r, children: t }) => {
    let a = h(f),
      e = r ?? a.transition,
      n = g(() => ({ ...a, transition: e }), [JSON.stringify(e)]);
    return o(f.Provider, { value: n, children: t });
  },
  K = s.create(d),
  O = { Desktop: "R9mZ0VH2f", Mobile: "JfsBUuEvR" },
  A = ({ height: r, id: t, width: a, ...e }) => ({
    ...e,
    variant: O[e.variant] ?? e.variant ?? "R9mZ0VH2f",
  }),
  q = (r, t) =>
    r.layoutDependency ? t.join("-") + r.layoutDependency : t.join("-"),
  W = p(function (r, t) {
    let a = u(null),
      e = t ?? a,
      n = b(),
      { activeLocale: $, setLocale: ee } = y(),
      re = S(),
      { style: M, className: _, layoutId: H, variant: P, ...F } = A(r),
      {
        baseVariant: B,
        classNames: D,
        clearLoadingGesture: te,
        gestureHandlers: E,
        gestureVariant: N,
        isLoading: ae,
        setGestureState: oe,
        setVariant: ie,
        variants: m,
      } = V({
        cycleOrder: j,
        defaultVariant: "R9mZ0VH2f",
        ref: e,
        variant: P,
        variantClassNames: I,
      }),
      c = q(r, m),
      U = l(G, ...[]);
    return o(x, {
      id: H ?? n,
      children: o(K, {
        animate: m,
        initial: !1,
        children: o(T, {
          value: Q,
          children: o(s.div, {
            ...F,
            ...E,
            className: l(U, "framer-ztdeh6", _, D),
            "data-border": !0,
            "data-framer-name": "Desktop",
            layoutDependency: c,
            layoutId: "R9mZ0VH2f",
            ref: e,
            style: {
              background:
                "#232323",
              borderRadius: 15,
              ...M,
            },
            variants: {
              JfsBUuEvR: {
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            },
            ...X({ JfsBUuEvR: { "data-framer-name": "Mobile" } }, B, N),
            children: o("img", {
              src: "/images/logo.png",
              alt: "Logo",
              className: "framer-kek428",
              style: {
                width: 37,
                height: 46,
                objectFit: "contain",
              },
            }),
          }),
        }),
      }),
    });
  }),
  Y = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-VSirs.framer-ew56j, .framer-VSirs .framer-ew56j { display: block; }",
    ".framer-VSirs.framer-ztdeh6 { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 6px; height: 80px; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 80px; will-change: var(--framer-will-change-override, transform); }",
    ".framer-VSirs .framer-kek428 { aspect-ratio: 0.8043478260869565 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 46px); position: relative; width: 37px; }",
    "@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-VSirs.framer-ztdeh6 { gap: 0px; } .framer-VSirs.framer-ztdeh6 > * { margin: 0px; margin-left: calc(6px / 2); margin-right: calc(6px / 2); } .framer-VSirs.framer-ztdeh6 > :first-child { margin-left: 0px; } .framer-VSirs.framer-ztdeh6 > :last-child { margin-right: 0px; } }",
    ".framer-VSirs.framer-v-1hc0h5.framer-ztdeh6 { height: 70px; width: 70px; }",
    ".framer-VSirs.framer-v-1hc0h5 .framer-kek428 { height: var(--framer-aspect-ratio-supported, 35px); width: 28px; }",
    '.framer-VSirs[data-border="true"]::after, .framer-VSirs [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  ],
  i = R(W, Y, "framer-VSirs"),
  de = i;
i.displayName = "Elements/Logo";
i.defaultProps = { height: 80, width: 80 };
w(i, {
  variant: {
    options: ["R9mZ0VH2f", "JfsBUuEvR"],
    optionTitles: ["Desktop", "Mobile"],
    title: "Variant",
    type: v.Enum,
  },
});
k(i, [{ explicitInter: !0, fonts: [] }], { supportsExplicitInterCodegen: !0 });
C.loadFonts([
  "GF;Roboto Serif-regular",
  "GF;Roboto Serif-700",
  "GF;Roboto Serif-700italic",
  "GF;Roboto Serif-italic",
]);
var ge = [
    {
      explicitInter: !0,
      fonts: [
        {
          family: "Roboto Serif",
          source: "google",
          style: "normal",
          url: "https://fonts.gstatic.com/s/robotoserif/v15/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEliotp6J2Af5fR4k.woff2",
          weight: "400",
        },
        {
          family: "Roboto Serif",
          source: "google",
          style: "normal",
          url: "https://fonts.gstatic.com/s/robotoserif/v15/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEls0qp6J2Af5fR4k.woff2",
          weight: "700",
        },
        {
          family: "Roboto Serif",
          source: "google",
          style: "italic",
          url: "https://fonts.gstatic.com/s/robotoserif/v15/R71XjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbDJ69BcVZxkDg-JuqON8ANxaV4nUFw.woff2",
          weight: "700",
        },
        {
          family: "Roboto Serif",
          source: "google",
          style: "italic",
          url: "https://fonts.gstatic.com/s/robotoserif/v15/R71XjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbDJ69BcVZxkDg-JuT-R8ANxaV4nUFw.woff2",
          weight: "400",
        },
      ],
    },
  ],
  ue = [
    '.framer-eHv9M .framer-styles-preset-6a1mvc:not(.rich-text-wrapper), .framer-eHv9M .framer-styles-preset-6a1mvc.rich-text-wrapper h1 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 48px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 0px; --framer-text-alignment: center; --framer-text-color: var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, #262424); --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; }',
    '@media (max-width: 1279px) and (min-width: 810px) { .framer-eHv9M .framer-styles-preset-6a1mvc:not(.rich-text-wrapper), .framer-eHv9M .framer-styles-preset-6a1mvc.rich-text-wrapper h1 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 44px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 0px; --framer-text-alignment: center; --framer-text-color: var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, #262424); --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; } }',
    '@media (max-width: 809px) and (min-width: 0px) { .framer-eHv9M .framer-styles-preset-6a1mvc:not(.rich-text-wrapper), .framer-eHv9M .framer-styles-preset-6a1mvc.rich-text-wrapper h1 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 40px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 0px; --framer-text-alignment: center; --framer-text-color: var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, #262424); --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; } }',
  ],
  xe = "framer-eHv9M";
export { de as a, ge as b, ue as c, xe as d };
