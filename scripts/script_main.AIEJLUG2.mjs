import { a as Re } from "./chunk-MSJGTFPH.mjs";
import { a as K, b as $, c as ee } from "./chunk-NT3OEFHM.mjs";
import { a as ut, b as ht, c as yt } from "./chunk-V5T3UH2U.mjs";
import {
  $ as tt,
  Ba as Q,
  C as Oe,
  D as qe,
  E as Ie,
  F as z,
  G as he,
  Ga as A,
  H as Je,
  I as Ge,
  J as C,
  K as Ye,
  Ka as B,
  L as Ze,
  La as O,
  M as ze,
  Ma as Z,
  N as Xe,
  Na as pt,
  O as Ue,
  P as Ce,
  Q as Ke,
  R as w,
  S as $e,
  U as X,
  X as h,
  Y as et,
  _ as E,
  b as p,
  c as Pe,
  d as T,
  e as k,
  f as Le,
  g as He,
  ga as rt,
  h as be,
  ha as j,
  i as We,
  ia as R,
  j as L,
  ja as ce,
  k as je,
  ka as M,
  l as N,
  la as at,
  ma as nt,
  n as H,
  na as ot,
  o as U,
  oa as st,
  p as Qe,
  qa as it,
  ra as ye,
  s as e,
  t as W,
  ta as ct,
  ua as lt,
  v as F,
  w as s,
  wa as mt,
  x as D,
  xa as dt,
  ya as ft,
} from "./chunk-TLFILSQI.mjs";
import "./chunk-HZL4YIMB.mjs";
import { b as Y, c as l } from "./chunk-A3IIQ6X3.mjs";

var kt = "default" in Ie ? Oe : Ie,
  ge = {},
  gt = kt;
ge.createRoot = gt.createRoot;
ge.hydrateRoot = gt.hydrateRoot;
var Ve = ge.createRoot,
  xt = ge.hydrateRoot;
var Dt = { BWstfMgcc: { hover: !0 } },
  Et = "framer-KWwJG",
  Bt = { BWstfMgcc: "framer-v-kclret" };
function wt(r, ...a) {
  let n = {};
  return a?.forEach((t) => t && Object.assign(n, r[t])), n;
}
var Tt = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  Mt = ({ value: r, children: a }) => {
    let n = L(F),
      t = r ?? n.transition,
      o = H(() => ({ ...n, transition: t }), [JSON.stringify(t)]);
    return e(F.Provider, { value: o, children: a });
  },
  At = s.create(p),
  Pt = ({ height: r, id: a, link: n, textLink: t, width: o, ...c }) => ({
    ...c,
    F2jMG9YJu: t ?? c.F2jMG9YJu ?? "Text Link",
    XWH7sTXpS: n ?? c.XWH7sTXpS,
  }),
  Lt = (r, a) =>
    r.layoutDependency ? a.join("-") + r.layoutDependency : a.join("-"),
  Ht = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      m = j(),
      {
        style: y,
        className: i,
        layoutId: d,
        variant: v,
        XWH7sTXpS: b,
        F2jMG9YJu: g,
        ...V
      } = Pt(r),
      {
        baseVariant: _,
        classNames: f,
        clearLoadingGesture: I,
        gestureHandlers: te,
        gestureVariant: q,
        isLoading: ne,
        setGestureState: J,
        setVariant: x,
        variants: G,
      } = Q({
        defaultVariant: "BWstfMgcc",
        enabledGestures: Dt,
        ref: t,
        variant: v,
        variantClassNames: Bt,
      }),
      S = Lt(r, G),
      P = h(Et, ...[ee]);
    return e(D, {
      id: d ?? o,
      children: e(At, {
        animate: G,
        initial: !1,
        children: e(Mt, {
          value: Tt,
          children: e(ye, {
            href: b,
            motionChild: !0,
            nodeId: "BWstfMgcc",
            scopeId: "by5WTA3RE",
            children: e(s.a, {
              ...V,
              ...te,
              className: `${h(P, "framer-kclret", i, f)} framer-lhh2f5`,
              "data-framer-name": "Variant 1",
              layoutDependency: S,
              layoutId: "BWstfMgcc",
              ref: t,
              style: { ...y },
              ...wt(
                { "BWstfMgcc-hover": { "data-framer-name": void 0 } },
                _,
                q
              ),
              children: e(A, {
                __fromCanvasComponent: !0,
                children: e(p, {
                  children: e(s.p, {
                    className: "framer-styles-preset-1qnc6s4",
                    "data-styles-preset": "NTWwFC9H4",
                    style: { "--framer-text-alignment": "center" },
                    children: "Text Link",
                  }),
                }),
                className: "framer-uowdqu",
                "data-framer-name": "Webflow Templates",
                fonts: ["Inter"],
                layoutDependency: S,
                layoutId: "qC3eEM1MS",
                style: { "--framer-paragraph-spacing": "0px" },
                text: g,
                variants: {
                  "BWstfMgcc-hover": {
                    "--extracted-r6o4lv":
                      "var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, rgb(38, 36, 36))",
                  },
                },
                verticalAlignment: "top",
                withExternalLayout: !0,
                ...wt(
                  {
                    "BWstfMgcc-hover": {
                      children: e(p, {
                        children: e(s.p, {
                          className: "framer-styles-preset-1qnc6s4",
                          "data-styles-preset": "NTWwFC9H4",
                          style: {
                            "--framer-text-alignment": "center",
                            "--framer-text-color":
                              "var(--extracted-r6o4lv, var(--token-a0ae0bec-9f96-425e-ad3d-e9a756769361, rgb(38, 36, 36)))",
                          },
                          children: "Text Link",
                        }),
                      }),
                    },
                  },
                  _,
                  q
                ),
              }),
            }),
          }),
        }),
      }),
    });
  }),
  Wt = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-KWwJG.framer-lhh2f5, .framer-KWwJG .framer-lhh2f5 { display: block; }",
    ".framer-KWwJG.framer-kclret { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 6px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; text-decoration: none; width: min-content; }",
    ".framer-KWwJG .framer-uowdqu { flex: none; height: auto; position: relative; white-space: pre; width: auto; }",
    "@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-KWwJG.framer-kclret { gap: 0px; } .framer-KWwJG.framer-kclret > * { margin: 0px; margin-left: calc(6px / 2); margin-right: calc(6px / 2); } .framer-KWwJG.framer-kclret > :first-child { margin-left: 0px; } .framer-KWwJG.framer-kclret > :last-child { margin-right: 0px; } }",
    ...$,
  ],
  le = E(Ht, Wt, "framer-KWwJG"),
  me = le;
