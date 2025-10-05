function a(r, s) {
  for (var o = 0; o < s.length; o++) {
    const e = s[o];
    if (typeof e != "string" && !Array.isArray(e)) {
      for (const t in e)
        if (t !== "default" && !(t in r)) {
          const n = Object.getOwnPropertyDescriptor(e, t);
          n && Object.defineProperty(r, t, n.get ? n : {
            enumerable: !0,
            get: () => e[t]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }));
}
var l = {}, c = l.holster = function() {
  console.log("HOLSTER");
};
const f = /* @__PURE__ */ a({
  __proto__: null,
  default: l,
  holster: c
}, [l]);
export {
  f as i
};
//# sourceMappingURL=index-DaiDJxOy.js.map
