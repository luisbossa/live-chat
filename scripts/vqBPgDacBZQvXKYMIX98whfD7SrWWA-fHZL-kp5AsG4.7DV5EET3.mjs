import { a as U } from "./chunk-EBD6YRSR.mjs";
import {
  a as z,
  b as O,
  c as T,
  d as _,
  e as ae,
  f as ie,
  g as ne,
} from "./chunk-PFBTP23P.mjs";
import { a as k, b as ee, c as te, d as re } from "./chunk-7ZLRSGKR.mjs";
import { a as Z, b as $, c as M } from "./chunk-NT3OEFHM.mjs";
import "./chunk-V5T3UH2U.mjs";
import {
  $ as r,
  Fa as g,
  Ga as y,
  J as X,
  Ja as a,
  Ka as J,
  La as c,
  Ma as v,
  X as W,
  Y as D,
  _ as A,
  b as f,
  ba as x,
  e as C,
  fa as H,
  ha as R,
  ia as m,
  ja as h,
  k as S,
  l as K,
  la as B,
  m as N,
  o as V,
  qa as L,
  r as Y,
  s as e,
  sa as P,
  t as n,
  w as u,
  x as q,
  xa as G,
} from "./chunk-TLFILSQI.mjs";
import "./chunk-HZL4YIMB.mjs";
import "./chunk-NIFHVMGF.mjs";
import "./chunk-A3IIQ6X3.mjs";
var ye = c(k),
  oe = x(h),
  ve = c(T),
  Fe = x(P),
  be = c(O),
  We = c(_),
  He = H(u.div),
  ke = x(u.div),
  se = H(y),
  ze = c(z),
  Oe = {
    ju7O5f4HW: "(max-width: 809px)",
    WQLkyLRf1: "(min-width: 1280px)",
    YEydZTQhG: "(min-width: 810px) and (max-width: 1279px)",
  };
