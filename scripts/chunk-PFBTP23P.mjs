import { a as ge, b as xe, c as be } from "./chunk-NT3OEFHM.mjs";
import { a as Me, b as Ye, c as Je } from "./chunk-V5T3UH2U.mjs";
import {
  A as Le,
  B as Pe,
  Ba as j,
  Da as he,
  Ea as Oe,
  Fa as ze,
  Ga as Z,
  Ia as je,
  J as B,
  Ja as G,
  Ka as M,
  La as re,
  Ma as Q,
  P as Ce,
  R as n,
  U as k,
  X as _,
  _ as T,
  b as g,
  ba as Be,
  e as X,
  fa as H,
  ha as O,
  ia as z,
  j as N,
  k as ye,
  ka as te,
  l as W,
  n as L,
  o as V,
  p as Ee,
  r as Xe,
  s as t,
  t as h,
  v as w,
  w as s,
  wa as Te,
  x as P,
  y as Ne,
  z as We,
} from "./chunk-TLFILSQI.mjs";
he.loadFonts([
  "GF;Roboto Serif-regular",
  "GF;Roboto Serif-700",
  "GF;Roboto Serif-700italic",
  "GF;Roboto Serif-italic",
]);
var qe = [
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
  Ze = [
    '.framer-xL1Fk .framer-styles-preset-v85zrp:not(.rich-text-wrapper), .framer-xL1Fk .framer-styles-preset-v85zrp.rich-text-wrapper h3 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 20px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 140%; --framer-paragraph-spacing: 40px; --framer-text-alignment: start; --framer-text-color: var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, #262424); --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; }',
  ],
  He = "framer-xL1Fk";
var at = ["UVdDOstIk", "yZcGVI_xR"],
  ot = "framer-UKpWo",
  nt = { UVdDOstIk: "framer-v-z1d6if", yZcGVI_xR: "framer-v-eb9bye" };
function it(e, ...a) {
  let r = {};
  return a?.forEach((o) => o && Object.assign(r, e[o])), r;
}
var st = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: "spring" },
  lt = ({ value: e, children: a }) => {
    let r = N(w),
      o = e ?? r.transition,
      l = L(() => ({ ...r, transition: o }), [JSON.stringify(o)]);
    return t(w.Provider, { value: l, children: a });
  },
  ft = s.create(g),
  mt = { Closed: "UVdDOstIk", Open: "yZcGVI_xR" },
  ct = ({ content: e, height: a, id: r, title: o, width: l, ...y }) => ({
    ...y,
    aU1_lXl6h: e ?? y.aU1_lXl6h ?? "What's included in this template?",
    pNqA5B2sU: o ?? y.pNqA5B2sU ?? "What's included in this template?",
    variant: mt[y.variant] ?? y.variant ?? "UVdDOstIk",
  }),
  dt = (e, a) =>
    e.layoutDependency ? a.join("-") + e.layoutDependency : a.join("-"),
  pt = X(function (e, a) {
    let r = V(null),
      o = a ?? r,
      l = W(),
      { activeLocale: y, setLocale: v } = B(),
      i = O(),
      {
        style: p,
        className: b,
        layoutId: F,
        variant: U,
        pNqA5B2sU: A,
        aU1_lXl6h: x,
        ...C
      } = ct(e),
      {
        baseVariant: c,
        classNames: d,
        clearLoadingGesture: u,
        gestureHandlers: f,
        gestureVariant: E,
        isLoading: ue,
        setGestureState: R,
        setVariant: m,
        variants: ee,
      } = j({
        cycleOrder: at,
        defaultVariant: "UVdDOstIk",
        ref: o,
        variant: U,
        variantClassNames: nt,
      }),
      I = dt(e, ee),
      { activeVariantCallback: ne, delay: ie } = Te(c),
      S = ne(async (...et) => {
        R({ isPressed: !1 }), m("yZcGVI_xR");
      }),
      De = ne(async (...et) => {
        R({ isPressed: !1 }), m("UVdDOstIk");
      }),
      $e = _(ot, ...[He, be]);
    return t(P, {
      id: F ?? l,
      children: t(ft, {
        animate: ee,
        initial: !1,
        children: t(lt, {
          value: st,
          children: h(s.div, {
            ...C,
            ...f,
            className: _($e, "framer-z1d6if", b, d),
            "data-framer-name": "Closed",
            "data-highlight": !0,
            layoutDependency: I,
            layoutId: "UVdDOstIk",
            onTap: S,
            ref: o,
            style: {
              backgroundColor:
                "var(--token-8348c7c2-ce11-4396-8407-e646654d21a8, rgb(239, 240, 240))",
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              boxShadow:
                "inset 0px 1px 0px 0px var(--token-6674d883-57be-4d94-af2f-0fe1739c44ff, rgba(23, 23, 23, 0))",
              ...p,
            },
            ...it(
              { yZcGVI_xR: { "data-framer-name": "Open", onTap: De } },
              c,
              E
            ),
            children: [
              h(s.div, {
                className: "framer-1ndqmn9",
                layoutDependency: I,
                layoutId: "z9uuxnh8R",
                children: [
                  t(Z, {
                    __fromCanvasComponent: !0,
                    children: t(g, {
                      children: t(s.h3, {
                        className: "framer-styles-preset-v85zrp",
                        "data-styles-preset": "MSpcynDtW",
                        children: "What's included in this template?",
                      }),
                    }),
                    className: "framer-17hbypk",
                    "data-framer-name": "Title",
                    fonts: ["Inter"],
                    layoutDependency: I,
                    layoutId: "wkHtPhJIZ",
                    style: {
                      "--framer-link-text-color": "rgb(0, 153, 255)",
                      "--framer-link-text-decoration": "underline",
                    },
                    text: A,
                    verticalAlignment: "top",
                    withExternalLayout: !0,
                  }),
                  t(s.div, {
                    className: "framer-f8o5sd",
                    "data-framer-name": "close",
                    layoutDependency: I,
                    layoutId: "UdrOCItYB",
                    style: {
                      backgroundColor: "rgb(38, 36, 36)",
                      borderBottomLeftRadius: 48,
                      borderBottomRightRadius: 48,
                      borderTopLeftRadius: 48,
                      borderTopRightRadius: 48,
                    },
                    children: t(je, {
                      className: "framer-czs8t1",
                      "data-framer-name": "X",
                      fill: "rgba(0,0,0,1)",
                      intrinsicHeight: 24,
                      intrinsicWidth: 24,
                      layoutDependency: I,
                      layoutId: "xDdyIh5M9",
                      style: { rotate: 45 },
                      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.5355 16.9479L12 13.4123L8.46447 16.9479C8.27693 17.1354 8.02258 17.2408 7.75736 17.2408C7.49214 17.2408 7.23779 17.1354 7.05025 16.9479C6.86272 16.7603 6.75736 16.506 6.75736 16.2408C6.75736 15.9756 6.86272 15.7212 7.05025 15.5337L10.5858 11.9981L7.05025 8.46259C6.86272 8.27506 6.75736 8.0207 6.75736 7.75549C6.75736 7.49027 6.86272 7.23592 7.05025 7.04838C7.23779 6.86084 7.49214 6.75549 7.75736 6.75549C8.02258 6.75549 8.27693 6.86084 8.46447 7.04838L12 10.5839L15.5355 7.04838C15.7231 6.86084 15.9774 6.75549 16.2426 6.75549C16.5079 6.75549 16.7622 6.86084 16.9497 7.04838C17.1373 7.23592 17.2426 7.49027 17.2426 7.75549C17.2426 8.0207 17.1373 8.27506 16.9497 8.46259L13.4142 11.9981L16.9497 15.5337C17.1373 15.7212 17.2426 15.9756 17.2426 16.2408C17.2426 16.506 17.1373 16.7603 16.9497 16.9479C16.7622 17.1354 16.5079 17.2408 16.2426 17.2408C15.9774 17.2408 15.7231 17.1354 15.5355 16.9479Z" fill="white"/>
</svg>
`,
                      variants: { yZcGVI_xR: { rotate: 0 } },
                      withExternalLayout: !0,
                    }),
                  }),
                ],
              }),
              t(Z, {
                __fromCanvasComponent: !0,
                children: t(g, {
                  children: t(s.p, {
                    className: "framer-styles-preset-1qnc6s4",
                    "data-styles-preset": "NTWwFC9H4",
                    style: { "--framer-text-alignment": "left" },
                    children: "What's included in this template?",
                  }),
                }),
                className: "framer-sf1fe1",
                "data-framer-name": "Content",
                fonts: ["Inter"],
                layoutDependency: I,
                layoutId: "KlWKNkLXh",
                style: {
                  "--framer-link-text-color": "rgb(0, 153, 255)",
                  "--framer-link-text-decoration": "underline",
                  filter: "blur(5px)",
                  opacity: 0,
                  WebkitFilter: "blur(5px)",
                },
                text: x,
                variants: {
                  yZcGVI_xR: {
                    filter: "blur(0px)",
                    opacity: 1,
                    WebkitFilter: "blur(0px)",
                  },
                },
                verticalAlignment: "top",
                withExternalLayout: !0,
              }),
            ],
          }),
        }),
      }),
    });
  }),
  ut = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-UKpWo.framer-vq48h5, .framer-UKpWo .framer-vq48h5 { display: block; }",
    ".framer-UKpWo.framer-z1d6if { cursor: pointer; height: 88px; overflow: hidden; position: relative; width: 467px; will-change: var(--framer-will-change-override, transform); }",
    ".framer-UKpWo .framer-1ndqmn9 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; left: 20px; overflow: hidden; padding: 0px; position: absolute; right: 20px; top: 20px; }",
    ".framer-UKpWo .framer-17hbypk { -webkit-user-select: none; flex: 1 0 0px; height: auto; position: relative; user-select: none; white-space: pre-wrap; width: 1px; word-break: break-word; word-wrap: break-word; }",
    ".framer-UKpWo .framer-f8o5sd { align-content: center; align-items: center; aspect-ratio: 1 / 1; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 4px; height: var(--framer-aspect-ratio-supported, 48px); justify-content: center; overflow: hidden; padding: 8px 24px 8px 24px; position: relative; width: 48px; will-change: var(--framer-will-change-override, transform); }",
    ".framer-UKpWo .framer-czs8t1 { aspect-ratio: 1 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 24px); position: relative; width: 24px; }",
    ".framer-UKpWo .framer-sf1fe1 { -webkit-user-select: none; flex: none; height: auto; left: 16px; position: absolute; right: 16px; top: 84px; user-select: none; white-space: pre-wrap; word-break: break-word; word-wrap: break-word; }",
    "@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-UKpWo .framer-1ndqmn9, .framer-UKpWo .framer-f8o5sd { gap: 0px; } .framer-UKpWo .framer-1ndqmn9 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-UKpWo .framer-1ndqmn9 > :first-child, .framer-UKpWo .framer-f8o5sd > :first-child { margin-left: 0px; } .framer-UKpWo .framer-1ndqmn9 > :last-child, .framer-UKpWo .framer-f8o5sd > :last-child { margin-right: 0px; } .framer-UKpWo .framer-f8o5sd > * { margin: 0px; margin-left: calc(4px / 2); margin-right: calc(4px / 2); } }",
    ".framer-UKpWo.framer-v-eb9bye.framer-z1d6if { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 8px; height: min-content; justify-content: center; padding: 20px; }",
    ".framer-UKpWo.framer-v-eb9bye .framer-1ndqmn9, .framer-UKpWo.framer-v-eb9bye .framer-sf1fe1 { left: unset; position: relative; right: unset; top: unset; width: 100%; }",
    "@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-UKpWo.framer-v-eb9bye.framer-z1d6if { gap: 0px; } .framer-UKpWo.framer-v-eb9bye.framer-z1d6if > * { margin: 0px; margin-bottom: calc(8px / 2); margin-top: calc(8px / 2); } .framer-UKpWo.framer-v-eb9bye.framer-z1d6if > :first-child { margin-top: 0px; } .framer-UKpWo.framer-v-eb9bye.framer-z1d6if > :last-child { margin-bottom: 0px; } }",
    ...Ze,
    ...xe,
  ],
  se = T(pt, ut, "framer-UKpWo"),
  K = se;
se.displayName = "Elements/FAQ Item";
se.defaultProps = { height: 88, width: 467 };
k(se, {
  variant: {
    options: ["UVdDOstIk", "yZcGVI_xR"],
    optionTitles: ["Closed", "Open"],
    title: "Variant",
    type: n.Enum,
  },
  pNqA5B2sU: {
    defaultValue: "What's included in this template?",
    displayTextArea: !1,
    title: "Title",
    type: n.String,
  },
  aU1_lXl6h: {
    defaultValue: "What's included in this template?",
    displayTextArea: !0,
    title: "Content",
    type: n.String,
  },
});
M(
  se,
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
      ],
    },
    ...Q(qe),
    ...Q(ge),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var yt = re(K),
  le = H(te),
  ht = "framer-JxIEz",
  gt = { jYnPA7wVk: "framer-v-lq1ivf" };
var xt = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  fe = {
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
  ae = { delay: 0.2, duration: 1.5, ease: [0.35, 0, 0, 1], type: "tween" },
  me = {
    opacity: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transition: ae,
    x: 0,
    y: 30,
  },
  bt = ({ value: e, children: a }) => {
    let r = N(w),
      o = e ?? r.transition,
      l = L(() => ({ ...r, transition: o }), [JSON.stringify(o)]);
    return t(w.Provider, { value: l, children: a });
  },
  wt = s.create(g),
  _t = ({ height: e, id: a, width: r, ...o }) => ({ ...o }),
  vt = (e, a) =>
    e.layoutDependency ? a.join("-") + e.layoutDependency : a.join("-"),
  Ft = X(function (e, a) {
    let r = V(null),
      o = a ?? r,
      l = W(),
      { activeLocale: y, setLocale: v } = B(),
      i = O(),
      { style: p, className: b, layoutId: F, variant: U, ...A } = _t(e),
      {
        baseVariant: x,
        classNames: C,
        clearLoadingGesture: c,
        gestureHandlers: d,
        gestureVariant: u,
        isLoading: f,
        setGestureState: E,
        setVariant: ue,
        variants: R,
      } = j({
        defaultVariant: "jYnPA7wVk",
        ref: o,
        variant: U,
        variantClassNames: gt,
      }),
      m = vt(e, R),
      I = _(ht, ...[]);
    return t(P, {
      id: F ?? l,
      children: t(wt, {
        animate: R,
        initial: !1,
        children: t(bt, {
          value: xt,
          children: h(s.div, {
            ...A,
            ...d,
            className: _(I, "framer-lq1ivf", b, C),
            "data-framer-name": "Variant 1",
            layoutDependency: m,
            layoutId: "jYnPA7wVk",
            ref: o,
            style: { ...p },
            children: [
              t(z, {
                height: 88,
                width: i?.width || "100vw",
                y: (i?.y || 0) + 0 + 0,
                children: t(le, {
                  __framer__animate: { transition: ae },
                  __framer__animateOnce: !0,
                  __framer__enter: fe,
                  __framer__exit: me,
                  __framer__styleAppearEffectEnabled: !0,
                  __framer__threshold: 0,
                  __perspectiveFX: !1,
                  __smartComponentFX: !0,
                  __targetOpacity: 1,
                  className: "framer-oyj6l-container",
                  layoutDependency: m,
                  layoutId: "QzhMMj4kb-container",
                  nodeId: "QzhMMj4kb",
                  rendersWithMotion: !0,
                  scopeId: "SiEhXDmac",
                  children: t(K, {
                    aU1_lXl6h:
                      "YABLA es una app de chat diseñada para conectar personas. Ya sea que busques nuevas amistades, charlas casuales o simplemente conocer a alguien interesante.",
                    height: "100%",
                    id: "QzhMMj4kb",
                    layoutId: "QzhMMj4kb",
                    pNqA5B2sU: "¿Qué es YABLA?",
                    style: { width: "100%" },
                    variant: "yZcGVI_xR",
                    width: "100%",
                  }),
                }),
              }),
              t(z, {
                height: 88,
                width: i?.width || "100vw",
                y: (i?.y || 0) + 0 + 108,
                children: t(le, {
                  __framer__animate: { transition: ae },
                  __framer__animateOnce: !0,
                  __framer__enter: fe,
                  __framer__exit: me,
                  __framer__styleAppearEffectEnabled: !0,
                  __framer__threshold: 0,
                  __perspectiveFX: !1,
                  __smartComponentFX: !0,
                  __targetOpacity: 1,
                  className: "framer-1nz6069-container",
                  layoutDependency: m,
                  layoutId: "FgDGHjejb-container",
                  nodeId: "FgDGHjejb",
                  rendersWithMotion: !0,
                  scopeId: "SiEhXDmac",
                  children: t(K, {
                    aU1_lXl6h:
                      "Simple. Te registras, creas tu perfil, y puedes empezar a chatear con personas de todo el mundo. Puedes buscar usuarios según tus intereses, ubicación y preferencias.",
                    height: "100%",
                    id: "FgDGHjejb",
                    layoutId: "FgDGHjejb",
                    pNqA5B2sU: "¿Cómo funciona YABLA?",
                    style: { width: "100%" },
                    variant: "UVdDOstIk",
                    width: "100%",
                  }),
                }),
              }),
              t(z, {
                height: 88,
                width: i?.width || "100vw",
                y: (i?.y || 0) + 0 + 216,
                children: t(le, {
                  __framer__animate: { transition: ae },
                  __framer__animateOnce: !0,
                  __framer__enter: fe,
                  __framer__exit: me,
                  __framer__styleAppearEffectEnabled: !0,
                  __framer__threshold: 0,
                  __perspectiveFX: !1,
                  __smartComponentFX: !0,
                  __targetOpacity: 1,
                  className: "framer-1t5gow6-container",
                  layoutDependency: m,
                  layoutId: "A_moyuTkE-container",
                  nodeId: "A_moyuTkE",
                  rendersWithMotion: !0,
                  scopeId: "SiEhXDmac",
                  children: t(K, {
                    aU1_lXl6h:
                      "Puedes hablar con cualquier persona que esté activa en la plataforma. Hay usuarios de diferentes edades, países e intereses, todos con ganas de conectar.",
                    height: "100%",
                    id: "A_moyuTkE",
                    layoutId: "A_moyuTkE",
                    pNqA5B2sU: "¿Con quién puedo hablar en YABLA?",
                    style: { width: "100%" },
                    variant: "UVdDOstIk",
                    width: "100%",
                  }),
                }),
              }),
              t(z, {
                height: 88,
                width: i?.width || "100vw",
                y: (i?.y || 0) + 0 + 324,
                children: t(le, {
                  __framer__animate: { transition: ae },
                  __framer__animateOnce: !0,
                  __framer__enter: fe,
                  __framer__exit: me,
                  __framer__styleAppearEffectEnabled: !0,
                  __framer__threshold: 0,
                  __perspectiveFX: !1,
                  __smartComponentFX: !0,
                  __targetOpacity: 1,
                  className: "framer-1x4ozip-container",
                  layoutDependency: m,
                  layoutId: "tnXXPRccH-container",
                  nodeId: "tnXXPRccH",
                  rendersWithMotion: !0,
                  scopeId: "SiEhXDmac",
                  children: t(K, {
                    aU1_lXl6h:
                      "¡Por supuesto! YABLA está disponible para iOS y Android. También puedes acceder desde tu navegador si prefieres usarlo desde la computadora.",
                    height: "100%",
                    id: "tnXXPRccH",
                    layoutId: "tnXXPRccH",
                    pNqA5B2sU: "¿Puedo usar YABLA en mi teléfono?",
                    style: { width: "100%" },
                    variant: "UVdDOstIk",
                    width: "100%",
                  }),
                }),
              }),
              t(z, {
                height: 88,
                width: i?.width || "100vw",
                y: (i?.y || 0) + 0 + 432,
                children: t(le, {
                  __framer__animate: { transition: ae },
                  __framer__animateOnce: !0,
                  __framer__enter: fe,
                  __framer__exit: me,
                  __framer__styleAppearEffectEnabled: !0,
                  __framer__threshold: 0,
                  __perspectiveFX: !1,
                  __smartComponentFX: !0,
                  __targetOpacity: 1,
                  className: "framer-pegifx-container",
                  layoutDependency: m,
                  layoutId: "qrLdI2uyU-container",
                  nodeId: "qrLdI2uyU",
                  rendersWithMotion: !0,
                  scopeId: "SiEhXDmac",
                  children: t(K, {
                    aU1_lXl6h:
                      "Sí, puedes usar YABLA gratis con funciones básicas. También ofrecemos funciones premium como filtros avanzados, mensajes destacados y acceso a usuarios verificados.",
                    height: "100%",
                    id: "qrLdI2uyU",
                    layoutId: "qrLdI2uyU",
                    pNqA5B2sU: "¿YABLA es gratuita?",
                    style: { width: "100%" },
                    variant: "UVdDOstIk",
                    width: "100%",
                  }),
                }),
              }),
            ],
          }),
        }),
      }),
    });
  }),
  Ct = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-JxIEz.framer-1ocplim, .framer-JxIEz .framer-1ocplim { display: block; }",
    ".framer-JxIEz.framer-lq1ivf { align-content: flex-start; align-items: flex-start; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: flex-start; max-width: 576px; overflow: visible; padding: 0px; position: relative; width: 576px; }",
    ".framer-JxIEz .framer-oyj6l-container, .framer-JxIEz .framer-1nz6069-container, .framer-JxIEz .framer-1t5gow6-container, .framer-JxIEz .framer-1x4ozip-container, .framer-JxIEz .framer-pegifx-container { flex: none; height: auto; position: relative; width: 100%; }",
  ],
  _e = T(Ft, Ct, "framer-JxIEz"),
  Wr = _e;
_e.displayName = "FAQs";
_e.defaultProps = { height: 600, width: 576 };
M(_e, [{ explicitInter: !0, fonts: [] }, ...yt], {
  supportsExplicitInterCodegen: !0,
});
function Ut(e) {
  return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function Ue({
  from: e,
  to: a,
  duration: r,
  fontFamily: o,
  fontSize: l,
  color: y,
  lineHeight: v,
}) {
  let i = Ne(e),
    p = We(i, (U) => Ut(Math.round(U))),
    b = V(null),
    F = Pe(b);
  return (
    ye(() => {
      F && Le(i, a, { duration: r });
    }, [i, F, a, r]),
    t(s.span, {
      ref: b,
      style: { fontFamily: o, fontSize: l, color: y, lineHeight: v },
      children: p,
    })
  );
}
Ue.defaultProps = {
  from: 0,
  to: 15,
  duration: 2.5,
  fontFamily: "Arial",
  fontSize: 24,
  color: "#000000",
  lineHeight: 1.5,
};
k(Ue, {
  from: { type: n.Number, title: "From", defaultValue: 0, min: 0, step: 1 },
  to: { type: n.Number, title: "To", defaultValue: 15, min: 0, step: 1 },
  duration: {
    type: n.Number,
    title: "Duration",
    defaultValue: 2.5,
    min: 0,
    step: 0.1,
    displayStepper: !0,
  },
  fontFamily: { type: n.String, title: "Font Family", defaultValue: "Arial" },
  fontSize: {
    type: n.Number,
    title: "Font Size",
    defaultValue: 24,
    min: 12,
    max: 72,
    step: 1,
  },
  color: { type: n.Color, title: "Color", defaultValue: "#000000" },
  lineHeight: {
    type: n.Number,
    title: "Line Height",
    defaultValue: 1.5,
    min: 0,
    step: 0.1,
    displayStepper: !0,
  },
});
var Re = Ue;
var Ie = H(ze),
  Rt = re(Re),
  It = Be(H(s.div)),
  St = ["xQGkPnBpb", "TOU6uSL6s"],
  Vt = "framer-mdAtt",
  kt = { TOU6uSL6s: "framer-v-soiwks", xQGkPnBpb: "framer-v-1qxya38" };
function ve(e, ...a) {
  let r = {};
  return a?.forEach((o) => o && Object.assign(r, e[o])), r;
}
var Dt = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  oe = (e) =>
    typeof e == "object" && e !== null && typeof e.src == "string"
      ? e
      : typeof e == "string"
      ? { src: e }
      : void 0,
  Se = {
    opacity: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    x: -50,
    y: 0,
  },
  At = { delay: 0.3, duration: 0.4, ease: [0.12, 0.23, 0.5, 1], type: "tween" },
  Et = (e, a) => `translateX(-50%) ${a}`,
  Xt = { delay: 0.2, duration: 0.4, ease: [0.12, 0.23, 0.5, 1], type: "tween" },
  Nt = { delay: 0.1, duration: 0.4, ease: [0.12, 0.23, 0.5, 1], type: "tween" },
  Wt = { damping: 30, delay: 0.3, mass: 1, stiffness: 400, type: "spring" },
  Lt = {
    opacity: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transition: Wt,
    x: 0,
    y: 0,
  },
  Pt = {
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
  Bt = ({ value: e, children: a }) => {
    let r = N(w),
      o = e ?? r.transition,
      l = L(() => ({ ...r, transition: o }), [JSON.stringify(o)]);
    return t(w.Provider, { value: l, children: a });
  },
  Tt = s.create(g),
  Ot = { "Variant 1": "xQGkPnBpb", mobile: "TOU6uSL6s" },
  zt = ({
    from: e,
    height: a,
    id: r,
    image1: o,
    image2: l,
    image3: y,
    to: v,
    width: i,
    ...p
  }) => ({
    ...p,
    aOVDHwC0c: l ??
      p.aOVDHwC0c ?? {
        alt: "",
        pixelHeight: 192,
        pixelWidth: 192,
        src: "/images/person_2.jpg",
      },
    c9wupuW39: e ?? p.c9wupuW39 ?? 1e3,
    dMyTCzIRw: v ?? p.dMyTCzIRw ?? 5e3,
    gs4Pjbrvg: y ??
      p.gs4Pjbrvg ?? {
        alt: "",
        pixelHeight: 192,
        pixelWidth: 192,
        src: "/images/person_3.webp",
      },
    LuJSVylZR: o ??
      p.LuJSVylZR ?? {
        alt: "",
        pixelHeight: 192,
        pixelWidth: 192,
        src: "/images/person_1.jpg",
      },
    variant: Ot[p.variant] ?? p.variant ?? "xQGkPnBpb",
  }),
  jt = (e, a) =>
    e.layoutDependency ? a.join("-") + e.layoutDependency : a.join("-"),
  Mt = X(function (e, a) {
    let r = V(null),
      o = a ?? r,
      l = W(),
      { activeLocale: y, setLocale: v } = B(),
      i = O(),
      {
        style: p,
        className: b,
        layoutId: F,
        variant: U,
        c9wupuW39: A,
        dMyTCzIRw: x,
        LuJSVylZR: C,
        aOVDHwC0c: c,
        gs4Pjbrvg: d,
        ...u
      } = zt(e),
      {
        baseVariant: f,
        classNames: E,
        clearLoadingGesture: ue,
        gestureHandlers: R,
        gestureVariant: m,
        isLoading: ee,
        setGestureState: I,
        setVariant: ne,
        variants: ie,
      } = j({
        cycleOrder: St,
        defaultVariant: "xQGkPnBpb",
        ref: o,
        variant: U,
        variantClassNames: kt,
      }),
      S = jt(e, ie),
      Ae = _(Vt, ...[be]);
    return t(P, {
      id: F ?? l,
      children: t(Tt, {
        animate: ie,
        initial: !1,
        children: t(Bt, {
          value: Dt,
          children: h(s.div, {
            ...u,
            ...R,
            className: _(Ae, "framer-1qxya38", b, E),
            "data-framer-name": "Variant 1",
            layoutDependency: S,
            layoutId: "xQGkPnBpb",
            ref: o,
            style: { ...p },
            ...ve({ TOU6uSL6s: { "data-framer-name": "mobile" } }, f, m),
            children: [
              h(s.div, {
                className: "framer-162gbee",
                "data-framer-name": "profiles",
                layoutDependency: S,
                layoutId: "bR19B5uAn",
                children: [
                  t(Ie, {
                    __framer__animate: { transition: At },
                    __framer__animateOnce: !0,
                    __framer__enter: Se,
                    __framer__styleAppearEffectEnabled: !0,
                    __framer__threshold: 0,
                    __perspectiveFX: !1,
                    __smartComponentFX: !0,
                    __targetOpacity: 1,
                    background: {
                      alt: "",
                      fit: "stretch",
                      loading: G(
                        (i?.y || 0) + (0 + ((i?.height || 48) - 0 - 0) / 2) + 0
                      ),
                      sizes: "0px",
                      ...oe(d),
                      positionX: "center",
                      positionY: "center",
                    },
                    className: "framer-1x9520m",
                    "data-framer-name": "image",
                    layoutDependency: S,
                    layoutId: "SpLICR3eE",
                    style: {
                      borderBottomLeftRadius: "100%",
                      borderBottomRightRadius: "100%",
                      borderTopLeftRadius: "100%",
                      borderTopRightRadius: "100%",
                    },
                    transformTemplate: Et,
                    ...ve(
                      {
                        TOU6uSL6s: {
                          background: {
                            alt: "",
                            fit: "stretch",
                            loading: G(
                              (i?.y || 0) +
                                0 +
                                (((i?.height || 92) - 0 - 44) / 2 + 0 + 0) +
                                0
                            ),
                            sizes: "0px",
                            ...oe(d),
                            positionX: "center",
                            positionY: "center",
                          },
                        },
                      },
                      f,
                      m
                    ),
                  }),
                  t(Ie, {
                    __framer__animate: { transition: Xt },
                    __framer__animateOnce: !0,
                    __framer__enter: Se,
                    __framer__styleAppearEffectEnabled: !0,
                    __framer__threshold: 0,
                    __perspectiveFX: !1,
                    __smartComponentFX: !0,
                    __targetOpacity: 1,
                    background: {
                      alt: "",
                      fit: "stretch",
                      loading: G(
                        (i?.y || 0) + (0 + ((i?.height || 48) - 0 - 0) / 2) + 0
                      ),
                      sizes: "0px",
                      ...oe(c),
                      positionX: "center",
                      positionY: "center",
                    },
                    className: "framer-8kg1no",
                    "data-framer-name": "image",
                    layoutDependency: S,
                    layoutId: "Nr2MTPpX1",
                    style: {
                      borderBottomLeftRadius: "100%",
                      borderBottomRightRadius: "100%",
                      borderTopLeftRadius: "100%",
                      borderTopRightRadius: "100%",
                    },
                    ...ve(
                      {
                        TOU6uSL6s: {
                          background: {
                            alt: "",
                            fit: "stretch",
                            loading: G(
                              (i?.y || 0) +
                                0 +
                                (((i?.height || 92) - 0 - 44) / 2 + 0 + 0) +
                                0
                            ),
                            sizes: "0px",
                            ...oe(c),
                            positionX: "center",
                            positionY: "center",
                          },
                        },
                      },
                      f,
                      m
                    ),
                  }),
                  t(Ie, {
                    __framer__animate: { transition: Nt },
                    __framer__animateOnce: !0,
                    __framer__enter: Se,
                    __framer__styleAppearEffectEnabled: !0,
                    __framer__threshold: 0,
                    __perspectiveFX: !1,
                    __smartComponentFX: !0,
                    __targetOpacity: 1,
                    background: {
                      alt: "",
                      fit: "stretch",
                      loading: G(
                        (i?.y || 0) + (0 + ((i?.height || 48) - 0 - 0) / 2) + 0
                      ),
                      sizes: "48px",
                      ...oe(C),
                      positionX: "center",
                      positionY: "center",
                    },
                    className: "framer-1xdskka",
                    "data-framer-name": "image",
                    layoutDependency: S,
                    layoutId: "gI0fDNoCI",
                    style: {
                      borderBottomLeftRadius: "100%",
                      borderBottomRightRadius: "100%",
                      borderTopLeftRadius: "100%",
                      borderTopRightRadius: "100%",
                    },
                    ...ve(
                      {
                        TOU6uSL6s: {
                          background: {
                            alt: "",
                            fit: "stretch",
                            loading: G(
                              (i?.y || 0) +
                                0 +
                                (((i?.height || 92) - 0 - 44) / 2 + 0 + 0) +
                                0
                            ),
                            sizes: "48px",
                            ...oe(C),
                            positionX: "center",
                            positionY: "center",
                          },
                        },
                      },
                      f,
                      m
                    ),
                  }),
                ],
              }),
              h(It, {
                __perspectiveFX: !1,
                __smartComponentFX: !0,
                __targetOpacity: 1,
                animate: Lt,
                className: "framer-1g3i9qv",
                "data-framer-appear-id": "1g3i9qv",
                "data-framer-name": "Container",
                initial: Pt,
                layoutDependency: S,
                layoutId: "tQnD7ldK9",
                optimized: !0,
                children: [
                  h(s.div, {
                    className: "framer-1d2nlyx",
                    layoutDependency: S,
                    layoutId: "WTdI2WP7R",
                    children: [
                      t(Z, {
                        __fromCanvasComponent: !0,
                        children: t(g, {
                          children: t(s.p, {
                            className: "framer-styles-preset-1qnc6s4",
                            "data-styles-preset": "NTWwFC9H4",
                            style: {
                              "--framer-text-color":
                                "var(--extracted-r6o4lv, var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80)))",
                            },
                            children: "Más de ",
                          }),
                        }),
                        className: "framer-ljkdqo",
                        "data-framer-name": "Text",
                        fonts: ["Inter"],
                        layoutDependency: S,
                        layoutId: "WxzbzIjs2",
                        style: {
                          "--extracted-r6o4lv":
                            "var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80))",
                        },
                        verticalAlignment: "top",
                        withExternalLayout: !0,
                      }),
                      t(z, {
                        children: t(te, {
                          className: "framer-1gaaj2m-container",
                          isAuthoredByUser: !0,
                          layoutDependency: S,
                          layoutId: "SWthWXdvz-container",
                          nodeId: "SWthWXdvz",
                          rendersWithMotion: !0,
                          scopeId: "uhhItGYJq",
                          children: t(Re, {
                            color:
                              "var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80))",
                            duration: 3,
                            fontFamily: "Inter",
                            fontSize: 16,
                            from: A,
                            height: "100%",
                            id: "SWthWXdvz",
                            layoutId: "SWthWXdvz",
                            lineHeight: 1.5,
                            style: { width: "100%" },
                            to: x,
                            width: "100%",
                          }),
                        }),
                      }),
                    ],
                  }),
                  t(Z, {
                    __fromCanvasComponent: !0,
                    children: t(g, {
                      children: t(s.p, {
                        className: "framer-styles-preset-1qnc6s4",
                        "data-styles-preset": "NTWwFC9H4",
                        style: {
                          "--framer-text-color":
                            "var(--extracted-r6o4lv, var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80)))",
                        },
                        children: "personas ya usan Yabla para chatear.",
                      }),
                    }),
                    className: "framer-1nwtvzy",
                    "data-framer-name": "Text",
                    fonts: ["Inter"],
                    layoutDependency: S,
                    layoutId: "UoBTo4F7w",
                    style: {
                      "--extracted-r6o4lv":
                        "var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80))",
                    },
                    verticalAlignment: "top",
                    withExternalLayout: !0,
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
    });
  }),
  Yt = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-mdAtt.framer-h9zoud, .framer-mdAtt .framer-h9zoud { display: block; }",
    ".framer-mdAtt.framer-1qxya38 { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: 787px; }",
    ".framer-mdAtt .framer-162gbee { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; min-height: 48px; overflow: visible; padding: 0px; position: relative; width: 128px; }",
    ".framer-mdAtt .framer-1x9520m { aspect-ratio: 1 / 1; bottom: 0px; flex: none; left: 19%; position: absolute; top: 0px; width: var(--framer-aspect-ratio-supported, 48px); z-index: 1; }",
    ".framer-mdAtt .framer-8kg1no { aspect-ratio: 1 / 1; bottom: 0px; flex: none; left: 40px; position: absolute; top: 0px; width: var(--framer-aspect-ratio-supported, 48px); z-index: 1; }",
    ".framer-mdAtt .framer-1xdskka { aspect-ratio: 1 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 48px); position: absolute; right: 0px; top: 0px; width: 48px; z-index: 1; }",
    ".framer-mdAtt .framer-1g3i9qv { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 8px; height: 24px; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: min-content; }",
    ".framer-mdAtt .framer-1d2nlyx { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: min-content; }",
    ".framer-mdAtt .framer-ljkdqo, .framer-mdAtt .framer-1nwtvzy { flex: none; height: auto; position: relative; white-space: pre; width: auto; }",
    ".framer-mdAtt .framer-1gaaj2m-container { flex: none; height: auto; position: relative; width: 43px; }",
    ".framer-mdAtt.framer-v-soiwks.framer-1qxya38 { flex-direction: column; width: 390px; }",
    ...xe,
  ],
  ce = T(Mt, Yt, "framer-mdAtt"),
  Gr = ce;
ce.displayName = "Review component";
ce.defaultProps = { height: 48, width: 787 };
k(ce, {
  variant: {
    options: ["xQGkPnBpb", "TOU6uSL6s"],
    optionTitles: ["Variant 1", "mobile"],
    title: "Variant",
    type: n.Enum,
  },
  c9wupuW39: {
    defaultValue: 1e3,
    min: 0,
    step: 1,
    title: "From",
    type: n.Number,
  },
  dMyTCzIRw: {
    defaultValue: 5e3,
    min: 0,
    step: 1,
    title: "To",
    type: n.Number,
  },
  LuJSVylZR: {
    __defaultAssetReference:
      "data:framer/asset-reference,rNm2MXvNVhdLoeSvw0ZFaHZo4OU.png?originalFilename=image.png&preferredSize=auto",
    __vekterDefault: {
      alt: "",
      assetReference:
        "data:framer/asset-reference,rNm2MXvNVhdLoeSvw0ZFaHZo4OU.png?originalFilename=image.png&preferredSize=auto",
    },
    description: "",
    title: "Image 1",
    type: n.ResponsiveImage,
  },
  aOVDHwC0c: {
    __defaultAssetReference:
      "data:framer/asset-reference,person_2.png?originalFilename=image.png&preferredSize=auto",
    __vekterDefault: {
      alt: "",
      assetReference:
        "data:framer/asset-reference,person_2.png?originalFilename=image.png&preferredSize=auto",
    },
    title: "Image 2",
    type: n.ResponsiveImage,
  },
  gs4Pjbrvg: {
    __defaultAssetReference:
      "data:framer/asset-reference,person_3.png?originalFilename=image.png&preferredSize=auto",
    __vekterDefault: {
      alt: "",
      assetReference:
        "data:framer/asset-reference,person_3.png?originalFilename=image.png&preferredSize=auto",
    },
    description: "",
    title: "Image 3",
    type: n.ResponsiveImage,
  },
});
M(
  ce,
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
      ],
    },
    ...Rt,
    ...Q(ge),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var Jt = H(s.div),
  qt = { kP5aFx87g: { hover: !0, pressed: !0 } },
  Zt = ["kP5aFx87g", "ZC0fSZIV7", "npPC_wYk_", "apOFYjT7g", "YjgqfXpv1"],
  Ht = "framer-bJR9r",
  Gt = {
    apOFYjT7g: "framer-v-zyaqym",
    kP5aFx87g: "framer-v-k88sog",
    npPC_wYk_: "framer-v-2qlwgx",
    YjgqfXpv1: "framer-v-13olis1",
    ZC0fSZIV7: "framer-v-68eoks",
  };
function Ge(e, ...a) {
  let r = {};
  return a?.forEach((o) => o && Object.assign(r, e[o])), r;
}
var Qt = { delay: 0, duration: 0.2, ease: [0.44, 0, 0.56, 1], type: "tween" },
  Kt = { delay: 0, duration: 1, ease: [0, 0, 1, 1], type: "tween" },
  $t = {
    opacity: 1,
    rotate: 360,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    x: 0,
    y: 0,
  },
  er = (e, a) => `translateX(-50%) ${a}`,
  tr = ({ value: e, children: a }) => {
    let r = N(w),
      o = e ?? r.transition,
      l = L(() => ({ ...r, transition: o }), [JSON.stringify(o)]);
    return t(w.Provider, { value: l, children: a });
  },
  rr = s.create(g),
  ar = {
    Default: "kP5aFx87g",
    Disabled: "npPC_wYk_",
    Error: "YjgqfXpv1",
    Loading: "ZC0fSZIV7",
    Success: "apOFYjT7g",
  },
  or = ({ height: e, id: a, width: r, ...o }) => ({
    ...o,
    variant: ar[o.variant] ?? o.variant ?? "kP5aFx87g",
  }),
  nr = (e, a) =>
    e.layoutDependency ? a.join("-") + e.layoutDependency : a.join("-"),
  ir = X(function (e, a) {
    let r = V(null),
      o = a ?? r,
      l = W(),
      { activeLocale: y, setLocale: v } = B(),
      i = O(),
      { style: p, className: b, layoutId: F, variant: U, ...A } = or(e),
      {
        baseVariant: x,
        classNames: C,
        clearLoadingGesture: c,
        gestureHandlers: d,
        gestureVariant: u,
        isLoading: f,
        setGestureState: E,
        setVariant: ue,
        variants: R,
      } = j({
        cycleOrder: Zt,
        defaultVariant: "kP5aFx87g",
        enabledGestures: qt,
        ref: o,
        variant: U,
        variantClassNames: Gt,
      }),
      m = nr(e, R),
      I = _(Ht, ...[Je]),
      ne = () => x !== "ZC0fSZIV7",
      ie = () => x === "ZC0fSZIV7";
    return t(P, {
      id: F ?? l,
      children: t(rr, {
        animate: R,
        initial: !1,
        children: t(tr, {
          value: Qt,
          children: h(s.button, {
            ...A,
            ...d,
            className: _(I, "framer-k88sog", b, C),
            "data-framer-name": "Default",
            "data-reset": "button",
            layoutDependency: m,
            layoutId: "kP5aFx87g",
            ref: o,
            style: {
              backgroundColor:
                "var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, rgb(38, 36, 36))",
              borderBottomLeftRadius: 48,
              borderBottomRightRadius: 48,
              borderTopLeftRadius: 48,
              borderTopRightRadius: 48,
              opacity: 1,
              ...p,
            },
            variants: {
              "kP5aFx87g-hover": {
                backgroundColor:
                  "var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80))",
                opacity: 1,
              },
              "kP5aFx87g-pressed": { opacity: 1 },
              apOFYjT7g: { opacity: 1 },
              npPC_wYk_: { opacity: 0.5 },
              YjgqfXpv1: {
                backgroundColor: "rgba(255, 34, 68, 0.15)",
                opacity: 1,
              },
            },
            ...Ge(
              {
                "kP5aFx87g-hover": { "data-framer-name": void 0 },
                "kP5aFx87g-pressed": { "data-framer-name": void 0 },
                apOFYjT7g: { "data-framer-name": "Success" },
                npPC_wYk_: { "data-framer-name": "Disabled" },
                YjgqfXpv1: { "data-framer-name": "Error" },
                ZC0fSZIV7: { "data-framer-name": "Loading" },
              },
              x,
              u
            ),
            children: [
              ne() &&
                t(Z, {
                  __fromCanvasComponent: !0,
                  children: t(g, {
                    children: t("a", {
                      href: "/pages/dashboard.html",
                      className: "framer-styles-preset-lb75io",
                      "data-styles-preset": "yl1Flwr7z",
                      style: {
                        "--framer-text-color":
                          "var(--extracted-r6o4lv, var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255)))",
                      },
                      children: "Login",
                    }),
                  }),
                  className: "framer-b2tsul",
                  fonts: ["Inter"],
                  layoutDependency: m,
                  layoutId: "waLYIu5sK",
                  style: {
                    "--extracted-r6o4lv":
                      "var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255))",
                    "--framer-link-text-color": "#fff",
                  },
                  variants: {
                    apOFYjT7g: { "--extracted-r6o4lv": "rgb(255, 255, 255)" },
                    YjgqfXpv1: { "--extracted-r6o4lv": "rgb(255, 34, 68)" },
                  },
                  verticalAlignment: "top",
                  withExternalLayout: !0,
                  ...Ge(
                    {
                      apOFYjT7g: {
                        children: t(g, {
                          children: t(s.p, {
                            style: {
                              "--font-selector": "SW50ZXItU2VtaUJvbGQ=",
                              "--framer-font-family":
                                '"Inter", "Inter Placeholder", sans-serif',
                              "--framer-font-size": "14px",
                              "--framer-font-weight": "600",
                              "--framer-text-color":
                                "var(--extracted-r6o4lv, rgb(255, 255, 255))",
                            },
                            children: "Thank you",
                          }),
                        }),
                        fonts: ["Inter-SemiBold"],
                      },
                      YjgqfXpv1: {
                        children: t(g, {
                          children: t(s.p, {
                            style: {
                              "--font-selector": "SW50ZXItU2VtaUJvbGQ=",
                              "--framer-font-family":
                                '"Inter", "Inter Placeholder", sans-serif',
                              "--framer-font-size": "14px",
                              "--framer-font-weight": "600",
                              "--framer-text-color":
                                "var(--extracted-r6o4lv, rgb(255, 34, 68))",
                            },
                            children: "Something went wrong",
                          }),
                        }),
                        fonts: ["Inter-SemiBold"],
                      },
                    },
                    x,
                    u
                  ),
                }),
              ie() &&
                t(s.div, {
                  className: "framer-koyn5t",
                  "data-framer-name": "Spinner",
                  layoutDependency: m,
                  layoutId: "TSRpW0fKn",
                  style: {
                    mask: "url('/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg') alpha no-repeat center / cover add",
                    WebkitMask:
                      "url('/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg') alpha no-repeat center / cover add",
                  },
                  children: t(Jt, {
                    __framer__loop: $t,
                    __framer__loopEffectEnabled: !0,
                    __framer__loopRepeatDelay: 0,
                    __framer__loopRepeatType: "loop",
                    __framer__loopTransition: Kt,
                    __perspectiveFX: !1,
                    __smartComponentFX: !0,
                    __targetOpacity: 1,
                    className: "framer-1i8gmvq",
                    "data-framer-name": "Conic",
                    layoutDependency: m,
                    layoutId: "vpx395P5Q",
                    style: {
                      background:
                        "conic-gradient(from 180deg at 50% 50%, var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255)) 0deg, var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255)) 360deg)",
                      backgroundColor:
                        "var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255))",
                      mask: "none",
                      WebkitMask: "none",
                    },
                    variants: {
                      ZC0fSZIV7: {
                        background:
                          "conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, 0) 7.208614864864882deg, rgb(255, 255, 255) 342deg)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        mask: "url('/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg') alpha no-repeat center / cover add",
                        WebkitMask:
                          "url('/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg') alpha no-repeat center / cover add",
                      },
                    },
                    children: t(s.div, {
                      className: "framer-mmc6x7",
                      "data-framer-name": "Rounding",
                      layoutDependency: m,
                      layoutId: "XJtM5MUBa",
                      style: {
                        backgroundColor:
                          "var(--token-6c1f4f47-c6b8-42b3-8425-b084bfb6b014, rgb(255, 255, 255))",
                        borderBottomLeftRadius: 1,
                        borderBottomRightRadius: 1,
                        borderTopLeftRadius: 1,
                        borderTopRightRadius: 1,
                      },
                      transformTemplate: er,
                    }),
                  }),
                }),
            ],
          }),
        }),
      }),
    });
  }),
  sr = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-bJR9r.framer-1886wi8, .framer-bJR9r .framer-1886wi8 { display: block; }",
    ".framer-bJR9r.framer-k88sog { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: 48px; justify-content: center; overflow: visible; padding: 8px 28px 8px 28px; position: relative; width: min-content; }",
    ".framer-bJR9r .framer-b2tsul { -webkit-user-select: none; flex: none; height: auto; position: relative; user-select: none; white-space: pre; width: auto; }",
    ".framer-bJR9r .framer-koyn5t { aspect-ratio: 1 / 1; flex: none; gap: 10px; height: var(--framer-aspect-ratio-supported, 20px); overflow: hidden; position: relative; width: 20px; }",
    ".framer-bJR9r .framer-1i8gmvq { bottom: 0px; flex: none; left: 0px; overflow: visible; position: absolute; right: 0px; top: 0px; }",
    ".framer-bJR9r .framer-mmc6x7 { aspect-ratio: 1 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 2px); left: 50%; overflow: visible; position: absolute; top: 0px; width: 2px; }",
    ".framer-bJR9r.framer-v-68eoks.framer-k88sog, .framer-bJR9r.framer-v-2qlwgx.framer-k88sog, .framer-bJR9r.framer-v-zyaqym.framer-k88sog, .framer-bJR9r.framer-v-13olis1.framer-k88sog { cursor: unset; }",
    ".framer-bJR9r.framer-v-68eoks .framer-1i8gmvq { overflow: hidden; }",
    ...Ye,
  ],
  de = T(ir, sr, "framer-bJR9r"),
  Ve = de;
de.displayName = "Button";
de.defaultProps = { height: 48, width: 147 };
k(de, {
  variant: {
    options: ["kP5aFx87g", "ZC0fSZIV7", "npPC_wYk_", "apOFYjT7g", "YjgqfXpv1"],
    optionTitles: ["Default", "Loading", "Disabled", "Success", "Error"],
    title: "Variant",
    type: n.Enum,
  },
});
M(
  de,
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
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
          url: "https://framerusercontent.com/assets/hyOgCu0Xnghbimh0pE8QTvtt2AU.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
          url: "https://framerusercontent.com/assets/NeGmSOXrPBfEFIy5YZeHq17LEDA.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+1F00-1FFF",
          url: "https://framerusercontent.com/assets/oYaAX5himiTPYuN8vLWnqBbfD2s.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange: "U+0370-03FF",
          url: "https://framerusercontent.com/assets/lEJLP4R0yuCaMCjSXYHtJw72M.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF",
          url: "https://framerusercontent.com/assets/cRJyLNuTJR5jbyKzGi33wU9cqIQ.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
          url: "https://framerusercontent.com/assets/1ZFS7N918ojhhd0nQWdj3jz4w.woff2",
          weight: "600",
        },
        {
          family: "Inter",
          source: "framer",
          style: "normal",
          unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB",
          url: "https://framerusercontent.com/assets/A0Wcc7NgXMjUuFdquHDrIZpzZw0.woff2",
          weight: "600",
        },
      ],
    },
    ...Q(Me),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var lr = re(Ve),
  fr = { z7ElXOW4X: { hover: !0 } },
  mr = ["z7ElXOW4X", "FiuSO6vJp"],
  cr = "framer-7IJWt",
  dr = { FiuSO6vJp: "framer-v-1v025b2", z7ElXOW4X: "framer-v-17pp9r1" };
function ke(e, ...a) {
  let r = {};
  return a?.forEach((o) => o && Object.assign(r, e[o])), r;
}
var pr = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  ur = ({ value: e, children: a }) => {
    let r = N(w),
      o = e ?? r.transition,
      l = L(() => ({ ...r, transition: o }), [JSON.stringify(o)]);
    return t(w.Provider, { value: l, children: a });
  },
  yr = s.create(g),
  hr = { Default: "z7ElXOW4X", Mobile: "FiuSO6vJp" },
  gr = ({ height: e, id: a, width: r, ...o }) => ({
    ...o,
    variant: hr[o.variant] ?? o.variant ?? "z7ElXOW4X",
  }),
  xr = (e, a) =>
    e.layoutDependency ? a.join("-") + e.layoutDependency : a.join("-"),
  br = X(function (e, a) {
    let r = V(null),
      o = a ?? r,
      l = W(),
      { activeLocale: y, setLocale: v } = B(),
      i = O(),
      { style: p, className: b, layoutId: F, variant: U, ...A } = gr(e),
      {
        baseVariant: x,
        classNames: C,
        clearLoadingGesture: c,
        gestureHandlers: d,
        gestureVariant: u,
        isLoading: f,
        setGestureState: E,
        setVariant: ue,
        variants: R,
      } = j({
        cycleOrder: mr,
        defaultVariant: "z7ElXOW4X",
        enabledGestures: fr,
        ref: o,
        variant: U,
        variantClassNames: dr,
      }),
      m = xr(e, R),
      I = _(cr, ...[]);
    return t(P, {
      id: F ?? l,
      children: h(s.div, {
        children: [
          t(yr, {
            animate: R,
            initial: !1,
            children: t(ur, {
              value: pr,
              children: t(s.div, {
                ...A,
                ...d,
                className: _(I, "framer-17pp9r1", b, C),
                "data-framer-name": "Default",
                layoutDependency: m,
                layoutId: "z7ElXOW4X",
                ref: o,
                style: { ...p },
                ...ke(
                  {
                    "z7ElXOW4X-hover": { "data-framer-name": void 0 },
                    FiuSO6vJp: { "data-framer-name": "Mobile" },
                  },
                  x,
                  u
                ),
                children: h(s.div, {
                  className: "framer-1yg9saq",
                  "data-framer-name": "Wrapper",
                  layoutDependency: m,
                  layoutId: "zvE_39iEq",
                  children: [
                    // Input de correo
                    t(Oe, {
                      className: "framer-doz9jg",
                      inputName: "Email",
                      layoutDependency: m,
                      layoutId: "A7HDteBjm",
                      placeholder: "Correo electrónico",
                      required: !0,
                      style: {
                        "--framer-input-background": "rgb(239, 240, 240)",
                        "--framer-input-border-bottom-width": "1px",
                        "--framer-input-border-color": "rgb(222, 223, 223)",
                        "--framer-input-border-left-width": "1px",
                        "--framer-input-border-radius-bottom-left": "64px",
                        "--framer-input-border-radius-bottom-right": "64px",
                        "--framer-input-border-radius-top-left": "64px",
                        "--framer-input-border-radius-top-right": "64px",
                        "--framer-input-border-right-width": "1px",
                        "--framer-input-border-style": "solid",
                        "--framer-input-border-top-width": "1px",
                        "--framer-input-font-color": "rgb(38, 36, 36)",
                        "--framer-input-icon-color": "rgb(153, 153, 153)",
                        "--framer-input-placeholder-color": "rgb(80, 80, 80)",
                      },
                      type: "email",
                      variants: {
                        "z7ElXOW4X-hover": {
                          "--framer-input-border-color": "rgb(80, 80, 80)",
                        },
                      },
                    }),
                    // Input de contraseña
                    t(Oe, {
                      className: "framer-doz9jg",
                      inputName: "Password",
                      layoutDependency: m,
                      layoutId: "A7HDteBjm-password",
                      placeholder: "Contraseña",
                      required: true,
                      style: {
                        "--framer-input-background": "rgb(239, 240, 240)",
                        "--framer-input-border-bottom-width": "1px",
                        "--framer-input-border-color": "rgb(222, 223, 223)",
                        "--framer-input-border-left-width": "1px",
                        "--framer-input-border-radius-bottom-left": "64px",
                        "--framer-input-border-radius-bottom-right": "64px",
                        "--framer-input-border-radius-top-left": "64px",
                        "--framer-input-border-radius-top-right": "64px",
                        "--framer-input-border-right-width": "1px",
                        "--framer-input-border-style": "solid",
                        "--framer-input-border-top-width": "1px",
                        "--framer-input-font-color": "rgb(38, 36, 36)",
                        "--framer-input-icon-color": "rgb(153, 153, 153)",
                        "--framer-input-placeholder-color": "rgb(80, 80, 80)",
                      },
                      type: "password",
                      variants: {
                        "z7ElXOW4X-hover": {
                          "--framer-input-border-color": "rgb(80, 80, 80)",
                        },
                      },
                    }),
                    // Botón
                    t(z, {
                      height: 48,
                      y: (i?.y || 0) + ((i?.height || 64) - 64) / 2 + 64 - 56,
                      ...ke(
                        {
                          FiuSO6vJp: {
                            height: 56,
                            width: i?.width || "100vw",
                            y:
                              (i?.y || 0) + ((i?.height || 118) - 118) / 2 + 62,
                          },
                        },
                        x,
                        u
                      ),
                      children: t(te, {
                        className: "framer-1t2ibeu-container",
                        "data-framer-name": "Form Input / Button",
                        layoutDependency: m,
                        layoutId: "b8alwrrZX-container",
                        name: "Form Input / Button",
                        nodeId: "b8alwrrZX",
                        rendersWithMotion: !0,
                        scopeId: "uHv6VdbcK",
                        children: t(Ve, {
                          height: "100%",
                          id: "b8alwrrZX",
                          layoutId: "b8alwrrZX",
                          name: "Form Input / Button",
                          variant: "kP5aFx87g",
                          width: "100%",
                          ...ke(
                            {
                              FiuSO6vJp: {
                                style: { height: "100%", width: "100%" },
                              },
                            },
                            x,
                            u
                          ),
                        }),
                      }),
                    }),
                  ],
                }),
              }),
            }),
          }),
          // p && anchor
          t("div", {
            style: {
              width: "100%",
              marginTop: "30px",
              textAlign: "center",
            },
            children: t("p", {
              style: {
                fontSize: "14px",
                color: "#555",
              },
              children: [
                "¿No tienes cuenta? ",
                t("a", {
                  href: "/pages/register.html",
                  style: {
                    color: "#6092D5",
                    textDecoration: "none",
                    fontWeight: "600",
                  },
                  children: "Crear una",
                }),
              ],
            }),
          }),
        ],
      }),
    });
  }),
  wr = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-7IJWt.framer-lowo5f, .framer-7IJWt .framer-lowo5f { display: block; }",
    ".framer-7IJWt.framer-17pp9r1 { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 6px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 609px; }",
    ".framer-7IJWt .framer-1yg9saq { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 15px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: 100%; }",
    '.framer-7IJWt .framer-doz9jg { --framer-input-focused-border-color: var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, #505050); --framer-input-focused-border-style: solid; --framer-input-focused-border-width: 1px; --framer-input-font-family: "Inter"; --framer-input-font-letter-spacing: 0em; --framer-input-font-line-height: 2%; --framer-input-font-size: 16px; --framer-input-font-weight: 400; --framer-input-padding: 8px 8px 8px 20px; flex: 1 0 0px; height: 64px; position: relative; width: 1px; }',
    ".framer-7IJWt .framer-1t2ibeu-container { bottom: 8px; flex: none; height: auto; position: absolute; right: 8px; width: auto; z-index: 1; }",
    ".framer-7IJWt.framer-v-1v025b2.framer-17pp9r1 { cursor: unset; }",
    ".framer-7IJWt.framer-v-1v025b2 .framer-1yg9saq { flex-direction: column; }",
    ".framer-7IJWt.framer-v-1v025b2 .framer-doz9jg { flex: none; height: 56px; width: 100%; }",
    ".framer-7IJWt.framer-v-1v025b2 .framer-1t2ibeu-container { bottom: unset; height: 56px; position: relative; right: unset; width: 100%; }",
  ],
  pe = T(br, wr, "framer-7IJWt"),
  ca = pe;
pe.displayName = "Form/Input Field";
pe.defaultProps = { height: 64, width: 609 };
k(pe, {
  variant: {
    options: ["z7ElXOW4X", "FiuSO6vJp"],
    optionTitles: ["Default", "Mobile"],
    title: "Variant",
    type: n.Enum,
  },
});
M(
  pe,
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
      ],
    },
    ...lr,
  ],
  { supportsExplicitInterCodegen: !0 }
);
function Fe({ title: e, subtitle: a, maxWidth: r = 0 }) {
  return h("div", {
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      placeContent: "center",
      placeItems: "center",
      flexDirection: "column",
      gap: 16,
      backgroundColor: "rgba(136, 85, 255, 0.1)",
      borderRadius: 6,
      border: "1px dashed rgb(136, 85, 255)",
      color: "rgb(136, 85, 255)",
      fontSize: 16,
      padding: 20,
      minHeight: 200,
      maxWidth: r || void 0,
    },
    children: [
      t("p", {
        style: { margin: 0, fontWeight: 600, textAlign: "center" },
        children: e,
      }),
      t("p", {
        style: {
          margin: 0,
          opacity: 0.7,
          lineHeight: 1.5,
          textAlign: "center",
        },
        children: a,
      }),
    ],
  });
}
Fe.displayName = "Empty State";
var $ = ["years", "months", "days", "hours", "minutes", "seconds"],
  _r = [365, 12, 30, 24, 60, 60],
  Qe = 6;
function vr(e, a, r, o, l) {
  var y = new Date(e);
  return (
    y.setHours(a + (l === "PM" ? 12 : 0)), y.setMinutes(r), y.setSeconds(o), y
  );
}
function Ke(e) {
  let { time: a, labels: r, units: o } = e,
    l = vr(e.date, a.hour, a.minute, a.second, a.time),
    y = Ce.current() === Ce.canvas,
    [v, i] = Ee(p());
  if (
    (ye(() => {
      let c = setTimeout(() => {
        i(p());
      }, 1e3);
      return () => clearTimeout(c);
    }),
    y && !e.date)
  )
    return t(Fe, {
      title: "Set a date value.",
      subtitle:
        "Use the properties panel on the right to connect a date value.",
      maxWidth: 500,
    });
  function p() {
    let c = new Date();
    c.setDate(c.getDate() - 1);
    let d = l - c,
      u = [0, 0, 0, 0, 0, 0, !1];
    if (d > 0) {
      u = [
        Math.floor(d / (1e3 * 60 * 60 * 24 * 365)),
        Math.floor((d / (1e3 * 60 * 60 * 24 * 30)) % 12),
        Math.floor((d / (1e3 * 60 * 60 * 24)) % 30),
        Math.floor((d / (1e3 * 60 * 60)) % 24),
        Math.floor((d / 1e3 / 60) % 60),
        Math.floor((d / 1e3) % 60),
        !1,
      ];
      for (let f = 0; f < $.length; f++)
        !o[$[f]] &&
          f < $.length - 1 &&
          ((u[f + 1] += u[f] * _r[f + 1]), (u[f] = null));
      if ((o.seconds || (u[5] = null), !o.zeroUnits))
        for (let f = 0; f < $.length && u[f] <= 0; f++) u[f] = null;
    }
    return (u[Qe] = d > 0), u;
  }
  let b = r?.location,
    F = r
      ? {
          display: "flex",
          gap: r.gap,
          flexDirection: b == "inline" ? "row" : "column",
          alignItems: "center",
          minWidth: `${r.minWidth}px`,
          background: r.background,
          padding: `${r.paddingY}px ${r.paddingX}px`,
          borderRadius: r.radius,
        }
      : { minWidth: "64px", display: "flex", alignItems: "center" },
    U = r ? { color: r.fontColor, margin: 0, ...r.font } : {},
    A = {
      color: r?.fontColor,
      margin: 0,
      display: "flex",
      alignItems: "center",
      ...r?.font,
    },
    x = b == "above",
    C = [];
  for (let c = 0; c < $.length; c++)
    if (v[c] != null) {
      let d = $[c],
        u = null;
      if (r) {
        let E = d;
        r.style == "short"
          ? (E = d[0])
          : r.style == "full" && v[c] == 1 && (E = d.slice(0, -1)),
          (u = t("p", { style: U, children: E }));
      }
      let f = `${v[c]}`;
      C.push(h("div", { style: F, children: [x ? "" : f, u, x ? f : ""] }, d)),
        c < $.length - 1 &&
          v[c + 1] != null &&
          C.push(
            t(
              "div",
              {
                style: {
                  minWidth: "auto",
                  display: "flex",
                  alignItems: "center",
                },
                children: t("svg", {
                  width: "13",
                  height: "24",
                  viewBox: "0 0 13 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: t("path", {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M7.70431 7.5C7.75359 7.49998 7.80239 7.50966 7.84792 7.52851C7.89345 7.54736 7.93482 7.57499 7.96967 7.60983C8.00451 7.64468 8.03214 7.68605 8.05099 7.73158C8.06984 7.77711 8.07952 7.82591 8.0795 7.87519V10.0875C8.07954 10.1368 8.06986 10.1856 8.05102 10.2311C8.03218 10.2767 8.00454 10.3181 7.9697 10.3529C7.93485 10.3878 7.89348 10.4154 7.84794 10.4343C7.8024 10.4531 7.7536 10.4628 7.70431 10.4628H5.46884C5.41956 10.4628 5.37075 10.4531 5.32522 10.4342C5.27969 10.4154 5.23832 10.3877 5.20349 10.3528C5.16865 10.318 5.14103 10.2766 5.1222 10.231C5.10337 10.1855 5.0937 10.1367 5.09375 10.0874V7.87519C5.09373 7.82592 5.10341 7.77713 5.12225 7.7316C5.14109 7.68608 5.16872 7.64471 5.20355 7.60987C5.23839 7.57503 5.27975 7.54739 5.32527 7.52854C5.37079 7.50968 5.41957 7.49999 5.46884 7.5H7.70431ZM7.70431 13.5C7.75359 13.5 7.80239 13.5097 7.84792 13.5285C7.89345 13.5474 7.93482 13.575 7.96967 13.6098C8.00451 13.6447 8.03214 13.686 8.05099 13.7316C8.06984 13.7771 8.07952 13.8259 8.0795 13.8752V16.0875C8.07954 16.1368 8.06986 16.1856 8.05102 16.2311C8.03218 16.2767 8.00454 16.3181 7.9697 16.3529C7.93485 16.3878 7.89348 16.4154 7.84794 16.4343C7.8024 16.4531 7.7536 16.4628 7.70431 16.4628H5.46884C5.41956 16.4628 5.37075 16.4531 5.32522 16.4342C5.27969 16.4154 5.23832 16.3877 5.20349 16.3528C5.16865 16.318 5.14103 16.2766 5.1222 16.231C5.10337 16.1855 5.0937 16.1367 5.09375 16.0874V13.8752C5.09373 13.8259 5.10341 13.7771 5.12225 13.7316C5.14109 13.6861 5.16872 13.6447 5.20355 13.6099C5.23839 13.575 5.27975 13.5474 5.32527 13.5285C5.37079 13.5097 5.41957 13.5 5.46884 13.5H7.70431Z",
                    fill: "#262424",
                  }),
                }),
              },
              `colon-${c}`
            )
          );
    }
  return y && e.finishedStyle == "layer" && !e.finished?.[0]
    ? t(Fe, {
        title: "Connect a finished layer.",
        subtitle:
          'Use the handle on the right side of the component to connect a layer to display when the countdown finishes, or change the finished type to "Text"',
        maxWidth: 500,
      })
    : t(Xe, {
        children: v[Qe]
          ? t("div", {
              style: {
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: e.font ? e.font.textAlign : "start",
                gap: e.gap,
                color: e.fontColor,
                textTransform: r ? r.case : "capitalize",
                whiteSpace: "pre-wrap",
                userSelect: e.textSelect ? "auto" : "none",
                ...e.font,
              },
              children: C,
            })
          : e.finishedStyle == "text"
          ? t("p", {
              style: { margin: 0, color: e.fontColor, ...e.font },
              children: e.finishedText,
            })
          : e.finished,
      });
}
var D = {
  location: "inline",
  style: "full",
  case: "capitalized",
  gap: 4,
  fontColor: "#000",
  background: "transparent",
  paddingX: 0,
  paddingY: 0,
  radius: 0,
  minWidth: 64,
};
k(Ke, {
  date: { type: n.Date },
  time: {
    type: n.Object,
    controls: {
      hour: { type: n.Number, defaultValue: 12, min: 1, max: 12, step: 1 },
      minute: { type: n.Number, defaultValue: 0, min: 0, max: 59, step: 1 },
      second: { type: n.Number, defaultValue: 0, min: 0, max: 59, step: 1 },
      time: {
        type: n.Enum,
        defaultValue: "PM",
        options: ["AM", "PM"],
        displaySegmentedControl: !0,
      },
    },
  },
  units: {
    type: n.Object,
    buttonTitle: "Options",
    controls: {
      years: { type: n.Boolean, defaultValue: !0 },
      months: { type: n.Boolean, defaultValue: !0 },
      days: { type: n.Boolean, defaultValue: !0 },
      hours: { type: n.Boolean, defaultValue: !0 },
      minutes: { type: n.Boolean, defaultValue: !0 },
      seconds: { type: n.Boolean, defaultValue: !0 },
      zeroUnits: {
        type: n.Boolean,
        defaultValue: !1,
        enabledTitle: "Show",
        disabledTitle: "Hide",
        description:
          "Hides units left of the greatest non-zero unit. Ex. If there are 2 hours left, then years, months, and days will be hidden.",
      },
    },
  },
  labels: {
    type: n.Object,
    defaultValue: D,
    optional: !0,
    buttonTitle: "Options",
    controls: {
      location: {
        type: n.Enum,
        defaultValue: D.location,
        options: ["inline", "above", "below"],
        optionTitles: ["Inline", "Above", "Below"],
        displaySegmentedControl: !0,
        segmentedControlDirection: "vertical",
      },
      style: {
        type: n.Enum,
        defaultValue: D.style,
        options: ["full", "short"],
        optionTitles: ["Full", "Short"],
        displaySegmentedControl: !0,
      },
      case: {
        type: n.Enum,
        defaultValue: D.case,
        options: ["capitalize", "uppercase", "lowercase"],
        optionTitles: ["Capitalized", "UPPERCASE", "lowercase"],
      },
      gap: { type: n.Number, defaultValue: D.gap, min: 0, step: 1 },
      fontColor: { type: n.Color, optional: !0, defaultValue: D.fontColor },
      font: { type: "font", controls: "extended" },
      background: { type: n.Color, defaultValue: D.background },
      paddingX: {
        type: n.Number,
        defaultValue: D.paddingX,
        min: 0,
        title: "Padding X",
      },
      paddingY: {
        type: n.Number,
        defaultValue: D.paddingY,
        min: 0,
        title: "Padding Y",
      },
      radius: {
        type: n.Number,
        defaultValue: D.radius,
        min: 0,
        title: "Radius",
      },
      minWidth: {
        type: n.Number,
        defaultValue: D.minWidth,
        min: 0,
        title: "Min Width",
      },
    },
  },
  separator: {
    type: n.String,
    defaultValue: ", ",
    hidden(e) {
      return e.labels ? e.labels.location !== "inline" : !1;
    },
  },
  gap: { type: n.Number, defaultValue: 0, min: 0, step: 1 },
  fontColor: { type: n.Color, defaultValue: "#000" },
  font: {
    type: "font",
    controls: "extended",
    defaultFontType: "sans-serif",
    defaultValue: { fontSize: 16, lineHeight: 1 },
  },
  textSelect: { type: n.Boolean, defaultValue: !0 },
  finishedStyle: {
    type: n.Enum,
    defaultValue: "text",
    options: ["text", "layer"],
    optionTitles: ["Text", "Layer"],
    displaySegmentedControl: !0,
    title: "Finished",
  },
  finishedText: {
    type: n.String,
    defaultValue: "Countdown finished!",
    title: "Text",
    hidden: (e) => e.finishedStyle !== "text",
  },
  finished: {
    type: n.ComponentInstance,
    description: "Displays when time = 0",
    title: "Layer",
    hidden: (e) => e.finishedStyle !== "layer",
  },
});
he.loadFonts([
  "GF;Roboto Serif-regular",
  "GF;Roboto Serif-700",
  "GF;Roboto Serif-700italic",
  "GF;Roboto Serif-italic",
]);
var Ra = [
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
  Ia = [
    '.framer-W56gW .framer-styles-preset-eqwuq7:not(.rich-text-wrapper), .framer-W56gW .framer-styles-preset-eqwuq7.rich-text-wrapper h2 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 48px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 40px; --framer-text-alignment: center; --framer-text-color: #262424; --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; }',
    '@media (max-width: 1279px) and (min-width: 810px) { .framer-W56gW .framer-styles-preset-eqwuq7:not(.rich-text-wrapper), .framer-W56gW .framer-styles-preset-eqwuq7.rich-text-wrapper h2 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 44px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 40px; --framer-text-alignment: center; --framer-text-color: #262424; --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; } }',
    '@media (max-width: 809px) and (min-width: 0px) { .framer-W56gW .framer-styles-preset-eqwuq7:not(.rich-text-wrapper), .framer-W56gW .framer-styles-preset-eqwuq7.rich-text-wrapper h2 { --framer-font-family: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-bold-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-family-italic: "Roboto Serif", "Roboto Serif Placeholder", serif; --framer-font-open-type-features: normal; --framer-font-size: 40px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-style-bold-italic: italic; --framer-font-style-italic: italic; --framer-font-variation-axes: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-font-weight-bold-italic: 700; --framer-font-weight-italic: 400; --framer-letter-spacing: -0.04em; --framer-line-height: 130%; --framer-paragraph-spacing: 40px; --framer-text-alignment: center; --framer-text-color: #262424; --framer-text-decoration: none; --framer-text-stroke-color: initial; --framer-text-stroke-width: initial; --framer-text-transform: none; } }',
  ],
  Sa = "framer-W56gW";
export { Wr as a, Gr as b, ca as c, Ke as d, Ra as e, Ia as f, Sa as g };

