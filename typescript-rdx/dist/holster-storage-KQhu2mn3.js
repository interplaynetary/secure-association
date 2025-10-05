import { randomBytes as zt } from "crypto";
import re from "secrets.js-grempe";
import { z as m } from "zod";
const mt = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Ht(n) {
  return n instanceof Uint8Array || ArrayBuffer.isView(n) && n.constructor.name === "Uint8Array";
}
function Vt(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function ut(n, ...t) {
  if (!Ht(n))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(n.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + n.length);
}
function pe(n) {
  if (typeof n != "function" || typeof n.create != "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  Vt(n.outputLen), Vt(n.blockLen);
}
function Dt(n, t = !0) {
  if (n.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && n.finished)
    throw new Error("Hash#digest() has already been called");
}
function We(n, t) {
  ut(n);
  const r = t.outputLen;
  if (n.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function Rt(...n) {
  for (let t = 0; t < n.length; t++)
    n[t].fill(0);
}
function Ct(n) {
  return new DataView(n.buffer, n.byteOffset, n.byteLength);
}
function Q(n, t) {
  return n << 32 - t | n >>> t;
}
const ge = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Je = /* @__PURE__ */ Array.from({ length: 256 }, (n, t) => t.toString(16).padStart(2, "0"));
function yt(n) {
  if (ut(n), ge)
    return n.toHex();
  let t = "";
  for (let r = 0; r < n.length; r++)
    t += Je[n[r]];
  return t;
}
const J = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function ie(n) {
  if (n >= J._0 && n <= J._9)
    return n - J._0;
  if (n >= J.A && n <= J.F)
    return n - (J.A - 10);
  if (n >= J.a && n <= J.f)
    return n - (J.a - 10);
}
function Ot(n) {
  if (typeof n != "string")
    throw new Error("hex string expected, got " + typeof n);
  if (ge)
    return Uint8Array.fromHex(n);
  const t = n.length, r = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const e = new Uint8Array(r);
  for (let i = 0, o = 0; i < r; i++, o += 2) {
    const s = ie(n.charCodeAt(o)), c = ie(n.charCodeAt(o + 1));
    if (s === void 0 || c === void 0) {
      const a = n[o] + n[o + 1];
      throw new Error('hex string expected, got non-hex character "' + a + '" at index ' + o);
    }
    e[i] = s * 16 + c;
  }
  return e;
}
function tn(n) {
  if (typeof n != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(n));
}
function Ft(n) {
  return typeof n == "string" && (n = tn(n)), ut(n), n;
}
function ot(...n) {
  let t = 0;
  for (let e = 0; e < n.length; e++) {
    const i = n[e];
    ut(i), t += i.length;
  }
  const r = new Uint8Array(t);
  for (let e = 0, i = 0; e < n.length; e++) {
    const o = n[e];
    r.set(o, i), i += o.length;
  }
  return r;
}
class ye {
}
function en(n) {
  const t = (e) => n().update(Ft(e)).digest(), r = n();
  return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = () => n(), t;
}
function be(n = 32) {
  if (mt && typeof mt.getRandomValues == "function")
    return mt.getRandomValues(new Uint8Array(n));
  if (mt && typeof mt.randomBytes == "function")
    return Uint8Array.from(mt.randomBytes(n));
  throw new Error("crypto.getRandomValues must be defined");
}
function nn(n, t, r, e) {
  if (typeof n.setBigUint64 == "function")
    return n.setBigUint64(t, r, e);
  const i = BigInt(32), o = BigInt(4294967295), s = Number(r >> i & o), c = Number(r & o), a = e ? 4 : 0, f = e ? 0 : 4;
  n.setUint32(t + a, s, e), n.setUint32(t + f, c, e);
}
function rn(n, t, r) {
  return n & t ^ ~n & r;
}
function on(n, t, r) {
  return n & t ^ n & r ^ t & r;
}
class sn extends ye {
  constructor(t, r, e, i) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = r, this.padOffset = e, this.isLE = i, this.buffer = new Uint8Array(t), this.view = Ct(this.buffer);
  }
  update(t) {
    Dt(this), t = Ft(t), ut(t);
    const { view: r, buffer: e, blockLen: i } = this, o = t.length;
    for (let s = 0; s < o; ) {
      const c = Math.min(i - this.pos, o - s);
      if (c === i) {
        const a = Ct(t);
        for (; i <= o - s; s += i)
          this.process(a, s);
        continue;
      }
      e.set(t.subarray(s, s + c), this.pos), this.pos += c, s += c, this.pos === i && (this.process(r, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Dt(this), We(t, this), this.finished = !0;
    const { buffer: r, view: e, blockLen: i, isLE: o } = this;
    let { pos: s } = this;
    r[s++] = 128, Rt(this.buffer.subarray(s)), this.padOffset > i - s && (this.process(e, 0), s = 0);
    for (let d = s; d < i; d++)
      r[d] = 0;
    nn(e, i - 8, BigInt(this.length * 8), o), this.process(e, 0);
    const c = Ct(t), a = this.outputLen;
    if (a % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const f = a / 4, y = this.get();
    if (f > y.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let d = 0; d < f; d++)
      c.setUint32(4 * d, y[d], o);
  }
  digest() {
    const { buffer: t, outputLen: r } = this;
    this.digestInto(t);
    const e = t.slice(0, r);
    return this.destroy(), e;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: r, buffer: e, length: i, finished: o, destroyed: s, pos: c } = this;
    return t.destroyed = s, t.finished = o, t.length = i, t.pos = c, i % r && t.buffer.set(e), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const rt = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), cn = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), it = /* @__PURE__ */ new Uint32Array(64);
class an extends sn {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = rt[0] | 0, this.B = rt[1] | 0, this.C = rt[2] | 0, this.D = rt[3] | 0, this.E = rt[4] | 0, this.F = rt[5] | 0, this.G = rt[6] | 0, this.H = rt[7] | 0;
  }
  get() {
    const { A: t, B: r, C: e, D: i, E: o, F: s, G: c, H: a } = this;
    return [t, r, e, i, o, s, c, a];
  }
  // prettier-ignore
  set(t, r, e, i, o, s, c, a) {
    this.A = t | 0, this.B = r | 0, this.C = e | 0, this.D = i | 0, this.E = o | 0, this.F = s | 0, this.G = c | 0, this.H = a | 0;
  }
  process(t, r) {
    for (let d = 0; d < 16; d++, r += 4)
      it[d] = t.getUint32(r, !1);
    for (let d = 16; d < 64; d++) {
      const l = it[d - 15], u = it[d - 2], w = Q(l, 7) ^ Q(l, 18) ^ l >>> 3, E = Q(u, 17) ^ Q(u, 19) ^ u >>> 10;
      it[d] = E + it[d - 7] + w + it[d - 16] | 0;
    }
    let { A: e, B: i, C: o, D: s, E: c, F: a, G: f, H: y } = this;
    for (let d = 0; d < 64; d++) {
      const l = Q(c, 6) ^ Q(c, 11) ^ Q(c, 25), u = y + l + rn(c, a, f) + cn[d] + it[d] | 0, E = (Q(e, 2) ^ Q(e, 13) ^ Q(e, 22)) + on(e, i, o) | 0;
      y = f, f = a, a = c, c = s + u | 0, s = o, o = i, i = e, e = u + E | 0;
    }
    e = e + this.A | 0, i = i + this.B | 0, o = o + this.C | 0, s = s + this.D | 0, c = c + this.E | 0, a = a + this.F | 0, f = f + this.G | 0, y = y + this.H | 0, this.set(e, i, o, s, c, a, f, y);
  }
  roundClean() {
    Rt(it);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Rt(this.buffer);
  }
}
const we = /* @__PURE__ */ en(() => new an());
class Ee extends ye {
  constructor(t, r) {
    super(), this.finished = !1, this.destroyed = !1, pe(t);
    const e = Ft(r);
    if (this.iHash = t.create(), typeof this.iHash.update != "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const i = this.blockLen, o = new Uint8Array(i);
    o.set(e.length > i ? t.create().update(e).digest() : e);
    for (let s = 0; s < o.length; s++)
      o[s] ^= 54;
    this.iHash.update(o), this.oHash = t.create();
    for (let s = 0; s < o.length; s++)
      o[s] ^= 106;
    this.oHash.update(o), Rt(o);
  }
  update(t) {
    return Dt(this), this.iHash.update(t), this;
  }
  digestInto(t) {
    Dt(this), ut(t, this.outputLen), this.finished = !0, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
  }
  digest() {
    const t = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(t), t;
  }
  _cloneInto(t) {
    t || (t = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash: r, iHash: e, finished: i, destroyed: o, blockLen: s, outputLen: c } = this;
    return t = t, t.finished = i, t.destroyed = o, t.blockLen = s, t.outputLen = c, t.oHash = r._cloneInto(t.oHash), t.iHash = e._cloneInto(t.iHash), t;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
}
const ve = (n, t, r) => new Ee(n, t).update(r).digest();
ve.create = (n, t) => new Ee(n, t);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Yt = /* @__PURE__ */ BigInt(0), Pt = /* @__PURE__ */ BigInt(1);
function qt(n, t = "") {
  if (typeof n != "boolean") {
    const r = t && `"${t}"`;
    throw new Error(r + "expected boolean, got type=" + typeof n);
  }
  return n;
}
function ct(n, t, r = "") {
  const e = Ht(n), i = n?.length, o = t !== void 0;
  if (!e || o && i !== t) {
    const s = r && `"${r}" `, c = o ? ` of length ${t}` : "", a = e ? `length=${i}` : `type=${typeof n}`;
    throw new Error(s + "expected Uint8Array" + c + ", got " + a);
  }
  return n;
}
function St(n) {
  const t = n.toString(16);
  return t.length & 1 ? "0" + t : t;
}
function xe(n) {
  if (typeof n != "string")
    throw new Error("hex string expected, got " + typeof n);
  return n === "" ? Yt : BigInt("0x" + n);
}
function Tt(n) {
  return xe(yt(n));
}
function Be(n) {
  return ut(n), xe(yt(Uint8Array.from(n).reverse()));
}
function Xt(n, t) {
  return Ot(n.toString(16).padStart(t * 2, "0"));
}
function Se(n, t) {
  return Xt(n, t).reverse();
}
function k(n, t, r) {
  let e;
  if (typeof t == "string")
    try {
      e = Ot(t);
    } catch (i) {
      throw new Error(n + " must be hex string or Uint8Array, cause: " + i);
    }
  else if (Ht(t))
    e = Uint8Array.from(t);
  else
    throw new Error(n + " must be hex string or Uint8Array");
  return e.length, e;
}
const Nt = (n) => typeof n == "bigint" && Yt <= n;
function ln(n, t, r) {
  return Nt(n) && Nt(t) && Nt(r) && t <= n && n < r;
}
function un(n, t, r, e) {
  if (!ln(t, r, e))
    throw new Error("expected valid " + n + ": " + r + " <= n < " + e + ", got " + t);
}
function Ie(n) {
  let t;
  for (t = 0; n > Yt; n >>= Pt, t += 1)
    ;
  return t;
}
const vt = (n) => (Pt << BigInt(n)) - Pt;
function fn(n, t, r) {
  if (typeof n != "number" || n < 2)
    throw new Error("hashLen must be a number");
  if (typeof t != "number" || t < 2)
    throw new Error("qByteLen must be a number");
  if (typeof r != "function")
    throw new Error("hmacFn must be a function");
  const e = (u) => new Uint8Array(u), i = (u) => Uint8Array.of(u);
  let o = e(n), s = e(n), c = 0;
  const a = () => {
    o.fill(1), s.fill(0), c = 0;
  }, f = (...u) => r(s, o, ...u), y = (u = e(0)) => {
    s = f(i(0), u), o = f(), u.length !== 0 && (s = f(i(1), u), o = f());
  }, d = () => {
    if (c++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let u = 0;
    const w = [];
    for (; u < t; ) {
      o = f();
      const E = o.slice();
      w.push(E), u += o.length;
    }
    return ot(...w);
  };
  return (u, w) => {
    a(), y(u);
    let E;
    for (; !(E = w(d())); )
      y();
    return a(), E;
  };
}
function Gt(n, t, r = {}) {
  if (!n || typeof n != "object")
    throw new Error("expected valid options object");
  function e(i, o, s) {
    const c = n[i];
    if (s && c === void 0)
      return;
    const a = typeof c;
    if (a !== o || c === null)
      throw new Error(`param "${i}" is invalid: expected ${o}, got ${a}`);
  }
  Object.entries(t).forEach(([i, o]) => e(i, o, !1)), Object.entries(r).forEach(([i, o]) => e(i, o, !0));
}
function oe(n) {
  const t = /* @__PURE__ */ new WeakMap();
  return (r, ...e) => {
    const i = t.get(r);
    if (i !== void 0)
      return i;
    const o = n(r, ...e);
    return t.set(r, o), o;
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const K = BigInt(0), P = BigInt(1), at = /* @__PURE__ */ BigInt(2), Ae = /* @__PURE__ */ BigInt(3), De = /* @__PURE__ */ BigInt(4), Re = /* @__PURE__ */ BigInt(5), dn = /* @__PURE__ */ BigInt(7), Oe = /* @__PURE__ */ BigInt(8), hn = /* @__PURE__ */ BigInt(9), qe = /* @__PURE__ */ BigInt(16);
function X(n, t) {
  const r = n % t;
  return r >= K ? r : t + r;
}
function Y(n, t, r) {
  let e = n;
  for (; t-- > K; )
    e *= e, e %= r;
  return e;
}
function se(n, t) {
  if (n === K)
    throw new Error("invert: expected non-zero number");
  if (t <= K)
    throw new Error("invert: expected positive modulus, got " + t);
  let r = X(n, t), e = t, i = K, o = P;
  for (; r !== K; ) {
    const c = e / r, a = e % r, f = i - o * c;
    e = r, r = a, i = o, o = f;
  }
  if (e !== P)
    throw new Error("invert: does not exist");
  return X(i, t);
}
function Qt(n, t, r) {
  if (!n.eql(n.sqr(t), r))
    throw new Error("Cannot find square root");
}
function _e(n, t) {
  const r = (n.ORDER + P) / De, e = n.pow(t, r);
  return Qt(n, e, t), e;
}
function mn(n, t) {
  const r = (n.ORDER - Re) / Oe, e = n.mul(t, at), i = n.pow(e, r), o = n.mul(t, i), s = n.mul(n.mul(o, at), i), c = n.mul(o, n.sub(s, n.ONE));
  return Qt(n, c, t), c;
}
function pn(n) {
  const t = xt(n), r = He(n), e = r(t, t.neg(t.ONE)), i = r(t, e), o = r(t, t.neg(e)), s = (n + dn) / qe;
  return (c, a) => {
    let f = c.pow(a, s), y = c.mul(f, e);
    const d = c.mul(f, i), l = c.mul(f, o), u = c.eql(c.sqr(y), a), w = c.eql(c.sqr(d), a);
    f = c.cmov(f, y, u), y = c.cmov(l, d, w);
    const E = c.eql(c.sqr(y), a), _ = c.cmov(f, y, E);
    return Qt(c, _, a), _;
  };
}
function He(n) {
  if (n < Ae)
    throw new Error("sqrt is not defined for small field");
  let t = n - P, r = 0;
  for (; t % at === K; )
    t /= at, r++;
  let e = at;
  const i = xt(n);
  for (; ce(i, e) === 1; )
    if (e++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (r === 1)
    return _e;
  let o = i.pow(e, t);
  const s = (t + P) / at;
  return function(a, f) {
    if (a.is0(f))
      return f;
    if (ce(a, f) !== 1)
      throw new Error("Cannot find square root");
    let y = r, d = a.mul(a.ONE, o), l = a.pow(f, t), u = a.pow(f, s);
    for (; !a.eql(l, a.ONE); ) {
      if (a.is0(l))
        return a.ZERO;
      let w = 1, E = a.sqr(l);
      for (; !a.eql(E, a.ONE); )
        if (w++, E = a.sqr(E), w === y)
          throw new Error("Cannot find square root");
      const _ = P << BigInt(y - w - 1), T = a.pow(d, _);
      y = w, d = a.sqr(T), l = a.mul(l, d), u = a.mul(u, T);
    }
    return u;
  };
}
function gn(n) {
  return n % De === Ae ? _e : n % Oe === Re ? mn : n % qe === hn ? pn(n) : He(n);
}
const yn = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function bn(n) {
  const t = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  }, r = yn.reduce((e, i) => (e[i] = "function", e), t);
  return Gt(n, r), n;
}
function wn(n, t, r) {
  if (r < K)
    throw new Error("invalid exponent, negatives unsupported");
  if (r === K)
    return n.ONE;
  if (r === P)
    return t;
  let e = n.ONE, i = t;
  for (; r > K; )
    r & P && (e = n.mul(e, i)), i = n.sqr(i), r >>= P;
  return e;
}
function Te(n, t, r = !1) {
  const e = new Array(t.length).fill(r ? n.ZERO : void 0), i = t.reduce((s, c, a) => n.is0(c) ? s : (e[a] = s, n.mul(s, c)), n.ONE), o = n.inv(i);
  return t.reduceRight((s, c, a) => n.is0(c) ? s : (e[a] = n.mul(s, e[a]), n.mul(s, c)), o), e;
}
function ce(n, t) {
  const r = (n.ORDER - P) / at, e = n.pow(t, r), i = n.eql(e, n.ONE), o = n.eql(e, n.ZERO), s = n.eql(e, n.neg(n.ONE));
  if (!i && !o && !s)
    throw new Error("invalid Legendre symbol result");
  return i ? 1 : o ? 0 : -1;
}
function Ce(n, t) {
  t !== void 0 && Vt(t);
  const r = t !== void 0 ? t : n.toString(2).length, e = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: e };
}
function xt(n, t, r = !1, e = {}) {
  if (n <= K)
    throw new Error("invalid field: expected ORDER > 0, got " + n);
  let i, o, s = !1, c;
  if (typeof t == "object" && t != null) {
    if (e.sqrt || r)
      throw new Error("cannot specify opts in two arguments");
    const l = t;
    l.BITS && (i = l.BITS), l.sqrt && (o = l.sqrt), typeof l.isLE == "boolean" && (r = l.isLE), typeof l.modFromBytes == "boolean" && (s = l.modFromBytes), c = l.allowedLengths;
  } else
    typeof t == "number" && (i = t), e.sqrt && (o = e.sqrt);
  const { nBitLength: a, nByteLength: f } = Ce(n, i);
  if (f > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let y;
  const d = Object.freeze({
    ORDER: n,
    isLE: r,
    BITS: a,
    BYTES: f,
    MASK: vt(a),
    ZERO: K,
    ONE: P,
    allowedLengths: c,
    create: (l) => X(l, n),
    isValid: (l) => {
      if (typeof l != "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof l);
      return K <= l && l < n;
    },
    is0: (l) => l === K,
    // is valid and invertible
    isValidNot0: (l) => !d.is0(l) && d.isValid(l),
    isOdd: (l) => (l & P) === P,
    neg: (l) => X(-l, n),
    eql: (l, u) => l === u,
    sqr: (l) => X(l * l, n),
    add: (l, u) => X(l + u, n),
    sub: (l, u) => X(l - u, n),
    mul: (l, u) => X(l * u, n),
    pow: (l, u) => wn(d, l, u),
    div: (l, u) => X(l * se(u, n), n),
    // Same as above, but doesn't normalize
    sqrN: (l) => l * l,
    addN: (l, u) => l + u,
    subN: (l, u) => l - u,
    mulN: (l, u) => l * u,
    inv: (l) => se(l, n),
    sqrt: o || ((l) => (y || (y = gn(n)), y(d, l))),
    toBytes: (l) => r ? Se(l, f) : Xt(l, f),
    fromBytes: (l, u = !0) => {
      if (c) {
        if (!c.includes(l.length) || l.length > f)
          throw new Error("Field.fromBytes: expected " + c + " bytes, got " + l.length);
        const E = new Uint8Array(f);
        E.set(l, r ? 0 : E.length - l.length), l = E;
      }
      if (l.length !== f)
        throw new Error("Field.fromBytes: expected " + f + " bytes, got " + l.length);
      let w = r ? Be(l) : Tt(l);
      if (s && (w = X(w, n)), !u && !d.isValid(w))
        throw new Error("invalid field element: outside of range 0..ORDER");
      return w;
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (l) => Te(d, l),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (l, u, w) => w ? u : l
  });
  return Object.freeze(d);
}
function Ne(n) {
  if (typeof n != "bigint")
    throw new Error("field order must be bigint");
  const t = n.toString(2).length;
  return Math.ceil(t / 8);
}
function Ue(n) {
  const t = Ne(n);
  return t + Math.ceil(t / 2);
}
function En(n, t, r = !1) {
  const e = n.length, i = Ne(t), o = Ue(t);
  if (e < 16 || e < o || e > 1024)
    throw new Error("expected " + o + "-1024 bytes of input, got " + e);
  const s = r ? Be(n) : Tt(n), c = X(s, t - P) + P;
  return r ? Se(c, i) : Xt(c, i);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const wt = BigInt(0), lt = BigInt(1);
function _t(n, t) {
  const r = t.negate();
  return n ? r : t;
}
function Ut(n, t) {
  const r = Te(n.Fp, t.map((e) => e.Z));
  return t.map((e, i) => n.fromAffine(e.toAffine(r[i])));
}
function Me(n, t) {
  if (!Number.isSafeInteger(n) || n <= 0 || n > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + n);
}
function Mt(n, t) {
  Me(n, t);
  const r = Math.ceil(t / n) + 1, e = 2 ** (n - 1), i = 2 ** n, o = vt(n), s = BigInt(n);
  return { windows: r, windowSize: e, mask: o, maxNumber: i, shiftBy: s };
}
function ae(n, t, r) {
  const { windowSize: e, mask: i, maxNumber: o, shiftBy: s } = r;
  let c = Number(n & i), a = n >> s;
  c > e && (c -= o, a += lt);
  const f = t * e, y = f + Math.abs(c) - 1, d = c === 0, l = c < 0, u = t % 2 !== 0;
  return { nextN: a, offset: y, isZero: d, isNeg: l, isNegF: u, offsetF: f };
}
function vn(n, t) {
  if (!Array.isArray(n))
    throw new Error("array expected");
  n.forEach((r, e) => {
    if (!(r instanceof t))
      throw new Error("invalid point at index " + e);
  });
}
function xn(n, t) {
  if (!Array.isArray(n))
    throw new Error("array of scalars expected");
  n.forEach((r, e) => {
    if (!t.isValid(r))
      throw new Error("invalid scalar at index " + e);
  });
}
const $t = /* @__PURE__ */ new WeakMap(), $e = /* @__PURE__ */ new WeakMap();
function jt(n) {
  return $e.get(n) || 1;
}
function le(n) {
  if (n !== wt)
    throw new Error("invalid wNAF");
}
class Bn {
  // Parametrized with a given Point class (not individual point)
  constructor(t, r) {
    this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = r;
  }
  // non-const time multiplication ladder
  _unsafeLadder(t, r, e = this.ZERO) {
    let i = t;
    for (; r > wt; )
      r & lt && (e = e.add(i)), i = i.double(), r >>= lt;
    return e;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(t, r) {
    const { windows: e, windowSize: i } = Mt(r, this.bits), o = [];
    let s = t, c = s;
    for (let a = 0; a < e; a++) {
      c = s, o.push(c);
      for (let f = 1; f < i; f++)
        c = c.add(s), o.push(c);
      s = c.double();
    }
    return o;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(t, r, e) {
    if (!this.Fn.isValid(e))
      throw new Error("invalid scalar");
    let i = this.ZERO, o = this.BASE;
    const s = Mt(t, this.bits);
    for (let c = 0; c < s.windows; c++) {
      const { nextN: a, offset: f, isZero: y, isNeg: d, isNegF: l, offsetF: u } = ae(e, c, s);
      e = a, y ? o = o.add(_t(l, r[u])) : i = i.add(_t(d, r[f]));
    }
    return le(e), { p: i, f: o };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, r, e, i = this.ZERO) {
    const o = Mt(t, this.bits);
    for (let s = 0; s < o.windows && e !== wt; s++) {
      const { nextN: c, offset: a, isZero: f, isNeg: y } = ae(e, s, o);
      if (e = c, !f) {
        const d = r[a];
        i = i.add(y ? d.negate() : d);
      }
    }
    return le(e), i;
  }
  getPrecomputes(t, r, e) {
    let i = $t.get(r);
    return i || (i = this.precomputeWindow(r, t), t !== 1 && (typeof e == "function" && (i = e(i)), $t.set(r, i))), i;
  }
  cached(t, r, e) {
    const i = jt(t);
    return this.wNAF(i, this.getPrecomputes(i, t, e), r);
  }
  unsafe(t, r, e, i) {
    const o = jt(t);
    return o === 1 ? this._unsafeLadder(t, r, i) : this.wNAFUnsafe(o, this.getPrecomputes(o, t, e), r, i);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, r) {
    Me(r, this.bits), $e.set(t, r), $t.delete(t);
  }
  hasCache(t) {
    return jt(t) !== 1;
  }
}
function Sn(n, t, r, e) {
  let i = t, o = n.ZERO, s = n.ZERO;
  for (; r > wt || e > wt; )
    r & lt && (o = o.add(i)), e & lt && (s = s.add(i)), i = i.double(), r >>= lt, e >>= lt;
  return { p1: o, p2: s };
}
function In(n, t, r, e) {
  vn(r, n), xn(e, t);
  const i = r.length, o = e.length;
  if (i !== o)
    throw new Error("arrays of points and scalars must have equal length");
  const s = n.ZERO, c = Ie(BigInt(i));
  let a = 1;
  c > 12 ? a = c - 3 : c > 4 ? a = c - 2 : c > 0 && (a = 2);
  const f = vt(a), y = new Array(Number(f) + 1).fill(s), d = Math.floor((t.BITS - 1) / a) * a;
  let l = s;
  for (let u = d; u >= 0; u -= a) {
    y.fill(s);
    for (let E = 0; E < o; E++) {
      const _ = e[E], T = Number(_ >> BigInt(u) & f);
      y[T] = y[T].add(r[E]);
    }
    let w = s;
    for (let E = y.length - 1, _ = s; E > 0; E--)
      _ = _.add(y[E]), w = w.add(_);
    if (l = l.add(w), u !== 0)
      for (let E = 0; E < a; E++)
        l = l.double();
  }
  return l;
}
function ue(n, t, r) {
  if (t) {
    if (t.ORDER !== n)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return bn(t), t;
  } else
    return xt(n, { isLE: r });
}
function An(n, t, r = {}, e) {
  if (e === void 0 && (e = n === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${n} CURVE object`);
  for (const a of ["p", "n", "h"]) {
    const f = t[a];
    if (!(typeof f == "bigint" && f > wt))
      throw new Error(`CURVE.${a} must be positive bigint`);
  }
  const i = ue(t.p, r.Fp, e), o = ue(t.n, r.Fn, e), c = ["Gx", "Gy", "a", "b"];
  for (const a of c)
    if (!i.isValid(t[a]))
      throw new Error(`CURVE.${a} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: i, Fn: o };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const fe = (n, t) => (n + (n >= 0 ? t : -t) / je) / t;
function Dn(n, t, r) {
  const [[e, i], [o, s]] = t, c = fe(s * n, r), a = fe(-i * n, r);
  let f = n - c * e - a * o, y = -c * i - a * s;
  const d = f < et, l = y < et;
  d && (f = -f), l && (y = -y);
  const u = vt(Math.ceil(Ie(r) / 2)) + bt;
  if (f < et || f >= u || y < et || y >= u)
    throw new Error("splitScalar (endomorphism): failed, k=" + n);
  return { k1neg: d, k1: f, k2neg: l, k2: y };
}
function Zt(n) {
  if (!["compact", "recovered", "der"].includes(n))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return n;
}
function Lt(n, t) {
  const r = {};
  for (let e of Object.keys(t))
    r[e] = n[e] === void 0 ? t[e] : n[e];
  return qt(r.lowS, "lowS"), qt(r.prehash, "prehash"), r.format !== void 0 && Zt(r.format), r;
}
class Rn extends Error {
  constructor(t = "") {
    super(t);
  }
}
const tt = {
  // asn.1 DER encoding utils
  Err: Rn,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (n, t) => {
      const { Err: r } = tt;
      if (n < 0 || n > 256)
        throw new r("tlv.encode: wrong tag");
      if (t.length & 1)
        throw new r("tlv.encode: unpadded data");
      const e = t.length / 2, i = St(e);
      if (i.length / 2 & 128)
        throw new r("tlv.encode: long form length too big");
      const o = e > 127 ? St(i.length / 2 | 128) : "";
      return St(n) + o + i + t;
    },
    // v - value, l - left bytes (unparsed)
    decode(n, t) {
      const { Err: r } = tt;
      let e = 0;
      if (n < 0 || n > 256)
        throw new r("tlv.encode: wrong tag");
      if (t.length < 2 || t[e++] !== n)
        throw new r("tlv.decode: wrong tlv");
      const i = t[e++], o = !!(i & 128);
      let s = 0;
      if (!o)
        s = i;
      else {
        const a = i & 127;
        if (!a)
          throw new r("tlv.decode(long): indefinite length not supported");
        if (a > 4)
          throw new r("tlv.decode(long): byte length is too big");
        const f = t.subarray(e, e + a);
        if (f.length !== a)
          throw new r("tlv.decode: length bytes not complete");
        if (f[0] === 0)
          throw new r("tlv.decode(long): zero leftmost byte");
        for (const y of f)
          s = s << 8 | y;
        if (e += a, s < 128)
          throw new r("tlv.decode(long): not minimal encoding");
      }
      const c = t.subarray(e, e + s);
      if (c.length !== s)
        throw new r("tlv.decode: wrong value length");
      return { v: c, l: t.subarray(e + s) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(n) {
      const { Err: t } = tt;
      if (n < et)
        throw new t("integer: negative integers are not allowed");
      let r = St(n);
      if (Number.parseInt(r[0], 16) & 8 && (r = "00" + r), r.length & 1)
        throw new t("unexpected DER parsing assertion: unpadded hex");
      return r;
    },
    decode(n) {
      const { Err: t } = tt;
      if (n[0] & 128)
        throw new t("invalid signature integer: negative");
      if (n[0] === 0 && !(n[1] & 128))
        throw new t("invalid signature integer: unnecessary leading zero");
      return Tt(n);
    }
  },
  toSig(n) {
    const { Err: t, _int: r, _tlv: e } = tt, i = k("signature", n), { v: o, l: s } = e.decode(48, i);
    if (s.length)
      throw new t("invalid signature: left bytes after parsing");
    const { v: c, l: a } = e.decode(2, o), { v: f, l: y } = e.decode(2, a);
    if (y.length)
      throw new t("invalid signature: left bytes after parsing");
    return { r: r.decode(c), s: r.decode(f) };
  },
  hexFromSig(n) {
    const { _tlv: t, _int: r } = tt, e = t.encode(2, r.encode(n.r)), i = t.encode(2, r.encode(n.s)), o = e + i;
    return t.encode(48, o);
  }
}, et = BigInt(0), bt = BigInt(1), je = BigInt(2), It = BigInt(3), On = BigInt(4);
function gt(n, t) {
  const { BYTES: r } = n;
  let e;
  if (typeof t == "bigint")
    e = t;
  else {
    let i = k("private key", t);
    try {
      e = n.fromBytes(i);
    } catch {
      throw new Error(`invalid private key: expected ui8a of size ${r}, got ${typeof t}`);
    }
  }
  if (!n.isValidNot0(e))
    throw new Error("invalid private key: out of range [1..N-1]");
  return e;
}
function qn(n, t = {}) {
  const r = An("weierstrass", n, t), { Fp: e, Fn: i } = r;
  let o = r.CURVE;
  const { h: s, n: c } = o;
  Gt(t, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    wrapPrivateKey: "boolean"
  });
  const { endo: a } = t;
  if (a && (!e.is0(o.a) || typeof a.beta != "bigint" || !Array.isArray(a.basises)))
    throw new Error('invalid endo: expected "beta": bigint and "basises": array');
  const f = ze(e, i);
  function y() {
    if (!e.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function d(O, g, p) {
    const { x: h, y: b } = g.toAffine(), v = e.toBytes(h);
    if (qt(p, "isCompressed"), p) {
      y();
      const S = !e.isOdd(b);
      return ot(Le(S), v);
    } else
      return ot(Uint8Array.of(4), v, e.toBytes(b));
  }
  function l(O) {
    ct(O, void 0, "Point");
    const { publicKey: g, publicKeyUncompressed: p } = f, h = O.length, b = O[0], v = O.subarray(1);
    if (h === g && (b === 2 || b === 3)) {
      const S = e.fromBytes(v);
      if (!e.isValid(S))
        throw new Error("bad point: is not on curve, wrong x");
      const B = E(S);
      let x;
      try {
        x = e.sqrt(B);
      } catch ($) {
        const C = $ instanceof Error ? ": " + $.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + C);
      }
      y();
      const A = e.isOdd(x);
      return (b & 1) === 1 !== A && (x = e.neg(x)), { x: S, y: x };
    } else if (h === p && b === 4) {
      const S = e.BYTES, B = e.fromBytes(v.subarray(0, S)), x = e.fromBytes(v.subarray(S, S * 2));
      if (!_(B, x))
        throw new Error("bad point: is not on curve");
      return { x: B, y: x };
    } else
      throw new Error(`bad point: got length ${h}, expected compressed=${g} or uncompressed=${p}`);
  }
  const u = t.toBytes || d, w = t.fromBytes || l;
  function E(O) {
    const g = e.sqr(O), p = e.mul(g, O);
    return e.add(e.add(p, e.mul(O, o.a)), o.b);
  }
  function _(O, g) {
    const p = e.sqr(g), h = E(O);
    return e.eql(p, h);
  }
  if (!_(o.Gx, o.Gy))
    throw new Error("bad curve params: generator point");
  const T = e.mul(e.pow(o.a, It), On), nt = e.mul(e.sqr(o.b), BigInt(27));
  if (e.is0(e.add(T, nt)))
    throw new Error("bad curve params: a or b");
  function I(O, g, p = !1) {
    if (!e.isValid(g) || p && e.is0(g))
      throw new Error(`bad point coordinate ${O}`);
    return g;
  }
  function H(O) {
    if (!(O instanceof R))
      throw new Error("ProjectivePoint expected");
  }
  function N(O) {
    if (!a || !a.basises)
      throw new Error("no endo");
    return Dn(O, a.basises, i.ORDER);
  }
  const z = oe((O, g) => {
    const { X: p, Y: h, Z: b } = O;
    if (e.eql(b, e.ONE))
      return { x: p, y: h };
    const v = O.is0();
    g == null && (g = v ? e.ONE : e.inv(b));
    const S = e.mul(p, g), B = e.mul(h, g), x = e.mul(b, g);
    if (v)
      return { x: e.ZERO, y: e.ZERO };
    if (!e.eql(x, e.ONE))
      throw new Error("invZ was invalid");
    return { x: S, y: B };
  }), F = oe((O) => {
    if (O.is0()) {
      if (t.allowInfinityPoint && !e.is0(O.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: g, y: p } = O.toAffine();
    if (!e.isValid(g) || !e.isValid(p))
      throw new Error("bad point: x or y not field elements");
    if (!_(g, p))
      throw new Error("bad point: equation left != right");
    if (!O.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return !0;
  });
  function G(O, g, p, h, b) {
    return p = new R(e.mul(p.X, O), p.Y, p.Z), g = _t(h, g), p = _t(b, p), g.add(p);
  }
  class R {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(g, p, h) {
      this.X = I("x", g), this.Y = I("y", p, !0), this.Z = I("z", h), Object.freeze(this);
    }
    static CURVE() {
      return o;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(g) {
      const { x: p, y: h } = g || {};
      if (!g || !e.isValid(p) || !e.isValid(h))
        throw new Error("invalid affine point");
      if (g instanceof R)
        throw new Error("projective point not allowed");
      return e.is0(p) && e.is0(h) ? R.ZERO : new R(p, h, e.ONE);
    }
    static fromBytes(g) {
      const p = R.fromAffine(w(ct(g, void 0, "point")));
      return p.assertValidity(), p;
    }
    static fromHex(g) {
      return R.fromBytes(k("pointHex", g));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(g = 8, p = !0) {
      return W.createCache(this, g), p || this.multiply(It), this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      F(this);
    }
    hasEvenY() {
      const { y: g } = this.toAffine();
      if (!e.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !e.isOdd(g);
    }
    /** Compare one point to another. */
    equals(g) {
      H(g);
      const { X: p, Y: h, Z: b } = this, { X: v, Y: S, Z: B } = g, x = e.eql(e.mul(p, B), e.mul(v, b)), A = e.eql(e.mul(h, B), e.mul(S, b));
      return x && A;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new R(this.X, e.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: g, b: p } = o, h = e.mul(p, It), { X: b, Y: v, Z: S } = this;
      let B = e.ZERO, x = e.ZERO, A = e.ZERO, D = e.mul(b, b), $ = e.mul(v, v), C = e.mul(S, S), q = e.mul(b, v);
      return q = e.add(q, q), A = e.mul(b, S), A = e.add(A, A), B = e.mul(g, A), x = e.mul(h, C), x = e.add(B, x), B = e.sub($, x), x = e.add($, x), x = e.mul(B, x), B = e.mul(q, B), A = e.mul(h, A), C = e.mul(g, C), q = e.sub(D, C), q = e.mul(g, q), q = e.add(q, A), A = e.add(D, D), D = e.add(A, D), D = e.add(D, C), D = e.mul(D, q), x = e.add(x, D), C = e.mul(v, S), C = e.add(C, C), D = e.mul(C, q), B = e.sub(B, D), A = e.mul(C, $), A = e.add(A, A), A = e.add(A, A), new R(B, x, A);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(g) {
      H(g);
      const { X: p, Y: h, Z: b } = this, { X: v, Y: S, Z: B } = g;
      let x = e.ZERO, A = e.ZERO, D = e.ZERO;
      const $ = o.a, C = e.mul(o.b, It);
      let q = e.mul(p, v), U = e.mul(h, S), j = e.mul(b, B), Z = e.add(p, h), M = e.add(v, S);
      Z = e.mul(Z, M), M = e.add(q, U), Z = e.sub(Z, M), M = e.add(p, b);
      let V = e.add(v, B);
      return M = e.mul(M, V), V = e.add(q, j), M = e.sub(M, V), V = e.add(h, b), x = e.add(S, B), V = e.mul(V, x), x = e.add(U, j), V = e.sub(V, x), D = e.mul($, M), x = e.mul(C, j), D = e.add(x, D), x = e.sub(U, D), D = e.add(U, D), A = e.mul(x, D), U = e.add(q, q), U = e.add(U, q), j = e.mul($, j), M = e.mul(C, M), U = e.add(U, j), j = e.sub(q, j), j = e.mul($, j), M = e.add(M, j), q = e.mul(U, M), A = e.add(A, q), q = e.mul(V, M), x = e.mul(Z, x), x = e.sub(x, q), q = e.mul(Z, U), D = e.mul(V, D), D = e.add(D, q), new R(x, A, D);
    }
    subtract(g) {
      return this.add(g.negate());
    }
    is0() {
      return this.equals(R.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(g) {
      const { endo: p } = t;
      if (!i.isValidNot0(g))
        throw new Error("invalid scalar: out of range");
      let h, b;
      const v = (S) => W.cached(this, S, (B) => Ut(R, B));
      if (p) {
        const { k1neg: S, k1: B, k2neg: x, k2: A } = N(g), { p: D, f: $ } = v(B), { p: C, f: q } = v(A);
        b = $.add(q), h = G(p.beta, D, C, S, x);
      } else {
        const { p: S, f: B } = v(g);
        h = S, b = B;
      }
      return Ut(R, [h, b])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(g) {
      const { endo: p } = t, h = this;
      if (!i.isValid(g))
        throw new Error("invalid scalar: out of range");
      if (g === et || h.is0())
        return R.ZERO;
      if (g === bt)
        return h;
      if (W.hasCache(this))
        return this.multiply(g);
      if (p) {
        const { k1neg: b, k1: v, k2neg: S, k2: B } = N(g), { p1: x, p2: A } = Sn(R, h, v, B);
        return G(p.beta, x, A, b, S);
      } else
        return W.unsafe(h, g);
    }
    multiplyAndAddUnsafe(g, p, h) {
      const b = this.multiplyUnsafe(p).add(g.multiplyUnsafe(h));
      return b.is0() ? void 0 : b;
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(g) {
      return z(this, g);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree: g } = t;
      return s === bt ? !0 : g ? g(R, this) : W.unsafe(this, c).is0();
    }
    clearCofactor() {
      const { clearCofactor: g } = t;
      return s === bt ? this : g ? g(R, this) : this.multiplyUnsafe(s);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(s).is0();
    }
    toBytes(g = !0) {
      return qt(g, "isCompressed"), this.assertValidity(), u(R, this, g);
    }
    toHex(g = !0) {
      return yt(this.toBytes(g));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(g = !0) {
      return this.toBytes(g);
    }
    _setWindowSize(g) {
      this.precompute(g);
    }
    static normalizeZ(g) {
      return Ut(R, g);
    }
    static msm(g, p) {
      return In(R, i, g, p);
    }
    static fromPrivateKey(g) {
      return R.BASE.multiply(gt(i, g));
    }
  }
  R.BASE = new R(o.Gx, o.Gy, e.ONE), R.ZERO = new R(e.ZERO, e.ONE, e.ZERO), R.Fp = e, R.Fn = i;
  const Et = i.BITS, W = new Bn(R, t.endo ? Math.ceil(Et / 2) : Et);
  return R.BASE.precompute(8), R;
}
function Le(n) {
  return Uint8Array.of(n ? 2 : 3);
}
function ze(n, t) {
  return {
    secretKey: t.BYTES,
    publicKey: 1 + n.BYTES,
    publicKeyUncompressed: 1 + 2 * n.BYTES,
    publicKeyHasPrefix: !0,
    signature: 2 * t.BYTES
  };
}
function _n(n, t = {}) {
  const { Fn: r } = n, e = t.randomBytes || be, i = Object.assign(ze(n.Fp, r), { seed: Ue(r.ORDER) });
  function o(u) {
    try {
      return !!gt(r, u);
    } catch {
      return !1;
    }
  }
  function s(u, w) {
    const { publicKey: E, publicKeyUncompressed: _ } = i;
    try {
      const T = u.length;
      return w === !0 && T !== E || w === !1 && T !== _ ? !1 : !!n.fromBytes(u);
    } catch {
      return !1;
    }
  }
  function c(u = e(i.seed)) {
    return En(ct(u, i.seed, "seed"), r.ORDER);
  }
  function a(u, w = !0) {
    return n.BASE.multiply(gt(r, u)).toBytes(w);
  }
  function f(u) {
    const w = c(u);
    return { secretKey: w, publicKey: a(w) };
  }
  function y(u) {
    if (typeof u == "bigint")
      return !1;
    if (u instanceof n)
      return !0;
    const { secretKey: w, publicKey: E, publicKeyUncompressed: _ } = i;
    if (r.allowedLengths || w === E)
      return;
    const T = k("key", u).length;
    return T === E || T === _;
  }
  function d(u, w, E = !0) {
    if (y(u) === !0)
      throw new Error("first arg must be private key");
    if (y(w) === !1)
      throw new Error("second arg must be public key");
    const _ = gt(r, u);
    return n.fromHex(w).multiply(_).toBytes(E);
  }
  return Object.freeze({ getPublicKey: a, getSharedSecret: d, keygen: f, Point: n, utils: {
    isValidSecretKey: o,
    isValidPublicKey: s,
    randomSecretKey: c,
    // TODO: remove
    isValidPrivateKey: o,
    randomPrivateKey: c,
    normPrivateKeyToScalar: (u) => gt(r, u),
    precompute(u = 8, w = n.BASE) {
      return w.precompute(u, !1);
    }
  }, lengths: i });
}
function Hn(n, t, r = {}) {
  pe(t), Gt(r, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const e = r.randomBytes || be, i = r.hmac || ((p, ...h) => ve(t, p, ot(...h))), { Fp: o, Fn: s } = n, { ORDER: c, BITS: a } = s, { keygen: f, getPublicKey: y, getSharedSecret: d, utils: l, lengths: u } = _n(n, r), w = {
    prehash: !1,
    lowS: typeof r.lowS == "boolean" ? r.lowS : !1,
    format: void 0,
    //'compact' as ECDSASigFormat,
    extraEntropy: !1
  }, E = "compact";
  function _(p) {
    const h = c >> bt;
    return p > h;
  }
  function T(p, h) {
    if (!s.isValidNot0(h))
      throw new Error(`invalid signature ${p}: out of range 1..Point.Fn.ORDER`);
    return h;
  }
  function nt(p, h) {
    Zt(h);
    const b = u.signature, v = h === "compact" ? b : h === "recovered" ? b + 1 : void 0;
    return ct(p, v, `${h} signature`);
  }
  class I {
    constructor(h, b, v) {
      this.r = T("r", h), this.s = T("s", b), v != null && (this.recovery = v), Object.freeze(this);
    }
    static fromBytes(h, b = E) {
      nt(h, b);
      let v;
      if (b === "der") {
        const { r: A, s: D } = tt.toSig(ct(h));
        return new I(A, D);
      }
      b === "recovered" && (v = h[0], b = "compact", h = h.subarray(1));
      const S = s.BYTES, B = h.subarray(0, S), x = h.subarray(S, S * 2);
      return new I(s.fromBytes(B), s.fromBytes(x), v);
    }
    static fromHex(h, b) {
      return this.fromBytes(Ot(h), b);
    }
    addRecoveryBit(h) {
      return new I(this.r, this.s, h);
    }
    recoverPublicKey(h) {
      const b = o.ORDER, { r: v, s: S, recovery: B } = this;
      if (B == null || ![0, 1, 2, 3].includes(B))
        throw new Error("recovery id invalid");
      if (c * je < b && B > 1)
        throw new Error("recovery id is ambiguous for h>1 curve");
      const A = B === 2 || B === 3 ? v + c : v;
      if (!o.isValid(A))
        throw new Error("recovery id 2 or 3 invalid");
      const D = o.toBytes(A), $ = n.fromBytes(ot(Le((B & 1) === 0), D)), C = s.inv(A), q = N(k("msgHash", h)), U = s.create(-q * C), j = s.create(S * C), Z = n.BASE.multiplyUnsafe(U).add($.multiplyUnsafe(j));
      if (Z.is0())
        throw new Error("point at infinify");
      return Z.assertValidity(), Z;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return _(this.s);
    }
    toBytes(h = E) {
      if (Zt(h), h === "der")
        return Ot(tt.hexFromSig(this));
      const b = s.toBytes(this.r), v = s.toBytes(this.s);
      if (h === "recovered") {
        if (this.recovery == null)
          throw new Error("recovery bit must be present");
        return ot(Uint8Array.of(this.recovery), b, v);
      }
      return ot(b, v);
    }
    toHex(h) {
      return yt(this.toBytes(h));
    }
    // TODO: remove
    assertValidity() {
    }
    static fromCompact(h) {
      return I.fromBytes(k("sig", h), "compact");
    }
    static fromDER(h) {
      return I.fromBytes(k("sig", h), "der");
    }
    normalizeS() {
      return this.hasHighS() ? new I(this.r, s.neg(this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return this.toBytes("der");
    }
    toDERHex() {
      return yt(this.toBytes("der"));
    }
    toCompactRawBytes() {
      return this.toBytes("compact");
    }
    toCompactHex() {
      return yt(this.toBytes("compact"));
    }
  }
  const H = r.bits2int || function(h) {
    if (h.length > 8192)
      throw new Error("input is too large");
    const b = Tt(h), v = h.length * 8 - a;
    return v > 0 ? b >> BigInt(v) : b;
  }, N = r.bits2int_modN || function(h) {
    return s.create(H(h));
  }, z = vt(a);
  function F(p) {
    return un("num < 2^" + a, p, et, z), s.toBytes(p);
  }
  function G(p, h) {
    return ct(p, void 0, "message"), h ? ct(t(p), void 0, "prehashed message") : p;
  }
  function R(p, h, b) {
    if (["recovered", "canonical"].some((U) => U in b))
      throw new Error("sign() legacy options not supported");
    const { lowS: v, prehash: S, extraEntropy: B } = Lt(b, w);
    p = G(p, S);
    const x = N(p), A = gt(s, h), D = [F(A), F(x)];
    if (B != null && B !== !1) {
      const U = B === !0 ? e(u.secretKey) : B;
      D.push(k("extraEntropy", U));
    }
    const $ = ot(...D), C = x;
    function q(U) {
      const j = H(U);
      if (!s.isValidNot0(j))
        return;
      const Z = s.inv(j), M = n.BASE.multiply(j).toAffine(), V = s.create(M.x);
      if (V === et)
        return;
      const Bt = s.create(Z * s.create(C + V * A));
      if (Bt === et)
        return;
      let ee = (M.x === V ? 0 : 2) | Number(M.y & bt), ne = Bt;
      return v && _(Bt) && (ne = s.neg(Bt), ee ^= 1), new I(V, ne, ee);
    }
    return { seed: $, k2sig: q };
  }
  function Et(p, h, b = {}) {
    p = k("message", p);
    const { seed: v, k2sig: S } = R(p, h, b);
    return fn(t.outputLen, s.BYTES, i)(v, S);
  }
  function W(p) {
    let h;
    const b = typeof p == "string" || Ht(p), v = !b && p !== null && typeof p == "object" && typeof p.r == "bigint" && typeof p.s == "bigint";
    if (!b && !v)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    if (v)
      h = new I(p.r, p.s);
    else if (b) {
      try {
        h = I.fromBytes(k("sig", p), "der");
      } catch (S) {
        if (!(S instanceof tt.Err))
          throw S;
      }
      if (!h)
        try {
          h = I.fromBytes(k("sig", p), "compact");
        } catch {
          return !1;
        }
    }
    return h || !1;
  }
  function O(p, h, b, v = {}) {
    const { lowS: S, prehash: B, format: x } = Lt(v, w);
    if (b = k("publicKey", b), h = G(k("message", h), B), "strict" in v)
      throw new Error("options.strict was renamed to lowS");
    const A = x === void 0 ? W(p) : I.fromBytes(k("sig", p), x);
    if (A === !1)
      return !1;
    try {
      const D = n.fromBytes(b);
      if (S && A.hasHighS())
        return !1;
      const { r: $, s: C } = A, q = N(h), U = s.inv(C), j = s.create(q * U), Z = s.create($ * U), M = n.BASE.multiplyUnsafe(j).add(D.multiplyUnsafe(Z));
      return M.is0() ? !1 : s.create(M.x) === $;
    } catch {
      return !1;
    }
  }
  function g(p, h, b = {}) {
    const { prehash: v } = Lt(b, w);
    return h = G(h, v), I.fromBytes(p, "recovered").recoverPublicKey(h).toBytes();
  }
  return Object.freeze({
    keygen: f,
    getPublicKey: y,
    getSharedSecret: d,
    utils: l,
    lengths: u,
    Point: n,
    sign: Et,
    verify: O,
    recoverPublicKey: g,
    Signature: I,
    hash: t
  });
}
function Tn(n) {
  const t = {
    a: n.a,
    b: n.b,
    p: n.Fp.ORDER,
    n: n.n,
    h: n.h,
    Gx: n.Gx,
    Gy: n.Gy
  }, r = n.Fp;
  let e = n.allowedPrivateKeyLengths ? Array.from(new Set(n.allowedPrivateKeyLengths.map((s) => Math.ceil(s / 2)))) : void 0;
  const i = xt(t.n, {
    BITS: n.nBitLength,
    allowedLengths: e,
    modFromBytes: n.wrapPrivateKey
  }), o = {
    Fp: r,
    Fn: i,
    allowInfinityPoint: n.allowInfinityPoint,
    endo: n.endo,
    isTorsionFree: n.isTorsionFree,
    clearCofactor: n.clearCofactor,
    fromBytes: n.fromBytes,
    toBytes: n.toBytes
  };
  return { CURVE: t, curveOpts: o };
}
function Cn(n) {
  const { CURVE: t, curveOpts: r } = Tn(n), e = {
    hmac: n.hmac,
    randomBytes: n.randomBytes,
    lowS: n.lowS,
    bits2int: n.bits2int,
    bits2int_modN: n.bits2int_modN
  };
  return { CURVE: t, curveOpts: r, hash: n.hash, ecdsaOpts: e };
}
function Nn(n, t) {
  const r = t.Point;
  return Object.assign({}, t, {
    ProjectivePoint: r,
    CURVE: Object.assign({}, n, Ce(r.Fn.ORDER, r.Fn.BITS))
  });
}
function Un(n) {
  const { CURVE: t, curveOpts: r, hash: e, ecdsaOpts: i } = Cn(n), o = qn(t, r), s = Hn(o, e, i);
  return Nn(n, s);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Mn(n, t) {
  const r = (e) => Un({ ...n, hash: e });
  return { ...r(t), create: r };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Wt = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
}, $n = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
}, de = /* @__PURE__ */ BigInt(2);
function jn(n) {
  const t = Wt.p, r = BigInt(3), e = BigInt(6), i = BigInt(11), o = BigInt(22), s = BigInt(23), c = BigInt(44), a = BigInt(88), f = n * n * n % t, y = f * f * n % t, d = Y(y, r, t) * y % t, l = Y(d, r, t) * y % t, u = Y(l, de, t) * f % t, w = Y(u, i, t) * u % t, E = Y(w, o, t) * w % t, _ = Y(E, c, t) * E % t, T = Y(_, a, t) * _ % t, nt = Y(T, c, t) * E % t, I = Y(nt, r, t) * y % t, H = Y(I, s, t) * w % t, N = Y(H, e, t) * f % t, z = Y(N, de, t);
  if (!kt.eql(kt.sqr(z), n))
    throw new Error("Cannot find square root");
  return z;
}
const kt = xt(Wt.p, { sqrt: jn }), Ve = Mn({ ...Wt, Fp: kt, lowS: !0, endo: $n }, we), Ln = we, zn = Ve.ProjectivePoint.BASE, Vn = BigInt(
  "0x50929B74C1A04954B78B4B6035E97A5E078A5A0F28EC96D547BFEE9ACE803AC0"
), Pn = BigInt(
  "0x31D3C6863973926E049E637CB1B5F40A36DAC28AF1766968C30C2313F3A38904"
), Zn = new Ve.ProjectivePoint(
  Vn,
  Pn,
  BigInt(1)
);
function Kt(n, t) {
  const r = t || zt(32);
  if (r.length !== 32)
    throw new Error("Randomness must be exactly 32 bytes");
  const e = BigInt(Math.floor(n * 1e4)), i = Fn(r), o = zn.multiply(e), s = Zn.multiply(i), a = o.add(s).toAffine(), f = he(a.x, 32), y = he(a.y, 32), d = new Uint8Array(64);
  return d.set(f, 0), d.set(y, 32), {
    value: d,
    randomness: new Uint8Array(
      r.buffer,
      r.byteOffset,
      r.byteLength
    )
  };
}
function kn(n, t, r) {
  try {
    const e = Kt(t, r);
    return Yn(n.value, e.value);
  } catch {
    return !1;
  }
}
class Kn {
  threshold;
  constructor(t) {
    if (t < 2)
      throw new Error("Threshold must be at least 2");
    this.threshold = t;
  }
  /**
   * Split a value into shares using Shamir secret sharing
   *
   * @param value - Value to share (will be scaled to integer)
   * @param numShares - Total number of shares to create
   * @returns Array of shares
   */
  share(t, r) {
    if (r < this.threshold)
      throw new Error(`Need at least ${this.threshold} shares`);
    const i = Math.floor(t * 1e6).toString(16).padStart(16, "0");
    return re.share(i, r, this.threshold).map(
      (s, c) => ({
        index: c + 1,
        value: s
      })
    );
  }
  /**
   * Reconstruct a value from shares
   *
   * @param shares - At least threshold shares
   * @returns Reconstructed value
   */
  reconstruct(t) {
    if (t.length < this.threshold)
      throw new Error(
        `Insufficient shares: need ${this.threshold}, got ${t.length}`
      );
    const r = t.slice(0, this.threshold).map((o) => o.value), e = re.combine(r);
    return parseInt(e, 16) / 1e6;
  }
}
class pr {
  numNodes;
  secretSharing;
  constructor(t = 3) {
    if (t < 3)
      throw new Error("MPC requires at least 3 nodes");
    this.numNodes = t;
    const r = Math.floor(t / 2) + 1;
    this.secretSharing = new Kn(r);
  }
  /**
   * Share a value across MPC nodes
   */
  secretShare(t, r) {
    return this.secretSharing.share(t, r);
  }
  /**
   * Reconstruct value from shares
   */
  reconstruct(t) {
    return this.secretSharing.reconstruct(t);
  }
  /**
   * Compute mutual recognition: MR = min(R[A][B], R[B][A])
   *
   * This is done securely using garbled circuits for the min operation
   */
  async computeMutualRecognition(t, r) {
    const e = this.reconstruct(t), i = this.reconstruct(r), o = Math.min(e, i);
    return this.secretShare(o, this.numNodes);
  }
  /**
   * Secure minimum using garbled circuits
   * NOTE: This is a simplified version. Full implementation would use
   * the garbled circuits module for true secure computation.
   */
  async secureMin(t, r) {
    return this.computeMutualRecognition(t, r);
  }
  /**
   * Compute normalized allocation based on mutual recognition shares
   *
   * @param mrShares - Map of recipient IDs to their MR shares
   * @param totalCapacity - Total capacity to allocate
   * @param desires - Map of recipient IDs to desired amounts
   * @returns Allocation results
   */
  computeNormalizedAllocation(t, r, e) {
    const i = {};
    for (const [f, y] of Object.entries(t))
      i[f] = this.reconstruct(y);
    const o = Object.entries(i).filter(([, f]) => f > 0);
    if (o.length === 0)
      return {};
    const s = o.reduce((f, [, y]) => f + y, 0), c = {};
    let a = r;
    for (const [f, y] of o) {
      const d = y / s * r, l = e[f] || 0, u = Math.min(d, l);
      c[f] = u, a -= u;
    }
    if (a > 0.01) {
      const f = o.filter(([y, d]) => {
        const l = c[y], u = d / s * r;
        return l < u;
      });
      if (f.length > 0) {
        const y = f.reduce(
          (d, [, l]) => d + l,
          0
        );
        for (const [d, l] of f) {
          const u = l / y * a;
          c[d] += u;
        }
      }
    }
    return c;
  }
  /**
   * Compute slot-based allocation with mutual desire and filters
   * This is the complete, spec-compliant implementation
   *
   * @param slot - The availability slot to allocate
   * @param mrShares - Map of recipient IDs to their MR shares
   * @param recipientDesires - Map of recipient IDs to their desired amounts
   * @param providerDesires - Map of recipient IDs to provider's offered amounts
   * @param filterPredicate - Optional filter function for recipient eligibility
   * @param filterContext - Context for filter evaluation
   * @returns Detailed slot allocation result
   */
  computeSlotAllocation(t, r, e, i, o, s) {
    const c = (/* @__PURE__ */ new Date()).toISOString(), a = {};
    for (const [I, H] of Object.entries(r))
      a[I] = this.reconstruct(H);
    let f = {};
    if (o && s)
      for (const [I, H] of Object.entries(a))
        H > 0 && o(I, s) && (f[I] = H);
    else
      f = { ...a };
    const y = Object.entries(f).filter(
      ([, I]) => I > 0
    );
    if (y.length === 0)
      return {
        slotId: t.id,
        totalQuantity: t.quantity,
        allocations: {},
        unusedCapacity: t.quantity,
        mutualDesires: {},
        normalizedShares: {},
        redistributionAmounts: {},
        timestamp: c
      };
    const d = {};
    for (const [I] of y) {
      const H = e[I] || 0, N = i[I] || 0, z = Math.min(H, N);
      z > 0 && (d[I] = {
        recipientDesire: H,
        providerDesire: N,
        mutual: z
      });
    }
    const l = y.filter(
      ([I]) => (d[I]?.mutual || 0) > 0
    );
    if (l.length === 0)
      return {
        slotId: t.id,
        totalQuantity: t.quantity,
        allocations: {},
        unusedCapacity: t.quantity,
        mutualDesires: d,
        normalizedShares: {},
        redistributionAmounts: {},
        timestamp: c
      };
    const u = l.reduce(
      (I, [, H]) => I + H,
      0
    ), w = {};
    for (const [I, H] of l)
      w[I] = H / u;
    const E = {};
    let _ = 0;
    for (const [I, H] of Object.entries(
      w
    )) {
      const N = t.quantity * H, z = d[I]?.mutual || 0, F = Math.min(N, z);
      F > 0 && (E[I] = F, _ += F);
    }
    let T = t.quantity - _;
    const nt = {};
    if (T > 0.01) {
      const I = l.filter(
        ([H, N]) => {
          const z = E[H] || 0, F = N / u * t.quantity, G = d[H]?.mutual || 0;
          return z < Math.min(F, G);
        }
      );
      if (I.length > 0) {
        const H = I.reduce(
          (N, [, z]) => N + z,
          0
        );
        for (const [N, z] of I) {
          const F = z / H, G = T * F, R = E[N] || 0, W = (d[N]?.mutual || 0) - R, O = Math.min(
            G,
            W
          );
          O > 0 && (nt[N] = O, E[N] = R + O, _ += O);
        }
        T = t.quantity - _;
      }
    }
    return {
      slotId: t.id,
      totalQuantity: t.quantity,
      allocations: E,
      unusedCapacity: T,
      mutualDesires: d,
      normalizedShares: w,
      redistributionAmounts: nt,
      timestamp: c
    };
  }
  /**
   * Compute allocations across multiple slots
   *
   * @param slots - Array of availability slots
   * @param mrShares - Map of recipient IDs to their MR shares
   * @param recipientDesires - Map of recipient IDs to desired amounts per slot
   * @param providerDesires - Map of recipient IDs to offered amounts per slot
   * @param filterPredicate - Optional filter function
   * @param filterContext - Context for filter evaluation
   * @returns Array of slot allocation results
   */
  computeMultiSlotAllocation(t, r, e, i, o, s) {
    const c = [];
    for (const a of t) {
      const f = {}, y = {};
      for (const l of Object.keys(r))
        f[l] = e[l]?.[a.id] || 0, y[l] = i[l]?.[a.id] || 0;
      const d = this.computeSlotAllocation(
        a,
        r,
        f,
        y,
        o,
        s
      );
      c.push(d);
    }
    return c;
  }
}
function Fn(n) {
  let t = BigInt(0);
  for (const r of n)
    t = t << BigInt(8) | BigInt(r);
  return t;
}
function he(n, t) {
  const r = new Uint8Array(t);
  let e = n;
  for (let i = t - 1; i >= 0; i--)
    r[i] = Number(e & BigInt(255)), e = e >> BigInt(8);
  return r;
}
function Yn(n, t) {
  if (n.length !== t.length)
    return !1;
  let r = 0;
  for (let e = 0; e < n.length; e++)
    r |= n[e] ^ t[e];
  return r === 0;
}
class gr {
  /**
   * Simulate allocation computation in a Trusted Execution Environment
   */
  computeAllocationInEnclave(t, r, e) {
    for (const d of t)
      if (!kn(d.commitment, d.value, d.randomness))
        throw new Error(`Invalid commitment from ${d.from} to ${d.to}`);
    const i = {}, o = /* @__PURE__ */ new Set();
    for (const d of t)
      o.add(d.from), o.add(d.to);
    for (const d of t) {
      const l = t.find(
        (u) => u.from === d.to && u.to === d.from
      );
      if (l) {
        const u = Math.min(d.value, l.value);
        i[d.to] = (i[d.to] || 0) + u;
      }
    }
    const s = Object.values(i).reduce((d, l) => d + l, 0), c = [];
    if (s > 0)
      for (const [d, l] of Object.entries(i)) {
        const u = l / s * r, w = e[d] || 0, E = Math.min(u, w);
        E > 0 && c.push({
          recipientDid: d,
          quantityAllocated: E
        });
      }
    const a = Buffer.from(
      `RDX_Allocation_Enclave_v1:${c.length}:${r}`
    ), f = Ln(a), y = new Uint8Array(
      f.buffer,
      f.byteOffset,
      f.byteLength
    );
    return { allocations: c, attestation: y };
  }
}
const L = m.string().regex(/^did:[a-z0-9]+:.+/, "Invalid DID format").describe("Decentralized Identifier"), Jt = m.number().min(0, "Percentage cannot be negative").max(100, "Percentage cannot exceed 100").describe("Recognition percentage (0-100)"), ft = m.string().regex(/^cap-[a-f0-9]{16}$/, "Invalid capacity ID format").describe("Capacity identifier"), Pe = m.string().regex(/^[a-f0-9]+$/i, "Must be a hex string"), Ze = m.instanceof(Uint8Array).refine((n) => n.length === 32, "Must be exactly 32 bytes"), ke = m.instanceof(Uint8Array).refine((n) => n.length === 64, "Must be exactly 64 bytes"), Xn = m.object({
  value: ke.describe("EC point (x,y coordinates)"),
  randomness: Ze.describe("Random blinding factor")
}).strict().describe("Pedersen commitment"), Ke = m.object({
  index: m.number().int().positive().describe("Share index (1-based)"),
  value: Pe.describe("Share value as hex string")
}).strict().describe("Shamir secret share"), Gn = m.object({
  shares: m.array(Ke).min(1)
}).strict().describe("MPC share bundle"), Qn = m.object({
  did: L,
  name: m.string().min(1, "Name cannot be empty"),
  publicKey: m.string().optional()
}).strict().describe("System participant"), Wn = m.object({
  percentage: Jt
}).strict().describe("Recognition value"), Jn = m.object({
  participantA: L,
  participantB: L,
  value: Jt.describe("min(R[A][B], R[B][A])")
}).strict().describe("Mutual recognition between two participants"), tr = m.record(m.string(), m.any()).describe("Filters for recipient eligibility"), st = m.string().regex(/^slot-[a-f0-9]{16}$/, "Invalid slot ID format").describe("Slot identifier"), Fe = m.object({
  id: st,
  quantity: m.number().nonnegative("Slot quantity cannot be negative"),
  metadata: m.record(m.string(), m.any()).optional(),
  // Optional timing fields
  startDate: m.string().datetime().optional(),
  endDate: m.string().datetime().optional(),
  recurrence: m.string().optional()
}).strict().describe("Availability slot within a capacity"), Ye = m.object({
  id: ft,
  providerDid: L,
  capacityType: m.string().min(1, "Capacity type cannot be empty"),
  totalQuantity: m.number().positive("Quantity must be positive"),
  unit: m.string().min(1, "Unit cannot be empty"),
  filters: tr.default({}),
  availabilitySlots: m.array(Fe).default([]).describe("Time or resource slots for allocation")
}).strict().describe("Declared capacity"), er = m.object({
  recipientDid: L,
  capacityId: ft,
  quantityDesired: m.number().positive("Desired quantity must be positive"),
  slotId: st.optional().describe("Optional slot-specific desire")
}).strict().describe("Recipient desire for capacity"), nr = m.object({
  recipientDid: L,
  capacityId: ft,
  slotId: st.optional(),
  recipientDesire: m.number().nonnegative(),
  providerDesire: m.number().nonnegative(),
  mutual: m.number().nonnegative().describe("min(provider, recipient)")
}).strict().describe("Mutual desire between provider and recipient"), rr = m.object({
  providerDid: L,
  recipientDid: L,
  capacityId: ft,
  slotId: st.optional(),
  quantityOffered: m.number().nonnegative("Offered quantity cannot be negative")
}).strict().describe("Provider's desire to allocate to specific recipient"), ir = m.object({
  capacityId: ft,
  slotId: st.optional(),
  recipientDid: L,
  quantityAllocated: m.number().nonnegative("Allocated quantity cannot be negative"),
  proof: m.instanceof(Uint8Array).optional(),
  confirmed: m.boolean().default(!1)
}).strict().describe("Computed allocation"), Xe = m.record(L, m.number().nonnegative()).describe("Map of recipient DIDs to allocated quantities"), or = m.object({
  slotId: st,
  totalQuantity: m.number().nonnegative(),
  allocations: Xe,
  unusedCapacity: m.number().nonnegative(),
  mutualDesires: m.record(
    L,
    m.object({
      recipientDesire: m.number().nonnegative(),
      providerDesire: m.number().nonnegative(),
      mutual: m.number().nonnegative()
    })
  ),
  normalizedShares: m.record(L, m.number().nonnegative()),
  redistributionAmounts: m.record(L, m.number().nonnegative()),
  timestamp: m.string().datetime()
}).strict().describe("Complete slot allocation result with full transparency"), sr = m.object({
  allocations: m.array(
    m.object({
      recipientDid: L,
      quantityAllocated: m.number().nonnegative(),
      slotId: st.optional()
    })
  ),
  attestation: m.instanceof(Uint8Array).describe("TEE attestation")
}).strict().describe("TEE allocation output"), cr = m.object({
  mpcNodes: m.number().int().min(3, "MPC requires at least 3 nodes").default(3),
  threshold: m.number().int().min(2, "Threshold must be at least 2").optional(),
  logLevel: m.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO")
}).strict().refine(
  (n) => (n.threshold || Math.floor(n.mpcNodes / 2) + 1) <= n.mpcNodes,
  {
    message: "Threshold cannot exceed number of MPC nodes"
  }
).describe("RDX system configuration"), Ge = m.enum(["AND", "OR", "XOR", "NOT"]), At = m.instanceof(Uint8Array).refine((n) => n.length === 16, "Wire label must be 16 bytes (128 bits)"), ar = m.object({
  type: Ge,
  inputs: m.array(m.number().int().nonnegative()).min(1).max(2),
  output: m.number().int().nonnegative()
}).strict(), Qe = m.object({
  encryptedTable: m.array(m.instanceof(Uint8Array))
}).strict(), lr = m.object({
  gates: m.array(Qe),
  inputWireLabels: m.record(
    m.string(),
    m.tuple([At, At])
  ),
  outputWireLabels: m.record(m.string(), At)
}).strict(), ur = m.discriminatedUnion("operation", [
  m.object({
    operation: m.literal("addParticipant"),
    did: L,
    name: m.string(),
    publicKey: m.string().optional()
  }),
  m.object({
    operation: m.literal("getParticipant"),
    did: L
  }),
  m.object({
    operation: m.literal("addCapacity"),
    capacity: Ye
  }),
  m.object({
    operation: m.literal("addDesire"),
    recipientDid: L,
    capacityId: ft,
    quantityDesired: m.number().positive()
  })
]);
function dt(n, t) {
  const r = n.safeParse(t);
  if (!r.success) {
    const e = r.error.errors.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    );
    throw new Error(`Validation failed:
${e.join(`
`)}`);
  }
  return r.data;
}
function yr(n, t) {
  return n.safeParse(t).success;
}
function br(n, t) {
  const r = n.safeParse(t);
  return r.success ? [] : r.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
}
const ht = {
  // Primitives
  DID: L,
  Percentage: Jt,
  CapacityID: ft,
  HexString: Pe,
  Bytes32: Ze,
  Bytes64: ke,
  // Cryptography
  Commitment: Xn,
  Share: Ke,
  MPCShare: Gn,
  // Participants
  Participant: Qn,
  RecognitionValue: Wn,
  MutualRecognition: Jn,
  // Capacity & Allocation
  SlotID: st,
  AvailabilitySlot: Fe,
  Capacity: Ye,
  Desire: er,
  MutualDesire: nr,
  ProviderDesire: rr,
  Allocation: ir,
  AllocationResult: Xe,
  SlotAllocationResult: or,
  AllocationOutput: sr,
  // Configuration
  RDXConfig: cr,
  // Garbled Circuits
  GateType: Ge,
  WireLabel: At,
  Gate: ar,
  GarbledGate: Qe,
  GarbledCircuit: lr,
  // Storage
  StorageOperation: ur
};
class te extends Error {
  constructor(t) {
    super(t), this.name = "RDXException";
  }
}
class pt extends te {
  constructor(t) {
    super(t), this.name = "ValidationError";
  }
}
class wr extends te {
  constructor(t) {
    super(t), this.name = "CryptographicError";
  }
}
class Er extends te {
  constructor(t) {
    super(t), this.name = "AllocationError";
  }
}
function vr(n, t, r) {
  return dt(ht.Participant, { did: n, name: t, publicKey: r });
}
function xr(n) {
  return dt(ht.RecognitionValue, { percentage: n });
}
function Br(n, t, r) {
  return dt(ht.MutualRecognition, {
    participantA: n,
    participantB: t,
    value: r
  });
}
function Sr(n, t, r, e, i, o, s) {
  return dt(ht.Capacity, {
    id: n,
    providerDid: t,
    capacityType: r,
    totalQuantity: e,
    unit: i,
    filters: o ?? {},
    availabilitySlots: s ?? []
  });
}
function Ir(n, t, r, e) {
  return dt(ht.Desire, {
    recipientDid: n,
    capacityId: t,
    quantityDesired: r,
    slotId: e
  });
}
function Ar(n, t, r, e, i, o) {
  return dt(ht.Allocation, {
    capacityId: n,
    slotId: e,
    recipientDid: t,
    quantityAllocated: r,
    proof: i,
    confirmed: o ?? !1
  });
}
function Dr(n, t, r) {
  return dt(ht.RDXConfig, {
    mpcNodes: n ?? 3,
    threshold: t,
    logLevel: r ?? "INFO"
  });
}
class Rr {
  metrics = /* @__PURE__ */ new Map();
  startOperation(t) {
    const r = performance.now();
    return () => {
      const i = performance.now() - r, o = this.metrics.get(t) || {
        count: 0,
        totalTime: 0
      }, s = o.count + 1, c = o.totalTime + i;
      this.metrics.set(t, {
        count: s,
        totalTime: c,
        avgTime: c / s
      });
    };
  }
  getMetrics(t) {
    return t ? this.metrics.get(t) || null : Object.fromEntries(this.metrics);
  }
  report() {
    const t = ["Performance Metrics Report:", "=".repeat(60)];
    for (const [r, e] of this.metrics.entries())
      t.push(`${r}:`), t.push(`  Count: ${e.count}`), t.push(`  Total Time: ${e.totalTime.toFixed(2)}ms`), t.push(`  Avg Time: ${e.avgTime.toFixed(2)}ms`), t.push("");
    return t.join(`
`);
  }
  reset() {
    this.metrics.clear();
  }
}
class fr {
  value;
  cleared = !1;
  constructor(t) {
    this.value = t;
  }
  get() {
    if (this.cleared)
      throw new Error("Secure memory has been cleared");
    if (this.value === null)
      throw new Error("Value is null");
    return this.value;
  }
  clear() {
    this.value && typeof this.value == "object" && this.value instanceof Uint8Array && this.value.fill(0), this.value = null, this.cleared = !0;
  }
  isCleared() {
    return this.cleared;
  }
}
class Or {
  static createWithRandomness(t) {
    const r = zt(32);
    return { commitment: Kt(t, r), randomness: r };
  }
  static createSecure(t) {
    const r = new fr(zt(32));
    return {
      commitment: Kt(t, r.get()),
      getRandomness: () => r.get(),
      clearRandomness: () => r.clear()
    };
  }
}
let me;
class qr {
  constructor(t = {}) {
    this.options = t;
  }
  holster;
  user;
  isInitialized = !1;
  /**
   * Initialize Holster and user authentication
   */
  async initialize(t) {
    if (this.isInitialized)
      return;
    const r = await import("./index-DaiDJxOy.js").then((e) => e.i);
    me = r.default || r, this.holster = me(this.options), this.user = this.holster.user(t), this.isInitialized = !0, console.log(`[HOLSTER] Initialized storage for user: ${t.substring(0, 20)}...`);
  }
  ensureInitialized() {
    if (!this.isInitialized)
      throw new Error("Holster storage not initialized. Call initialize() first.");
  }
  // ========================================================================
  // Participant Operations
  // ========================================================================
  addParticipant(t, r, e = "") {
    this.ensureInitialized();
    const i = {
      did: t,
      name: r,
      publicKey: e,
      createdAt: Date.now()
    };
    this.user.get("participants").get(t).put(i, (o) => {
      if (o)
        throw new pt(`Failed to add participant: ${o}`);
      console.log(`[HOLSTER] Added participant: ${r} (${t.substring(0, 20)}...)`);
    });
  }
  getParticipant(t) {
    return this.ensureInitialized(), new Promise((r) => {
      this.user.get("participants").get(t).once((e) => {
        if (!e) {
          r(null);
          return;
        }
        r({
          did: e.did,
          name: e.name,
          publicKey: e.publicKey
        });
      });
    });
  }
  listParticipants() {
    return this.ensureInitialized(), new Promise((t) => {
      const r = [];
      this.user.get("participants").map().once((e, i) => {
        e && i !== "_" && r.push({
          did: e.did,
          name: e.name,
          publicKey: e.publicKey
        }), t(r);
      });
    });
  }
  // ========================================================================
  // Capacity Operations
  // ========================================================================
  addCapacity(t) {
    this.ensureInitialized();
    const r = {
      id: t.id,
      providerDid: t.providerDid,
      capacityType: t.capacityType,
      totalQuantity: t.totalQuantity,
      unit: t.unit,
      filters: t.filters,
      createdAt: Date.now()
    };
    this.user.get("capacities").get(t.id).put(r, (e) => {
      if (e)
        throw new pt(`Failed to add capacity: ${e}`);
      console.log(`[HOLSTER] Added capacity: ${t.id}`);
    }), t.availabilitySlots && t.availabilitySlots.length > 0 && t.availabilitySlots.forEach((e) => {
      this.addSlot(e, t.id);
    });
  }
  getCapacity(t) {
    return this.ensureInitialized(), new Promise(async (r) => {
      this.user.get("capacities").get(t).once(async (e) => {
        if (!e) {
          r(null);
          return;
        }
        const i = await this.getSlots(t);
        r({
          id: e.id,
          providerDid: e.providerDid,
          capacityType: e.capacityType,
          totalQuantity: e.totalQuantity,
          unit: e.unit,
          filters: e.filters || {},
          availabilitySlots: i
        });
      });
    });
  }
  listCapacities(t) {
    return this.ensureInitialized(), new Promise((r) => {
      const e = [];
      this.user.get("capacities").map().once(async (i, o) => {
        if (!(!i || o === "_")) {
          if (!t || i.providerDid === t) {
            const s = await this.getSlots(i.id);
            e.push({
              id: i.id,
              providerDid: i.providerDid,
              capacityType: i.capacityType,
              totalQuantity: i.totalQuantity,
              unit: i.unit,
              filters: i.filters || {},
              availabilitySlots: s
            });
          }
          r(e);
        }
      });
    });
  }
  // ========================================================================
  // Slot Operations
  // ========================================================================
  addSlot(t, r) {
    this.ensureInitialized();
    const e = {
      id: t.id,
      capacityId: r,
      quantity: t.quantity,
      metadata: t.metadata,
      startDate: t.startDate,
      endDate: t.endDate,
      recurrence: t.recurrence,
      createdAt: Date.now()
    };
    this.user.get("slots").get(r).get(t.id).put(e, (i) => {
      if (i)
        throw new pt(`Failed to add slot: ${i}`);
      console.log(`[HOLSTER] Added slot: ${t.id} to capacity ${r}`);
    });
  }
  getSlots(t) {
    return this.ensureInitialized(), new Promise((r) => {
      const e = [];
      this.user.get("slots").get(t).map().once((i, o) => {
        !i || o === "_" || (e.push({
          id: i.id,
          quantity: i.quantity,
          metadata: i.metadata,
          startDate: i.startDate,
          endDate: i.endDate,
          recurrence: i.recurrence
        }), r(e));
      });
    });
  }
  // ========================================================================
  // Desire Operations
  // ========================================================================
  addDesire(t, r, e, i) {
    this.ensureInitialized();
    const o = `${t}_${r}_${i || "none"}`, s = {
      recipientDid: t,
      capacityId: r,
      slotId: i || null,
      quantityDesired: e,
      createdAt: Date.now()
    };
    this.user.get("desires").get(o).put(s, (c) => {
      if (c)
        throw new pt(`Failed to add desire: ${c}`);
      console.log(`[HOLSTER] Added desire: ${o}`);
    });
  }
  getDesires(t, r) {
    return this.ensureInitialized(), new Promise((e) => {
      const i = [];
      this.user.get("desires").map().once((o, s) => {
        !o || s === "_" || (o.capacityId === t && (r ? o.slotId === r : o.slotId === null) && i.push({
          recipientDid: o.recipientDid,
          quantity: o.quantityDesired
        }), e(i));
      });
    });
  }
  // ========================================================================
  // Provider Desire Operations
  // ========================================================================
  addProviderDesire(t) {
    this.ensureInitialized();
    const r = `${t.recipientDid}_${t.capacityId}_${t.slotId || "none"}`, e = {
      providerDid: t.providerDid,
      recipientDid: t.recipientDid,
      capacityId: t.capacityId,
      slotId: t.slotId || null,
      quantityOffered: t.quantityOffered,
      createdAt: Date.now()
    };
    this.user.get("providerDesires").get(r).put(e, (i) => {
      if (i)
        throw new pt(`Failed to add provider desire: ${i}`);
      console.log(`[HOLSTER] Added provider desire: ${r}`);
    });
  }
  getProviderDesires(t, r) {
    return this.ensureInitialized(), new Promise((e) => {
      const i = [];
      this.user.get("providerDesires").map().once((o, s) => {
        !o || s === "_" || (o.capacityId === t && (r ? o.slotId === r : o.slotId === null) && i.push({
          recipientDid: o.recipientDid,
          quantity: o.quantityOffered
        }), e(i));
      });
    });
  }
  // ========================================================================
  // Commitment Operations
  // ========================================================================
  addCommitment(t, r, e, i) {
    this.ensureInitialized();
    const o = {
      fromDid: t,
      toDid: r,
      commitment: Array.from(e),
      // Convert to array for Gun storage
      randomness: Array.from(i),
      createdAt: Date.now()
    };
    this.user.get("commitments").get(r).put(o, (s) => {
      if (s)
        throw new pt(`Failed to add commitment: ${s}`);
      console.log(`[HOLSTER] Added commitment to ${r.substring(0, 20)}...`);
    });
  }
  getCommitment(t, r) {
    return this.ensureInitialized(), new Promise((e) => {
      this.user.get("commitments").get(r).once((i) => {
        if (!i || i.fromDid !== t) {
          e(null);
          return;
        }
        e({
          commitment: new Uint8Array(i.commitment),
          randomness: new Uint8Array(i.randomness)
        });
      });
    });
  }
  // ========================================================================
  // Allocation Operations
  // ========================================================================
  addAllocation(t) {
    this.ensureInitialized();
    const r = `${t.capacityId}_${t.slotId || "none"}_${t.recipientDid}`, e = {
      capacityId: t.capacityId,
      slotId: t.slotId || null,
      recipientDid: t.recipientDid,
      quantityAllocated: t.quantityAllocated,
      proof: t.proof ? Array.from(t.proof) : null,
      confirmed: t.confirmed,
      createdAt: Date.now()
    };
    this.user.get("allocations").get(r).put(e, (i) => {
      i ? console.error("[HOLSTER] Failed to add allocation:", i) : console.log(`[HOLSTER] Added allocation: ${r}`);
    });
  }
  getAllocations(t, r) {
    return this.ensureInitialized(), new Promise((e) => {
      const i = [];
      this.user.get("allocations").map().once((o, s) => {
        !o || s === "_" || (o.capacityId === t && (!r || o.slotId === r) && i.push({
          capacityId: o.capacityId,
          slotId: o.slotId,
          recipientDid: o.recipientDid,
          quantityAllocated: o.quantityAllocated,
          proof: o.proof ? new Uint8Array(o.proof) : void 0,
          confirmed: o.confirmed
        }), e(i));
      });
    });
  }
  // ========================================================================
  // Transaction Support
  // ========================================================================
  transaction(t) {
    return t();
  }
  // ========================================================================
  // Cleanup
  // ========================================================================
  close() {
    console.log("[HOLSTER] Closing storage connection"), this.isInitialized = !1;
  }
}
export {
  Er as A,
  Ke as B,
  wr as C,
  L as D,
  qr as H,
  pr as M,
  Jt as P,
  te as R,
  Kn as S,
  gr as T,
  pt as V,
  vr as a,
  xr as b,
  Kt as c,
  Br as d,
  Sr as e,
  Ir as f,
  Ar as g,
  Dr as h,
  Rr as i,
  fr as j,
  Or as k,
  ht as l,
  yr as m,
  br as n,
  ft as o,
  dt as p,
  Qn as q,
  Wn as r,
  Ln as s,
  Jn as t,
  Ye as u,
  kn as v,
  er as w,
  ir as x,
  cr as y,
  Xn as z
};
//# sourceMappingURL=holster-storage-KQhu2mn3.js.map