le.displayName = "Text link";
le.defaultProps = { height: 24, width: 68 };
X(le, {
  XWH7sTXpS: { title: "Link", type: w.Link },
  F2jMG9YJu: {
    defaultValue: "Text Link",
    displayTextArea: !1,
    title: "Text Link",
    type: w.String,
  },
});
B(
  le,
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
    ...Z(K),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var jt = O(me),
  Qt = ["oLGWHAtsH", "YTS39S5rs", "QTKJtzh7k"],
  Ot = "framer-05PgM",
  qt = {
    oLGWHAtsH: "framer-v-yq8c5e",
    QTKJtzh7k: "framer-v-15njwyd",
    YTS39S5rs: "framer-v-9fdjq7",
  };
function xe(r, ...a) {
  let n = {};
  return a?.forEach((t) => t && Object.assign(n, r[t])), n;
}
var Jt = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  Gt = ({ value: r, children: a }) => {
    let n = L(F),
      t = r ?? n.transition,
      o = H(() => ({ ...n, transition: t }), [JSON.stringify(t)]);
    return e(F.Provider, { value: o, children: a });
  },
  Yt = s.create(p),
  Zt = { Desktop: "oLGWHAtsH", Mobile: "QTKJtzh7k", Tablet: "YTS39S5rs" },
  zt = ({ height: r, id: a, width: n, ...t }) => ({
    ...t,
    variant: Zt[t.variant] ?? t.variant ?? "oLGWHAtsH",
  }),
  Xt = (r, a) =>
    r.layoutDependency ? a.join("-") + r.layoutDependency : a.join("-"),
  Kt = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      m = j(),
      { style: y, className: i, layoutId: d, variant: v, ...b } = zt(r),
      {
        baseVariant: g,
        classNames: V,
        clearLoadingGesture: _,
        gestureHandlers: f,
        gestureVariant: I,
        isLoading: te,
        setGestureState: q,
        setVariant: ne,
        variants: J,
      } = Q({
        cycleOrder: Qt,
        defaultVariant: "oLGWHAtsH",
        ref: t,
        variant: v,
        variantClassNames: qt,
      }),
      x = Xt(r, J),
      S = h(Ot, ...[ee, yt]),
      oe = () => g !== "QTKJtzh7k";
    return e(D, {
      id: d ?? o,
      children: e(Yt, {
        animate: J,
        initial: !1,
        children: e(Gt, {
          value: Jt,
          children: e(s.footer, {
            ...b,
            ...f,
            className: h(S, "framer-yq8c5e", i, V),
            "data-framer-name": "Desktop",
            layoutDependency: x,
            layoutId: "oLGWHAtsH",
            ref: t,
            style: { backgroundColor: "rgb(247, 247, 247)", ...y },
            ...xe(
              {
                QTKJtzh7k: { "data-framer-name": "Mobile" },
                YTS39S5rs: { "data-framer-name": "Tablet" },
              },
              g,
              I
            ),
            children: W(s.div, {
              className: "framer-mcjmqp",
              "data-framer-name": "container",
              layoutDependency: x,
              layoutId: "hrc8lL7Zl",
              children: [
                W(s.div, {
                  className: "framer-193upl1",
                  "data-framer-name": "top",
                  layoutDependency: x,
                  layoutId: "vojMbKBCF",
                  children: [
                    e(R, {
                      height: 24,
                      y: (m?.y || 0) + 80 + 0 + 0 + 0 + 0,
                      ...xe(
                        {
                          QTKJtzh7k: { y: void 0 },
                          YTS39S5rs: { y: (m?.y || 0) + 72 + 0 + 0 + 0 + 0 },
                        },
                        g,
                        I
                      ),
                      children: e(M, {
                        className: "framer-svps5o-container",
                        layoutDependency: x,
                        layoutId: "BUGSxZ3MF-container",
                        nodeId: "BUGSxZ3MF",
                        rendersWithMotion: !0,
                        scopeId: "DpoiTrBZF",
                        children: e(me, {
                          F2jMG9YJu: "By BStudio",
                          height: "100%",
                          id: "BUGSxZ3MF",
                          layoutId: "BUGSxZ3MF",
                          width: "100%",
                          XWH7sTXpS: "https://www.bstudio.site/",
                        }),
                      }),
                    }),
                  ],
                }),
                W(s.div, {
                  className: "framer-1mkq7p6",
                  "data-framer-name": "bottom",
                  layoutDependency: x,
                  layoutId: "qu9NUz8wT",
                  children: [
                    e(A, {
                      __fromCanvasComponent: !0,
                      children: e(p, {
                        children: e(s.p, {
                          className: "framer-styles-preset-1qnc6s4",
                          "data-styles-preset": "NTWwFC9H4",
                          children: "\xA9 2025 Yabla",
                        }),
                      }),
                      className: "framer-jjjhv0",
                      "data-framer-name": "\xA9 2025 Yabla",
                      fonts: ["Inter"],
                      layoutDependency: x,
                      layoutId: "lFJ3_UNwa",
                      style: { "--framer-paragraph-spacing": "0px" },
                      verticalAlignment: "top",
                      withExternalLayout: !0,
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
      }),
    });
  }),
  $t = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-05PgM.framer-lcgf3y, .framer-05PgM .framer-lcgf3y { display: block; }",
    ".framer-05PgM.framer-yq8c5e { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: flex-start; overflow: hidden; padding: 80px 32px 80px 32px; position: relative; width: 1280px; }",
    ".framer-05PgM .framer-mcjmqp { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: flex-start; max-width: 428px; overflow: visible; padding: 0px; position: relative; width: 100%; }",
    ".framer-05PgM .framer-193upl1 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 12px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: min-content; }",
    ".framer-05PgM .framer-6gagud-container, .framer-05PgM .framer-1yl5lfq-container, .framer-05PgM .framer-svps5o-container { flex: none; height: auto; position: relative; width: auto; }",
    ".framer-05PgM .framer-fn9p8t, .framer-05PgM .framer-1f91mrl, .framer-05PgM .framer-jjjhv0, .framer-05PgM .framer-2d128d { flex: none; height: auto; position: relative; white-space: pre; width: auto; }",
    ".framer-05PgM .framer-1mkq7p6 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 4px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: min-content; }",
    ".framer-05PgM.framer-v-9fdjq7.framer-yq8c5e { padding: 72px 32px 72px 32px; width: 810px; }",
    ".framer-05PgM.framer-v-15njwyd.framer-yq8c5e { padding: 48px 16px 48px 16px; width: 390px; }",
    ".framer-05PgM.framer-v-15njwyd .framer-193upl1 { flex-wrap: wrap; justify-content: center; }",
    ...$,
    ...ht,
  ],
  de = E(Kt, $t, "framer-05PgM"),
  Se = de;
de.displayName = "Footer";
de.defaultProps = { height: 228, width: 1280 };
X(de, {
  variant: {
    options: ["oLGWHAtsH", "YTS39S5rs", "QTKJtzh7k"],
    optionTitles: ["Desktop", "Tablet", "Mobile"],
    title: "Variant",
    type: w.Enum,
  },
});
B(
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
      ],
    },
    ...jt,
    ...Z(K),
    ...Z(ut),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var er = { VDJ8P38CO: { hover: !0 } },
  tr = "framer-tqUEj",
  rr = { VDJ8P38CO: "framer-v-xl0t0i" };
function vt(r, ...a) {
  let n = {};
  return a?.forEach((t) => t && Object.assign(n, r[t])), n;
}
var ar = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: "spring" },
  nr = ({ value: r, children: a }) => {
    let n = L(F),
      t = r ?? n.transition,
      o = H(() => ({ ...n, transition: t }), [JSON.stringify(t)]);
    return e(F.Provider, { value: o, children: a });
  },
  or = s.create(p),
  sr = ({ height: r, id: a, link: n, title: t, width: o, ...c }) => ({
    ...c,
    nfbnB0drL: t ?? c.nfbnB0drL ?? "Item 1",
    VP1HNbFNP: n ?? c.VP1HNbFNP,
  }),
  ir = (r, a) =>
    r.layoutDependency ? a.join("-") + r.layoutDependency : a.join("-"),
  cr = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      m = j(),
      {
        style: y,
        className: i,
        layoutId: d,
        variant: v,
        nfbnB0drL: b,
        VP1HNbFNP: g,
        ...V
      } = sr(r),
      {
        baseVariant: _,
        classNames: f,
        clearLoadingGesture: I,
        gestureHandlers: te,
        gestureVariant: q,
        isLoading: ne,
        setGestureState: J,
        setVariant: x,
        variants: G,
      } = Q({
        defaultVariant: "VDJ8P38CO",
        enabledGestures: er,
        ref: t,
        variant: v,
        variantClassNames: rr,
      }),
      S = ir(r, G),
      P = h(tr, ...[ee]);
    return e(D, {
      id: d ?? o,
      children: e(or, {
        animate: G,
        initial: !1,
        children: e(nr, {
          value: ar,
          children: e(ye, {
            href: g,
            motionChild: !0,
            nodeId: "VDJ8P38CO",
            scopeId: "wepnZ7Ax5",
            children: e(s.a, {
              ...V,
              ...te,
              className: `${h(P, "framer-xl0t0i", i, f)} framer-1d8ux6k`,
              "data-framer-name": "Variant 1",
              layoutDependency: S,
              layoutId: "VDJ8P38CO",
              ref: t,
              style: { ...y },
              ...vt(
                { "VDJ8P38CO-hover": { "data-framer-name": void 0 } },
                _,
                q
              ),
            }),
          }),
        }),
      }),
    });
  }),
  lr = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-tqUEj.framer-1d8ux6k, .framer-tqUEj .framer-1d8ux6k { display: block; }",
    ".framer-tqUEj.framer-xl0t0i { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; text-decoration: none; width: 160px; }",
    ".framer-tqUEj .framer-8881gn { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: flex-start; overflow: hidden; padding: 10px 12px 10px 16px; position: relative; width: 100%; will-change: var(--framer-will-change-override, transform); }",
    ".framer-tqUEj .framer-o4a8ac { flex: none; height: auto; position: relative; white-space: pre; width: auto; }",
    ".framer-tqUEj.framer-v-xl0t0i.hover.framer-xl0t0i { width: min-content; }",
    ".framer-tqUEj.framer-v-xl0t0i.hover .framer-8881gn { width: 160px; }",
    ...$,
  ],
  fe = E(cr, lr, "framer-tqUEj"),
  pe = fe;
fe.displayName = "Item";
fe.defaultProps = { height: 44, width: 160 };
X(fe, {
  nfbnB0drL: {
    defaultValue: "Item 1",
    displayTextArea: !1,
    title: "Title",
    type: w.String,
  },
  VP1HNbFNP: { title: "Link", type: w.Link },
});
B(
  fe,
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
    ...Z(K),
  ],
  { supportsExplicitInterCodegen: !0 }
);
var mr = O(Re),
  dr = O(pe),
  fr = { oHn_7UBoQ: { hover: !0 } },
  pr = ["oHn_7UBoQ", "tBfMMYwR6"],
  ur = "",
  hr = { oHn_7UBoQ: "framer-v-1ox3b7m", tBfMMYwR6: "framer-v-3843mn" };
function yr(r, ...a) {
  let n = {};
  return a?.forEach((t) => t && Object.assign(n, r[t])), n;
}
var gr = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: "spring" },
  xr = (r, a) => `translateX(-50%) ${a}`,
  wr = ({ value: r, children: a }) => {
    let n = L(F),
      t = r ?? n.transition,
      o = H(() => ({ ...n, transition: t }), [JSON.stringify(t)]);
    return e(F.Provider, { value: o, children: a });
  },
  vr = s.create(p),
  Fr = { Closed: "oHn_7UBoQ", Open: "tBfMMYwR6" },
  br = ({
    height: r,
    id: a,
    link1: n,
    link2: t,
    link3: o,
    option1: c,
    option2: u,
    option3: m,
    title: y,
    width: i,
    ...d
  }) => ({
    ...d,
    bVMtOG5rc: o ?? d.bVMtOG5rc,
    cmrI53QhM: u ?? d.cmrI53QhM ?? "Is really",
    cs3V9ph3I: n ?? d.cs3V9ph3I,
    jSXro2o1U: c ?? d.jSXro2o1U ?? "Framer",
    OHkdmIcVE: m ?? d.OHkdmIcVE ?? "Good",
    variant: Fr[d.variant] ?? d.variant ?? "oHn_7UBoQ",
    wh9uVJ7Ik: t ?? d.wh9uVJ7Ik,
    Z_oIIbpJv: y ?? d.Z_oIIbpJv ?? "Dropdown",
  }),
  Ir = (r, a) =>
    r.layoutDependency ? a.join("-") + r.layoutDependency : a.join("-"),
  Ur = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      m = j(),
      {
        style: y,
        className: i,
        layoutId: d,
        variant: v,
        Z_oIIbpJv: b,
        jSXro2o1U: g,
        cmrI53QhM: V,
        OHkdmIcVE: _,
        cs3V9ph3I: f,
        wh9uVJ7Ik: I,
        bVMtOG5rc: te,
        ...q
      } = br(r),
      {
        baseVariant: ne,
        classNames: J,
        clearLoadingGesture: x,
        gestureHandlers: G,
        gestureVariant: S,
        isLoading: oe,
        setGestureState: P,
        setVariant: Te,
        variants: Me,
      } = Q({
        cycleOrder: pr,
        defaultVariant: "oHn_7UBoQ",
        enabledGestures: fr,
        ref: t,
        variant: v,
        variantClassNames: hr,
      }),
      re = Ir(r, Me),
      { activeVariantCallback: Ae, delay: zr } = mt(ne),
      Rt = Ae(async (...St) => {
        P({ isPressed: !1 }), Te("tBfMMYwR6");
      }),
      Vt = Ae(async (...St) => {
        P({ isPressed: !1 }), Te("oHn_7UBoQ");
      }),
      _t = h(ur, ...[ee]);
    return e(D, {
      id: d ?? o,
      children: e(vr, {
        animate: Me,
        initial: !1,
        children: e(wr, {
          value: gr,
          children: W(s.div, {
            ...q,
            ...G,
            className: h(_t, "framer-1ox3b7m", i, J),
            "data-border": !0,
            "data-framer-name": "Closed",
            "data-highlight": !0,
            layoutDependency: re,
            layoutId: "oHn_7UBoQ",
            onTap: Rt,
            ref: t,
            style: {
              "--border-bottom-width": "1px",
              "--border-color":
                "var(--token-27edf61e-63fc-4105-9b38-a947a26bc427, rgb(222, 223, 223))",
              "--border-left-width": "1px",
              "--border-right-width": "1px",
              "--border-style": "solid",
              "--border-top-width": "1px",
              backgroundColor:
                "var(--token-8348c7c2-ce11-4396-8407-e646654d21a8, rgb(239, 240, 240))",
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              ...y,
            },
            variants: {
              "oHn_7UBoQ-hover": {
                "--border-color":
                  "var(--token-af31831b-f934-48c2-886e-ddcc0c09a771, rgb(80, 80, 80))",
              },
            },
            ...yr(
              {
                "oHn_7UBoQ-hover": { "data-framer-name": void 0 },
                tBfMMYwR6: { "data-framer-name": "Open", onTap: Vt },
              },
              ne,
              S
            ),
            children: [
              e(A, {
                __fromCanvasComponent: !0,
                children: e(p, {
                  children: e(s.p, {
                    className: "framer-styles-preset-1qnc6s4",
                    "data-styles-preset": "NTWwFC9H4",
                    children: "Dropdown",
                  }),
                }),
                className: "framer-1xpiqf6",
                fonts: ["Inter"],
                layoutDependency: re,
                layoutId: "ztdRflXgs",
                style: {
                  "--framer-link-text-color": "rgb(0, 153, 255)",
                  "--framer-link-text-decoration": "underline",
                  "--framer-paragraph-spacing": "0px",
                },
                text: b,
                verticalAlignment: "top",
                withExternalLayout: !0,
              }),
              W(s.div, {
                className: "framer-ui23v2",
                "data-framer-name": "List",
                layoutDependency: re,
                layoutId: "zzGHyMZLU",
                style: {
                  backgroundColor:
                    "var(--token-8348c7c2-ce11-4396-8407-e646654d21a8, rgb(239, 240, 240))",
                  borderBottomLeftRadius: 36,
                  borderBottomRightRadius: 36,
                  borderTopLeftRadius: 36,
                  borderTopRightRadius: 36,
                  opacity: 0,
                },
                transformTemplate: xr,
                variants: {
                  tBfMMYwR6: {
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    opacity: 1,
                  },
                },
                children: [
                  e(R, {
                    height: 44,
                    width: "160px",
                    y: (m?.y || 0) + (m?.height || 44) - -8 + 5 + 0,
                    children: e(M, {
                      className: "framer-ug5i2h-container",
                      layoutDependency: re,
                      layoutId: "W_AwBpIQ6-container",
                      nodeId: "W_AwBpIQ6",
                      rendersWithMotion: !0,
                      scopeId: "dWsDQCWZ7",
                      children: e(pe, {
                        height: "100%",
                        id: "W_AwBpIQ6",
                        layoutId: "W_AwBpIQ6",
                        nfbnB0drL: g,
                        style: { width: "100%" },
                        VP1HNbFNP: f,
                        width: "100%",
                      }),
                    }),
                  }),
                  e(R, {
                    height: 44,
                    width: "160px",
                    y: (m?.y || 0) + (m?.height || 44) - -8 + 5 + 44,
                    children: e(M, {
                      className: "framer-ghfqf-container",
                      layoutDependency: re,
                      layoutId: "qWbwcb_SX-container",
                      nodeId: "qWbwcb_SX",
                      rendersWithMotion: !0,
                      scopeId: "dWsDQCWZ7",
                      children: e(pe, {
                        height: "100%",
                        id: "qWbwcb_SX",
                        layoutId: "qWbwcb_SX",
                        nfbnB0drL: V,
                        style: { width: "100%" },
                        VP1HNbFNP: I,
                        width: "100%",
                      }),
                    }),
                  }),
                  e(R, {
                    height: 44,
                    width: "160px",
                    y: (m?.y || 0) + (m?.height || 44) - -8 + 5 + 88,
                    children: e(M, {
                      className: "framer-3r3s96-container",
                      layoutDependency: re,
                      layoutId: "BMkVFcEnA-container",
                      nodeId: "BMkVFcEnA",
                      rendersWithMotion: !0,
                      scopeId: "dWsDQCWZ7",
                      children: e(pe, {
                        height: "100%",
                        id: "BMkVFcEnA",
                        layoutId: "BMkVFcEnA",
                        nfbnB0drL: _,
                        style: { width: "100%" },
                        VP1HNbFNP: te,
                        width: "100%",
                      }),
                    }),
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
    });
  }),
  Cr = [],
  ue = E(Ur, Cr),
  ke = ue;
X(ue, {});
B(ue, []);

var Rr = O(ke),
  Vr = "framer-TqlEf",
  _r = { KOYjFq5nX: "framer-v-1wzti7d" };
var Sr = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" },
  kr = ({ value: r, children: a }) => {
    let n = L(F),
      t = r ?? n.transition,
      o = H(() => ({ ...n, transition: t }), [JSON.stringify(t)]);
    return e(F.Provider, { value: o, children: a });
  },
  Nr = s.create(p),
  Dr = ({ height: r, id: a, width: n, ...t }) => ({ ...t }),
  Er = (r, a) =>
    r.layoutDependency ? a.join("-") + r.layoutDependency : a.join("-"),
  Br = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      m = j(),
      { style: y, className: i, layoutId: d, variant: v, ...b } = Dr(r),
      {
        baseVariant: g,
        classNames: V,
        clearLoadingGesture: _,
        gestureHandlers: f,
        gestureVariant: I,
        isLoading: te,
        setGestureState: q,
        setVariant: ne,
        variants: J,
      } = Q({
        defaultVariant: "KOYjFq5nX",
        ref: t,
        variant: v,
        variantClassNames: _r,
      }),
      x = Er(r, J),
      S = h(Vr, ...[]),
      oe = he();
    return e(D, {
      id: d ?? o,
      children: e(Nr, {
        animate: J,
        initial: !1,
        children: e(kr, {
          value: Sr,
          children: e(s.nav, {
            ...b,
            ...f,
            className: h(S, "framer-1wzti7d", i, V),
            "data-framer-name": "Navbar",
            layoutDependency: x,
            layoutId: "KOYjFq5nX",
            ref: t,
            style: { ...y },
            children: e(lt, {
              links: [
                {
                  href: { webPageId: "augiA20Il" },
                  implicitPathVariables: void 0,
                },
                {
                  href: { webPageId: "fbxo1VBAd" },
                  implicitPathVariables: void 0,
                },
                {
                  href: { webPageId: "FCOCdRpvD" },
                  implicitPathVariables: void 0,
                },
              ],
              children: (P) => e(R, {}),
            }),
          }),
        }),
      }),
    });
  }),
  Tr = [],
  we = E(Br, Tr, "framer-TqlEf"),
  Ne = we;
we.displayName = "Navbar";
we.defaultProps = { height: 84, width: 200 };
B(we, [{ explicitInter: !0, fonts: [] }, ...Rr], {
  supportsExplicitInterCodegen: !0,
});
var Mr = O(Ne),
  Ar = O(Se),
  Pr = {
    aRDQ34RJA: "(max-width: 809px)",
    aSMV8r5c8: "(min-width: 1280px)",
    Z4qu5VSQp: "(min-width: 810px) and (max-width: 1279px)",
  };
var Lr = "framer-tE4Hu",
  Hr = {
    aRDQ34RJA: "framer-v-sxfp3q",
    aSMV8r5c8: "framer-v-r2lalx",
    Z4qu5VSQp: "framer-v-19fduum",
  },
  ve = {},
  Ft = Object.keys(ve),
  bt = [
    "@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }",
    ".framer-tE4Hu.framer-1o9z6cd, .framer-tE4Hu .framer-1o9z6cd { display: block; }",
    ".framer-tE4Hu.framer-r2lalx { align-content: center; align-items: center; background-color: var(--token-2d7f3f2e-89de-4f6d-aced-1ed835b56b58, #f7f7f7); display: flex; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: flex-start; overflow: hidden; padding: 0px; position: relative; width: 100%; }",
    ".framer-tE4Hu .framer-b7olkk-container { flex: none; height: auto; left: 0px; position: absolute; right: 0px; top: 0px; z-index: 1; }",
    ".framer-tE4Hu .framer-1f9x50m { background: transparent; flex-grow: 1; height: 0px; margin: 0px; margin-bottom: -0px; position: relative; width: 0px; }",
    ".framer-tE4Hu .framer-1qrjgau-container { flex: none; height: auto; order: 1002; position: relative; width: 100%; }",
    '[data-layout-template="true"] > #overlay { margin-bottom: -0px; }',
  ],
  Wr = {
    aRDQ34RJA: "(max-width: 809px)",
    aSMV8r5c8: "(min-width: 1280px)",
    Z4qu5VSQp: "(min-width: 810px) and (max-width: 1279px)",
  },
  jr = ({ value: r }) =>
    it()
      ? null
      : e("style", {
          dangerouslySetInnerHTML: { __html: r },
          "data-framer-html-style": "",
        }),
  Qr = { Desktop: "aSMV8r5c8", Phone: "aRDQ34RJA", Tablet: "Z4qu5VSQp" },
  Or = ({ height: r, id: a, width: n, ...t }) => ({
    ...t,
    variant: Qr[t.variant] ?? t.variant ?? "aSMV8r5c8",
  }),
  qr = k(function (r, a) {
    let n = U(null),
      t = a ?? n,
      o = N(),
      { activeLocale: c, setLocale: u } = C(),
      {
        style: m,
        className: y,
        layoutId: i,
        variant: d,
        children: v,
        ...b
      } = Or(r),
      [g, V] = dt(d, Pr, !1),
      _ = void 0,
      I = h(Lr, ...[]);
    return (
      at({}),
      e(et.Provider, {
        value: {
          isLayoutTemplate: !0,
          primaryVariantId: "aSMV8r5c8",
          variantClassNames: Hr,
        },
        children: W(D, {
          id: i ?? o,
          children: [
            e(jr, {
              value:
                ":root body { background: var(--token-2d7f3f2e-89de-4f6d-aced-1ed835b56b58, rgb(247, 247, 247)); }",
            }),
            W(s.div, {
              ...b,
              className: h(I, "framer-r2lalx", y),
              "data-layout-template": !0,
              ref: t,
              style: { ...m },
              children: [
                e(R, {
                  height: 84,
                  width: "100vw",
                  y: 0,
                  children: e(ce, {
                    className: "framer-b7olkk-container",
                    nodeId: "NSZaLWZJT",
                    scopeId: "mH9wdm6R7",
                    children: e(Ne, {
                      height: "100%",
                      id: "NSZaLWZJT",
                      layoutId: "NSZaLWZJT",
                      style: { width: "100%" },
                      width: "100%",
                    }),
                  }),
                }),
                v,
                e("div", { className: "framer-1f9x50m" }),
                e(R, {
                  height: 228,
                  width: "100vw",
                  y: 1e3,
                  children: e(ce, {
                    className: "framer-1qrjgau-container",
                    nodeId: "amth2nUY8",
                    scopeId: "mH9wdm6R7",
                    children: e(tt, {
                      breakpoint: g,
                      overrides: {
                        aRDQ34RJA: { variant: "QTKJtzh7k" },
                        Z4qu5VSQp: { variant: "YTS39S5rs" },
                      },
                      children: e(Se, {
                        height: "100%",
                        id: "amth2nUY8",
                        layoutId: "amth2nUY8",
                        style: { width: "100%" },
                        variant: "oLGWHAtsH",
                        width: "100%",
                      }),
                    }),
                  }),
                }),
              ],
            }),
            e("div", { id: "template-overlay" }),
          ],
        }),
      })
    );
  }),
  Jr = (r) =>
    r === Ce.canvas || r === Ce.export
      ? [
          ...bt,
          ...Ft.flatMap((n) => {
            let t = ve[n];
            return ve[n].map((o) => `${t} {${o}}`);
          }),
        ]
      : [...bt, ...Ft.map((n) => `@media ${Wr[n]} { ${ve[n].join(" ")} }`)],
  Fe = E(qr, Jr, "framer-tE4Hu"),
  It = Fe;
Fe.displayName = "Template";
Fe.defaultProps = { height: 1e3, width: 1280 };
B(Fe, [{ explicitInter: !0, fonts: [] }, ...Mr, ...Ar], {
  supportsExplicitInterCodegen: !0,
});
var ie = {
    augiA20Il: {
      elements: {},
      page: z(() =>
        import("./vqBPgDacBZQvXKYMIX98whfD7SrWWA-fHZL-kp5AsG4.7DV5EET3.mjs")
      ),
      path: "/",
    },
    yJ6en6Tq4: {
      elements: {},
      page: z(() =>
        import("./vqUUk7nkTJF-Kg54E19Gzw-gJeS2qGK-b3rBhsVJbpE.OD2ZTXT3.mjs")
      ),
      path: "/thanks",
    },
    LNlv7pGsa: {
      elements: {},
      page: z(() =>
        import("./_oAZKosqjZssM2CkyJqupQ_5zCx8GRINwAmz418cCdY.HCXA3O53.mjs")
      ),
      path: "/404",
    },
  },
  De = [{ code: "en-US", id: "default", name: "English", slug: "" }],
  Ee = {},
  Ct = "9055bc877dbe77e9b6a7c7735d566258419a1a3936e7b153c36a4fcf8499e2b4";
function Gr({ routeId: r, children: a, style: n, ...t }) {
  let c = {}[r] ?? {};
  switch (r) {
    case "augiA20Il":
    case "yJ6en6Tq4":
    case "fbxo1VBAd":
    case "FCOCdRpvD":
    case "LNlv7pGsa":
      return T(It, { ...c, key: "Template1", routeId: r, style: n }, a(!0));
    default:
      return a(!1);
  }
}
function qa(r) {
  switch (r) {
    case "augiA20Il":
    case "yJ6en6Tq4":
    case "fbxo1VBAd":
    case "FCOCdRpvD":
    case "LNlv7pGsa":
      return [
        { hash: "r2lalx", mediaQuery: "(min-width: 1280px)" },
        {
          hash: "19fduum",
          mediaQuery: "(min-width: 810px) and (max-width: 1279px)",
        },
        { hash: "sxfp3q", mediaQuery: "(max-width: 809px)" },
      ];
    default:
      return;
  }
}
async function Yr({ routeId: r, pathVariables: a, localeId: n }) {
  let t = ie[r].page.preload(),
    o = T(ct, {
      isWebsite: !0,
      routeId: r,
      pathVariables: a,
      routes: ie,
      collectionUtils: Ee,
      framerSiteId: Ct,
      isReducedMotion: void 0,
      localeId: n,
      locales: De,
      preserveQueryParams: void 0,
      siteCanonicalURL: "",
      EditorBar: void 0,
      LayoutTemplate: Gr,
    }),
    c = T(ot, {
      children: o,
      value: {
        editorBarOnPageEditing: !1,
        pauseOffscreen: !0,
        replaceNestedLinks: !0,
      },
    }),
    u = T(nt, { children: c }),
    m = T(Ge, { children: u, value: { routes: {} } });
  return await t, m;
}
var Be = typeof document < "u";
if (Be) {
  (l.__framer_importFromPackage = (a, n) => () =>
    T(Ke, {
      error: 'Package component not supported: "' + n + '" in "' + a + '"',
    })),
    (l.process = {
      ...l.process,
      env: { ...(l.process ? l.process.env : void 0), NODE_ENV: "production" },
    }),
    (l.__framer_events = l.__framer_events || []),
    $e();
  let r = document.getElementById("main");
  "framerHydrateV2" in r.dataset ? Ut(!0, r) : Ut(!1, r);
}
function Zr() {
  Be && l.__framer_events.push(arguments);
}
async function Ut(r, a) {
  function n(t, o, c = !0) {
    if (t.caught || l.__framer_hadFatalError) return;
    let u = o?.componentStack;
    if (c) {
      if (
        (console.warn(
          `Recoverable error has happened. Please check any custom code or code overrides to fix server/client mismatches:
`,
          t,
          u
        ),
        Math.random() > 0.01)
      )
        return;
    } else
      console.error(
        `Fatal crash has happened. If you are the author of this website, please report this issue to the Framer team via`,
        t,
        u
      );
    Zr(
      c ? "published_site_load_recoverable_error" : "published_site_load_error",
      {
        message: String(t),
        componentStack: u,
        stack: u
          ? void 0
          : t instanceof Error && typeof t.stack == "string"
          ? t.stack
          : null,
      }
    );
  }
  try {
    let t, o, c, u;
    if (r) {
      let i = JSON.parse(a.dataset.framerHydrateV2);
      (t = i.routeId),
        (o = i.localeId),
        (c = i.pathVariables),
        (u = i.breakpoints),
        (t = Ue(ie, t));
    } else {
      Ue(ie, void 0);
      let i = Xe(ie, decodeURIComponent(location.pathname), !0, De);
      (t = i.routeId), (o = i.localeId), (c = i.pathVariables);
    }
    let m = Yr({ routeId: t, localeId: o, pathVariables: c });
    typeof l < "u" &&
      (async () => {
        let i = ie[t],
          d = "default",
          v = De.find(({ id: f }) => (o ? f === o : f === d)).code,
          b = null;
        if (i?.collectionId && Ee) {
          let f = await Ee[i.collectionId]?.(),
            [I] = Object.values(c);
          f &&
            typeof I == "string" &&
            (b = (await f.getRecordIdBySlug(I, v || void 0)) ?? null);
        }
        let g = Intl.DateTimeFormat().resolvedOptions(),
          V = g.timeZone,
          _ = g.locale;
        await new Promise((f) => {
          document.prerendering
            ? document.addEventListener("prerenderingchange", f, { once: !0 })
            : f();
        }),
          l.__framer_events.push([
            "published_site_pageview",
            {
              framerSiteId: Ct ?? null,
              routePath: i?.path || "/",
              collectionItemId: b,
              framerLocale: v || null,
              webPageId: i?.abTestingVariantId ?? t,
              abTestId: i?.abTestId,
              referrer: document.referrer || null,
              url: l.location.href,
              hostname: l.location.hostname || null,
              pathname: l.location.pathname || null,
              hash: l.location.hash || null,
              search: l.location.search || null,
              timezone: V,
              locale: _,
            },
            "eager",
          ]),
          await st(),
          document.dispatchEvent(
            new CustomEvent("framer:pageview", {
              detail: { framerLocale: v || null },
            })
          );
      })();
    let y = await m;
    r
      ? (pt("framer-rewrite-breakpoints", () => {
          ft(u), l.__framer_onRewriteBreakpoints?.(u);
        }),
        be(() => {
          ze(), Ze(), Ye(), xt(a, y, { onRecoverableError: n });
        }))
      : Ve(a, { onRecoverableError: n }).render(y);
  } catch (t) {
    throw (n(t, void 0, !1), t);
  }
}
export { qa as getLayoutTemplateBreakpoints, Yr as getPageRoot };
