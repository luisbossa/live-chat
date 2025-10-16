import {
  Da as g,
  P as m,
  R as i,
  W as h,
  k as l,
  n as p,
} from "./chunk-TLFILSQI.mjs";
import { b as n } from "./chunk-A3IIQ6X3.mjs";
var C =
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  b = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  k = {
    ...b,
    borderRadius: 6,
    background: "rgba(136, 85, 255, 0.3)",
    color: "#85F",
    border: "1px dashed #85F",
    flexDirection: "column",
  },
  A = {
    onClick: { type: i.EventHandler },
    onMouseEnter: { type: i.EventHandler },
    onMouseLeave: { type: i.EventHandler },
  },
  E = {
    type: i.Number,
    title: "Font Size",
    min: 2,
    max: 200,
    step: 1,
    displayStepper: !0,
  },
  B = {
    font: {
      type: i.Boolean,
      title: "Font",
      defaultValue: !1,
      disabledTitle: "Default",
      enabledTitle: "Custom",
    },
    fontFamily: {
      type: i.String,
      title: "Family",
      placeholder: "Inter",
      hidden: ({ font: e }) => !e,
    },
    fontWeight: {
      type: i.Enum,
      title: "Weight",
      options: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      optionTitles: [
        "Thin",
        "Extra-light",
        "Light",
        "Regular",
        "Medium",
        "Semi-bold",
        "Bold",
        "Extra-bold",
        "Black",
      ],
      hidden: ({ font: e }) => !e,
    },
  };
function $(e, t) {
  return y(!0, e, t);
}
function O(e, t) {
  return y(!1, e, t);
}
function y(e, t, s = !0) {
  let o = h();
  l(() => {
    s && o === e && t();
  }, [o]);
}
var v = () => {
    if (typeof n < "u") {
      let e = n.userAgent.toLowerCase();
      return (
        (e.indexOf("safari") > -1 ||
          e.indexOf("framermobile") > -1 ||
          e.indexOf("framerx") > -1) &&
        e.indexOf("chrome") < 0
      );
    } else return !1;
  },
  j = () => p(() => v(), []);
var _ = {
  100: "Thin",
  200: "Extra-light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi-bold",
  700: "Bold",
  800: "Extra-bold",
  900: "Black",
};
function q(e) {
  let {
      fontFamily: t = "Inter",
      fontSize: s = 16,
      fontWeight: o = 400,
      font: c = !1,
    } = e,
    u = _[o],
    d = `"${t} ${u}", "${t}", ${C}`,
    f = t
      ? { fontSize: s, fontWeight: o, fontFamily: d }
      : { fontSize: s, fontWeight: o },
    x = async () => {
      await g
        .loadWebFontsFromSelectors([
          `CUSTOM;${t}`,
          `CUSTOM;${t} ${u}`,
          `GF;${t}-${u.toLowerCase()}`,
        ])
        .catch((S) => console.error(S));
    };
  return (
    l(() => {
      c && x();
    }, [c, t, o]),
    f
  );
}
function X() {
  return p(() => m.current() === m.canvas, []);
}
function re(e) {
  let {
    borderRadius: t,
    isMixedBorderRadius: s,
    topLeftRadius: o,
    topRightRadius: c,
    bottomRightRadius: u,
    bottomLeftRadius: d,
  } = e;
  return p(
    () => (s ? `${o}px ${c}px ${u}px ${d}px` : `${t}px`),
    [t, s, o, c, u, d]
  );
}
var oe = {
  borderRadius: {
    title: "Radius",
    type: i.FusedNumber,
    toggleKey: "isMixedBorderRadius",
    toggleTitles: ["Radius", "Radius per corner"],
    valueKeys: [
      "topLeftRadius",
      "topRightRadius",
      "bottomRightRadius",
      "bottomLeftRadius",
    ],
    valueLabels: ["TL", "TR", "BR", "BL"],
    min: 0,
  },
};
function ie(e) {
  let {
    padding: t,
    paddingPerSide: s,
    paddingTop: o,
    paddingRight: c,
    paddingBottom: u,
    paddingLeft: d,
  } = e;
  return p(() => (s ? `${o}px ${c}px ${u}px ${d}px` : t), [t, s, o, c, u, d]);
}
var se = {
  padding: {
    type: i.FusedNumber,
    toggleKey: "paddingPerSide",
    toggleTitles: ["Padding", "Padding per side"],
    valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    valueLabels: ["T", "R", "B", "L"],
    min: 0,
    title: "Padding",
  },
};
export {
  A as a,
  $ as b,
  O as c,
  j as d,
  q as e,
  X as f,
  re as g,
  oe as h,
  ie as i,
};
//# sourceMappingURL=chunk-TJRS3MN7.mjs.map