var Te = "framer-WoFHi",
  _e = {
    ju7O5f4HW: "framer-v-l726qg",
    WQLkyLRf1: "framer-v-72rtr7",
    YEydZTQhG: "framer-v-1i1d3zf",
  },
  Ue = { delay: 0, duration: 0.3, ease: [0.44, 0, 0.56, 1], type: "tween" },
  Ee = {
    opacity: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transition: Ue,
    x: 0,
    y: 0,
  },
  F = {
    opacity: 0.001,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    x: 0,
    y: 10,
  },
  le = { opacity: 0.001, rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 10 },
  pe = { damping: 40, delay: 0.075, mass: 1, stiffness: 400, type: "spring" },
  Qe = {
    effect: le,
    repeat: !1,
    startDelay: 0.1,
    tokenization: "line",
    transition: pe,
    trigger: "onMount",
    type: "appear",
  },
  Ie = {
    effect: le,
    repeat: !1,
    startDelay: 0.2,
    tokenization: "line",
    transition: pe,
    trigger: "onMount",
    type: "appear",
  },
  je = { damping: 30, delay: 0.3, mass: 1, stiffness: 400, type: "spring" },
  E = {
    opacity: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transition: je,
    x: 0,
    y: 0,
  },
  Ce = { delay: 0, duration: 2, ease: [0.44, 0, 0.56, 1], type: "tween" },
  Se = {
    opacity: 1,
    rotate: -1,
    rotateX: 0,
    rotateY: 0,
    scale: 1.05,
    skewX: -1,
    skewY: 1,
    x: 0,
    y: 20,
  },
  Q = (l, p) => `translateX(-50%) ${p}`,
  me = {
    opacity: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    x: 0,
    y: 30,
  },
  I = { delay: 0.2, duration: 1.5, ease: [0.35, 0, 0, 1], type: "tween" },
  ce = {
    opacity: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transition: I,
    x: 0,
    y: 30,
  },
  Ke = ({ value: l }) =>
    L()
      ? null
      : e("style", {
          dangerouslySetInnerHTML: { __html: l },
          "data-framer-html-style": "",
        }),
  Ne = { Desktop: "WQLkyLRf1", Phone: "ju7O5f4HW", Tablet: "YEydZTQhG" },
  Ve = ({ height: l, id: p, width: j, ...d }) => ({
    ...d,
    variant: Ne[d.variant] ?? d.variant ?? "WQLkyLRf1",
  }),
  Ye = C(function (l, p) {
    let j = V(null),
      d = p ?? j,
      de = K(),
      { activeLocale: w, setLocale: Xe } = X(),
      t = R(),
      { style: fe, className: he, layoutId: ge, variant: we, ...ue } = Ve(l);
    S(() => {
      let o = U(void 0, w);
      if (o.robots) {
        let s = document.querySelector('meta[name="robots"]');
        s
          ? s.setAttribute("content", o.robots)
          : ((s = document.createElement("meta")),
            s.setAttribute("name", "robots"),
            s.setAttribute("content", o.robots),
            document.head.appendChild(s));
      }
    }, [void 0, w]),
      N(() => {
        let o = U(void 0, w);
        (document.title = o.title || ""),
          o.viewport &&
            document
              .querySelector('meta[name="viewport"]')
              ?.setAttribute("content", o.viewport);
      }, [void 0, w]);
    let [i, De] = G(we, Oe, !1),
      Ae = void 0,
      xe = W(Te, ...[re, M, ne]);
    return (
      B({}),
      e(D.Provider, {
        value: { primaryVariantId: "WQLkyLRf1", variantClassNames: _e },
        children: n(q, {
          id: ge ?? de,
          children: [
            e(Ke, {
              value:
                "html body { background: var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255)); }",
            }),
            e(u.div, {
              ...ue,
              className: W(xe, "framer-72rtr7", he),
              ref: d,
              style: { ...fe },
              children: n("div", {
                className: "framer-lie5fr",
                "data-framer-name": "main",
                children: [
                  e("div", {
                    className: "framer-1z0jr85",
                    "data-framer-name": "hero",
                    children: n("div", {
                      className: "framer-1glv93a",
                      "data-framer-name": "container",
                      children: [
                        n("div", {
                          className: "framer-1yq745y",
                          "data-framer-name": "content",
                          children: [
                            e(r, {
                              breakpoint: i,
                              overrides: {
                                ju7O5f4HW: { height: 70, width: "70px" },
                              },
                              children: e(m, {
                                height: 80,
                                width: "80px",
                                y:
                                  (t?.y || 0) +
                                  0 +
                                  0 +
                                  0 +
                                  0 +
                                  100 +
                                  0 +
                                  0 +
                                  0 +
                                  0 +
                                  0,
                                children: e(oe, {
                                  animate: Ee,
                                  className: "framer-f8udkx-container",
                                  "data-framer-appear-id": "f8udkx",
                                  initial: F,
                                  nodeId: "n5VUOCprp",
                                  optimized: !0,
                                  rendersWithMotion: !0,
                                  scopeId: "augiA20Il",
                                  children: e(r, {
                                    breakpoint: i,
                                    overrides: {
                                      ju7O5f4HW: { variant: "JfsBUuEvR" },
                                    },
                                    children: e(k, {
                                      height: "100%",
                                      id: "n5VUOCprp",
                                      layoutId: "n5VUOCprp",
                                      style: { height: "100%", width: "100%" },
                                      variant: "R9mZ0VH2f",
                                      width: "100%",
                                    }),
                                  }),
                                }),
                              }),
                            }),
                            n("div", {
                              className: "framer-1y4isff",
                              "data-framer-name": "header",
                              children: [
                                e(y, {
                                  __fromCanvasComponent: !0,
                                  children: e(f, {
                                    children: e("h1", {
                                      className: "framer-styles-preset-6a1mvc",
                                      "data-styles-preset": "oHqN56mWG",
                                      children: "Bienvenido a YABLA",
                                    }),
                                  }),
                                  className: "framer-rpfyn7",
                                  "data-framer-name": "Get early access",
                                  effect: Qe,
                                  fonts: ["Inter"],
                                  verticalAlignment: "top",
                                  withExternalLayout: !0,
                                }),
                                e(y, {
                                  __fromCanvasComponent: !0,
                                  children: e(f, {
                                    children: e("p", {
                                      className: "framer-styles-preset-1qnc6s4",
                                      "data-styles-preset": "NTWwFC9H4",
                                      children:
                                        "Únete ahora y sé de los primeros en probar una nueva forma de chatear.",
                                    }),
                                  }),
                                  className: "framer-1c0bgws",
                                  "data-framer-name":
                                    "Únete ahora y sé de los primeros en probar una nueva forma de chatear.",
                                  effect: Ie,
                                  fonts: ["Inter"],
                                  verticalAlignment: "top",
                                  withExternalLayout: !0,
                                }),
                              ],
                            }),
                            e(Fe, {
                              action:
                                "https://api.framer.com/forms/v1/forms/3dec7d1e-d62a-43df-a4bd-e3d78a64bd6f/submit",
                              animate: E,
                              className: "framer-17960rj",
                              "data-framer-appear-id": "17960rj",
                              initial: F,
                              nodeId: "GOU6pZNpl",
                              optimized: !0,
                              redirectUrl: { webPageId: "yJ6en6Tq4" },
                              children: (o) =>
                                e(Y, {
                                  children: e(r, {
                                    breakpoint: i,
                                    overrides: {
                                      ju7O5f4HW: {
                                        width: `min(min(min(${
                                          t?.width || "100vw"
                                        } - 32px, 1280px), 787px), 448px)`,
                                        y:
                                          (t?.y || 0) +
                                          0 +
                                          0 +
                                          0 +
                                          0 +
                                          100 +
                                          0 +
                                          0 +
                                          0 +
                                          0 +
                                          640.4 +
                                          0 +
                                          0,
                                      },
                                    },
                                    children: e(m, {
                                      height: 64,
                                      width: `min(min(min(${
                                        t?.width || "100vw"
                                      } - 64px, 1280px), 787px), 448px)`,
                                      y:
                                        (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        338.4 +
                                        0 +
                                        0,
                                      children: e(h, {
                                        className: "framer-1boj8rg-container",
                                        nodeId: "u9ZtGCP5x",
                                        scopeId: "augiA20Il",
                                        children: e(r, {
                                          breakpoint: i,
                                          overrides: {
                                            ju7O5f4HW: { variant: "FiuSO6vJp" },
                                          },
                                          children: e(T, {
                                            height: "100%",
                                            id: "u9ZtGCP5x",
                                            layoutId: "u9ZtGCP5x",
                                            style: { width: "100%" },
                                            variant: "z7ElXOW4X",
                                            width: "100%",
                                          }),
                                        }),
                                      }),
                                    }),
                                  }),
                                }),
                            }),
                            e(r, {
                              breakpoint: i,
                              overrides: {
                                ju7O5f4HW: {
                                  width: `min(min(${
                                    t?.width || "100vw"
                                  } - 32px, 1280px), 787px)`,
                                  y:
                                    (t?.y || 0) +
                                    0 +
                                    0 +
                                    0 +
                                    0 +
                                    100 +
                                    0 +
                                    0 +
                                    0 +
                                    0 +
                                    328.4,
                                },
                              },
                              children: e(m, {
                                height: 48,
                                width: `min(min(${
                                  t?.width || "100vw"
                                } - 64px, 1280px), 787px)`,
                                y:
                                  (t?.y || 0) +
                                  0 +
                                  0 +
                                  0 +
                                  0 +
                                  100 +
                                  0 +
                                  0 +
                                  0 +
                                  0 +
                                  434.4,
                                children: e(h, {
                                  className: "framer-4h9ri7-container",
                                  nodeId: "npV74YEqb",
                                  scopeId: "augiA20Il",
                                  children: e(r, {
                                    breakpoint: i,
                                    overrides: {
                                      ju7O5f4HW: { variant: "TOU6uSL6s" },
                                    },
                                    children: e(O, {
                                      c9wupuW39: 1e3,
                                      dMyTCzIRw: 5e3,
                                      height: "100%",
                                      id: "npV74YEqb",
                                      layoutId: "npV74YEqb",
                                      style: { width: "100%" },
                                      variant: "xQGkPnBpb",
                                      width: "100%",
                                    }),
                                  }),
                                }),
                              }),
                            }),
                          ],
                        }),
                        n(ke, {
                          animate: E,
                          className: "framer-1qkzk01",
                          "data-framer-appear-id": "1qkzk01",
                          initial: F,
                          optimized: !0,
                          children: [
                            n(He, {
                              __framer__loop: Se,
                              __framer__loopEffectEnabled: !0,
                              __framer__loopRepeatDelay: 0,
                              __framer__loopRepeatType: "mirror",
                              __framer__loopTransition: Ce,
                              __perspectiveFX: !1,
                              __targetOpacity: 1,
                              className: "framer-1f2c7t8",
                              "data-framer-name": "visual",
                              children: [
                                e("div", {
                                  className: "framer-8x3z0j",
                                  "data-framer-name": "space",
                                }),
                                e(r, {
                                  breakpoint: i,
                                  overrides: {
                                    ju7O5f4HW: {
                                      background: {
                                        alt: "",
                                        fit: "fit",
                                        loading: a(
                                          (t?.y || 0) +
                                            0 +
                                            0 +
                                            0 +
                                            0 +
                                            100 +
                                            0 +
                                            0 +
                                            764.4 +
                                            0 +
                                            0 +
                                            0
                                        ),
                                        pixelHeight: 2884,
                                        pixelWidth: 2509,
                                        positionX: "center",
                                        positionY: "center",
                                        sizes: `calc(min(${
                                          t?.width || "100vw"
                                        } - 32px, 1280px) * 0.6564)`,
                                        src: "/images/hand.png",
                                        srcSet:
                                          "/images/hand.png?scale-down-to=1024 890w,/images/hand.png?scale-down-to=2048 1781w,/images/hand.png 2509w",
                                      },
                                    },
                                    YEydZTQhG: {
                                      background: {
                                        alt: "",
                                        fit: "fit",
                                        loading: a(
                                          (t?.y || 0) +
                                            0 +
                                            0 +
                                            0 +
                                            0 +
                                            100 +
                                            0 +
                                            0 +
                                            774.4 +
                                            0 +
                                            0 +
                                            0
                                        ),
                                        pixelHeight: 2884,
                                        pixelWidth: 2509,
                                        positionX: "center",
                                        positionY: "center",
                                        sizes: `calc(min(${
                                          t?.width || "100vw"
                                        } - 64px, 1280px) * 0.5164)`,
                                        src: "/images/hand.png",
                                        srcSet:
                                          "/images/hand.png?scale-down-to=1024 890w,/images/hand.png?scale-down-to=2048 1781w,/images/hand.png 2509w",
                                      },
                                    },
                                  },
                                  children: e(g, {
                                    background: {
                                      alt: "",
                                      fit: "fit",
                                      loading: a(
                                        (t?.y || 0) +
                                          0 +
                                          0 +
                                          0 +
                                          0 +
                                          100 +
                                          0 +
                                          0 +
                                          803.4 +
                                          0 +
                                          0 +
                                          0
                                      ),
                                      pixelHeight: 2884,
                                      pixelWidth: 2509,
                                      positionX: "center",
                                      positionY: "center",
                                      sizes: `calc(min(${
                                        t?.width || "100vw"
                                      } - 64px, 1280px) * 0.5164)`,
                                      src: "/images/hand.png",
                                      srcSet:
                                        "/images/hand.png?scale-down-to=1024 890w,/images/hand.png?scale-down-to=2048 1781w,/images/hand.png 2509w",
                                    },
                                    className: "framer-1i7xl8t",
                                    "data-framer-name": "Clay",
                                  }),
                                }),
                              ],
                            }),
                            e(r, {
                              breakpoint: i,
                              overrides: {
                                ju7O5f4HW: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 246.8,
                                    intrinsicWidth: 598.4,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        764.4 +
                                        319 -
                                        609.5
                                    ),
                                    pixelHeight: 617,
                                    pixelWidth: 1496,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 32px, 1280px) * 1.3257)`,
                                    src: "/images/w_mist.avif?scale-down-to=1024",
                                    srcSet:
                                      "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif 1496w",
                                  },
                                },
                                YEydZTQhG: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 246.8,
                                    intrinsicWidth: 598.4,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        774.4 +
                                        793 -
                                        445.25
                                    ),
                                    pixelHeight: 617,
                                    pixelWidth: 1496,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 64px, 1280px) * 1.3257)`,
                                    src: "/images/w_mist.avif?scale-down-to=1024",
                                    srcSet:
                                      "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif 1496w",
                                  },
                                },
                              },
                              children: e(g, {
                                background: {
                                  alt: "",
                                  fit: "fill",
                                  intrinsicHeight: 246.8,
                                  intrinsicWidth: 598.4,
                                  loading: a(
                                    (t?.y || 0) +
                                      0 +
                                      0 +
                                      0 +
                                      0 +
                                      100 +
                                      0 +
                                      0 +
                                      803.4 +
                                      793 -
                                      445.25
                                  ),
                                  pixelHeight: 617,
                                  pixelWidth: 1496,
                                  sizes: `calc(min(${
                                    t?.width || "100vw"
                                  } - 64px, 1280px) * 1.3257)`,
                                  src: "/images/w_mist.avif?scale-down-to=1024",
                                  srcSet:
                                    "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif 1496w",
                                },
                                className: "framer-p8t2ds",
                                "data-framer-name": "Gradient white",
                                transformTemplate: Q,
                              }),
                            }),
                            e(r, {
                              breakpoint: i,
                              overrides: {
                                ju7O5f4HW: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 510.4,
                                    intrinsicWidth: 897.2,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        764.4 +
                                        319 -
                                        761.5
                                    ),
                                    pixelHeight: 1276,
                                    pixelWidth: 2243,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 32px, 1280px) * 1.1209)`,
                                    src: "/images/w_mist.avif?scale-down-to=1024",
                                    srcSet:
                                      "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif?scale-down-to=2048 2048w,/images/w_mist.avif 2243w",
                                  },
                                },
                                YEydZTQhG: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 510.4,
                                    intrinsicWidth: 897.2,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        774.4 +
                                        793 -
                                        675.5
                                    ),
                                    pixelHeight: 1276,
                                    pixelWidth: 2243,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 64px, 1280px) * 1.1209)`,
                                    src: "/images/w_mist.avif?scale-down-to=1024",
                                    srcSet:
                                      "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif?scale-down-to=2048 2048w,/images/w_mist.avif 2243w",
                                  },
                                },
                              },
                              children: e(g, {
                                background: {
                                  alt: "",
                                  fit: "fill",
                                  intrinsicHeight: 510.4,
                                  intrinsicWidth: 897.2,
                                  loading: a(
                                    (t?.y || 0) +
                                      0 +
                                      0 +
                                      0 +
                                      0 +
                                      100 +
                                      0 +
                                      0 +
                                      803.4 +
                                      793 -
                                      675.5
                                  ),
                                  pixelHeight: 1276,
                                  pixelWidth: 2243,
                                  sizes: `calc(min(${
                                    t?.width || "100vw"
                                  } - 64px, 1280px) * 1.1209)`,
                                  src: "/images/w_mist.avif?scale-down-to=1024",
                                  srcSet:
                                    "/images/w_mist.avif?scale-down-to=512 512w,/images/w_mist.avif?scale-down-to=1024 1024w,/images/w_mist.avif?scale-down-to=2048 2048w,/images/w_mist.avif 2243w",
                                },
                                className: "framer-18tahzm",
                                "data-framer-name": "Gradient2",
                                transformTemplate: Q,
                              }),
                            }),
                            e(r, {
                              breakpoint: i,
                              overrides: {
                                ju7O5f4HW: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 510.4,
                                    intrinsicWidth: 897.2,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        764.4 +
                                        -9
                                    ),
                                    pixelHeight: 1276,
                                    pixelWidth: 2243,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 32px, 1280px) * 1.4112)`,
                                    src: "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024",
                                    srcSet:
                                      "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=512 512w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024 1024w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=2048 2048w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png 2243w",
                                  },
                                },
                                YEydZTQhG: {
                                  background: {
                                    alt: "",
                                    fit: "fill",
                                    intrinsicHeight: 510.4,
                                    intrinsicWidth: 897.2,
                                    loading: a(
                                      (t?.y || 0) +
                                        0 +
                                        0 +
                                        0 +
                                        0 +
                                        100 +
                                        0 +
                                        0 +
                                        774.4 +
                                        -62
                                    ),
                                    pixelHeight: 1276,
                                    pixelWidth: 2243,
                                    sizes: `calc(min(${
                                      t?.width || "100vw"
                                    } - 64px, 1280px) * 1.4112)`,
                                    src: "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024",
                                    srcSet:
                                      "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=512 512w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024 1024w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=2048 2048w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png 2243w",
                                  },
                                },
                              },
                              children: e(g, {
                                background: {
                                  alt: "",
                                  fit: "fill",
                                  intrinsicHeight: 510.4,
                                  intrinsicWidth: 897.2,
                                  loading: a(
                                    (t?.y || 0) +
                                      0 +
                                      0 +
                                      0 +
                                      0 +
                                      100 +
                                      0 +
                                      0 +
                                      803.4 +
                                      -62
                                  ),
                                  pixelHeight: 1276,
                                  pixelWidth: 2243,
                                  sizes: `calc(min(${
                                    t?.width || "100vw"
                                  } - 64px, 1280px) * 1.4112)`,
                                  src: "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024",
                                  srcSet:
                                    "/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=512 512w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=1024 1024w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png?scale-down-to=2048 2048w,/images/ad8OvET58gUVazcz0TOTKQDYK0.png 2243w",
                                },
                                className: "framer-gb877p",
                                "data-framer-name": "Gradient blue",
                                transformTemplate: Q,
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  e("div", {
                    className: "framer-ei2o29",
                    "data-framer-name": "Faq",
                    children: n("div", {
                      className: "framer-m5vw72",
                      "data-framer-name": "container",
                      children: [
                        n("div", {
                          className: "framer-1er6ipz",
                          "data-framer-name": "header",
                          children: [
                            e(se, {
                              __framer__animate: { transition: I },
                              __framer__animateOnce: !0,
                              __framer__enter: me,
                              __framer__exit: ce,
                              __framer__styleAppearEffectEnabled: !0,
                              __framer__threshold: 0,
                              __fromCanvasComponent: !0,
                              __perspectiveFX: !1,
                              __targetOpacity: 1,
                              children: e(f, {
                                children: e("h2", {
                                  className: "framer-styles-preset-eqwuq7",
                                  "data-styles-preset": "Z3basApTX",
                                  children: "Preguntas frecuentes",
                                }),
                              }),
                              className: "framer-1skk0ky",
                              "data-framer-name": "Frequently asked questions",
                              fonts: ["Inter"],
                              verticalAlignment: "top",
                              withExternalLayout: !0,
                            }),
                            e(se, {
                              __framer__animate: { transition: I },
                              __framer__animateOnce: !0,
                              __framer__enter: me,
                              __framer__exit: ce,
                              __framer__styleAppearEffectEnabled: !0,
                              __framer__threshold: 0,
                              __fromCanvasComponent: !0,
                              __perspectiveFX: !1,
                              __targetOpacity: 1,
                              children: e(f, {
                                children: e("p", {
                                  className: "framer-styles-preset-1qnc6s4",
                                  "data-styles-preset": "NTWwFC9H4",
                                  children:
                                    "Encuentra respuestas a las preguntas más comunes a continuación.",
                                }),
                              }),
                              className: "framer-1vncxbk",
                              "data-framer-name":
                                "Encuentra respuestas a las preguntas más comunes a continuación.",
                              fonts: ["Inter"],
                              verticalAlignment: "top",
                              withExternalLayout: !0,
                            }),
                          ],
                        }),
                        e(r, {
                          breakpoint: i,
                          overrides: {
                            ju7O5f4HW: {
                              width: `min(max(${
                                t?.width || "100vw"
                              } - 32px, 1px), 590px)`,
                              y:
                                (t?.y || 0) +
                                0 +
                                0 +
                                0 +
                                1183.4 +
                                48 +
                                0 +
                                226.4,
                            },
                            YEydZTQhG: {
                              y:
                                (t?.y || 0) +
                                0 +
                                0 +
                                0 +
                                1667.4 +
                                72 +
                                0 +
                                226.4,
                            },
                          },
                          children: e(m, {
                            height: 600,
                            width: `min(max(${
                              t?.width || "100vw"
                            } - 64px, 1px), 590px)`,
                            y:
                              (t?.y || 0) + 0 + 0 + 0 + 1696.4 + 80 + 0 + 226.4,
                            children: e(h, {
                              className: "framer-iv1qfb-container",
                              nodeId: "JFmbSqL4U",
                              scopeId: "augiA20Il",
                              children: e(z, {
                                height: "100%",
                                id: "JFmbSqL4U",
                                layoutId: "JFmbSqL4U",
                                style: { width: "100%" },
                                width: "100%",
                              }),
                            }),
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            }),
            e("div", { id: "overlay" }),
          ],
        }),
      })
    );
  }),
  qe = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-WoFHi.framer-lux5qc, .framer-WoFHi .framer-lux5qc { display: block; }",
    ".framer-WoFHi.framer-72rtr7 { align-content: center; align-items: center; background-color: var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, #ffffff); display: flex; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: flex-start; overflow: hidden; padding: 0px; position: relative; width: 1280px; }",
    ".framer-WoFHi .framer-lie5fr { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-1z0jr85 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: hidden; padding: 100px 32px 0px 32px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-1glv93a { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 89px; height: min-content; justify-content: center; max-width: 1280px; overflow: visible; padding: 0px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-1yq745y { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: flex-start; max-width: 787px; overflow: visible; padding: 0px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-f8udkx-container { aspect-ratio: 1 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 80px); position: relative; width: 80px; will-change: var(--framer-will-change-effect-override, transform); }",
    ".framer-WoFHi .framer-1y4isff, .framer-WoFHi .framer-1er6ipz { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 12px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-rpfyn7, .framer-WoFHi .framer-1skk0ky { --framer-paragraph-spacing: 0px; flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }",
    ".framer-WoFHi .framer-1c0bgws { --framer-paragraph-spacing: 0px; flex: none; height: auto; max-width: 395px; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }",
    ".framer-WoFHi .framer-17960rj { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: flex-start; max-width: 700px; overflow: hidden; padding: 0px; position: relative; width: 100%; will-change: var(--framer-will-change-effect-override, transform); }",
    ".framer-WoFHi .framer-1boj8rg-container, .framer-WoFHi .framer-4h9ri7-container, .framer-WoFHi .framer-iv1qfb-container { flex: none; height: auto; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-1qkzk01 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 6px; height: min-content; justify-content: center; overflow: visible; padding: 0px 0px 72px 0px; position: relative; width: 100%; will-change: var(--framer-will-change-effect-override, transform); }",
    ".framer-WoFHi .framer-1f2c7t8 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: 100%; z-index: 3; }",
    ".framer-WoFHi .framer-8x3z0j { align-self: stretch; flex: none; height: auto; overflow: hidden; position: relative; width: 18%; }",
    ".framer-WoFHi .framer-p8t2ds { aspect-ratio: 2.4246353322528362 / 1; bottom: -220px; flex: none; height: var(--framer-aspect-ratio-supported, 665px); left: 50%; overflow: visible; position: absolute; transform: translateX(-50%); width: 133%; z-index: 4; }",
    ".framer-WoFHi .framer-18tahzm { aspect-ratio: 1.7578369905956115 / 1; bottom: -99px; flex: none; height: var(--framer-aspect-ratio-supported, 776px); left: 50%; overflow: visible; position: absolute; transform: translateX(-50%); width: 112%; z-index: 2; }",
    ".framer-WoFHi .framer-gb877p { aspect-ratio: 1.7578369905956115 / 1; bottom: -121px; flex: none; height: var(--framer-aspect-ratio-supported, 976px); left: 50%; overflow: visible; position: absolute; top: -62px; transform: translateX(-50%); width: 141%; z-index: 1; }",
    ".framer-WoFHi .framer-ei2o29 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: hidden; padding: 80px 32px 80px 32px; position: relative; width: 100%; }",
    ".framer-WoFHi .framer-m5vw72 { align-content: center; align-items: center; display: flex; flex: 1 0 0px; flex-direction: column; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: flex-start; max-width: 590px; overflow: visible; padding: 0px; position: relative; width: 1px; }",
    ".framer-WoFHi .framer-1vncxbk { --framer-paragraph-spacing: 0px; flex: none; height: auto; max-width: 505px; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }",
    ...te,
    ...$,
    ...ie,
  ],
  b = A(Ye, qe, "framer-WoFHi"),
  ct = b;
b.displayName = "Home";
b.defaultProps = { height: 2725, width: 1280 };
J(
  b,
  [
    {
      explicitInter: !0,
      fonts: [
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
          url: "https://framerusercontent.com/assets/5vvr9Vy74if2I6bQbJvbw7SY1pQ.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
          url: "https://framerusercontent.com/assets/EOr0mi4hNtlgWNn9if640EZzXCo.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+1F00-1FFF",
          url: "https://framerusercontent.com/assets/Y9k9QrlZAqio88Klkmbd8VoMQc.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+0370-03FF",
          url: "https://framerusercontent.com/assets/OYrD2tBIBPvoJXiIHnLoOXnY9M.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF",
          url: "https://framerusercontent.com/assets/JeYwfuaPfZHQhEG8U5gtPDZ7WQ.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
          url: "https://framerusercontent.com/assets/vQyevYAyHtARFwPqUzQGpnDs.woff2",
          weight: "400",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB",
          url: "https://framerusercontent.com/assets/b6Y37FthZeALduNqHicBT6FutY.woff2",
          weight: "400",
        },
        {
          family: "Roboto Serif",
          source: "google",
          style: "normal",
          url: "https://fonts.gstatic.com/s/robotoserif/v15/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEliotp6J2Af5fR4k.woff2",
          weight: "400",
        },
      ],
    },
    ...ye,
    ...ve,
    ...be,
    ...We,
    ...ze,
    ...v(ee),
    ...v(Z),
    ...v(ae),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var lt = {
  exports: {
    default: {
      type: "reactComponent",
      name: "FrameraugiA20Il",
      slots: [],
      annotations: {
        framerCanvasComponentVariantDetails:
          '{"propertyName":"variant","data":{"default":{"layout":["fixed","auto"]},"YEydZTQhG":{"layout":["fixed","auto"]},"ju7O5f4HW":{"layout":["fixed","auto"]}}}',
        framerComponentViewportWidth: "true",
        framerIntrinsicWidth: "1280",
        framerAcceptsLayoutTemplate: "true",
        framerDisplayContentsDiv: "false",
        framerScrollSections: "* @framerResponsiveScreen",
        framerContractVersion: "1",
        framerImmutableVariables: "true",
        framerColorSyntax: "true",
        framerAutoSizeImages: "true",
        framerIntrinsicHeight: "2725",
      },
    },
    Props: { type: "tsType", annotations: { framerContractVersion: "1" } },
    __FramerMetadata__: { type: "variable" },
  },
};
export { lt as __FramerMetadata__, ct as default };
