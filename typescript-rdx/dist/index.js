import { s as g } from "./holster-storage-KQhu2mn3.js";
import { A as G, x as H, o as X, u as K, k as j, z as q, C as F, D as V, w as z, H as J, M as Z, i as Q, t as Y, q as tt, P as et, y as rt, R as st, r as it, l as at, S as ot, j as nt, B as ct, T as lt, V as ut, c as ht, g as mt, e as ft, c as pt, f as dt, d as St, a as yt, h as gt, b as bt, n as Tt, p as vt, m as Rt, v as Et, v as At } from "./holster-storage-KQhu2mn3.js";
import { randomBytes as R, createCipheriv as E, createDecipheriv as A } from "crypto";
class f {
  constructor(t) {
    if (this.value = t, t.length !== 16)
      throw new Error("Wire label must be 16 bytes (128 bits)");
  }
  static random() {
    return new f(R(16));
  }
  equals(t) {
    if (this.value.length !== t.value.length) return !1;
    for (let e = 0; e < this.value.length; e++)
      if (this.value[e] !== t.value[e]) return !1;
    return !0;
  }
}
class M {
  wireLabels = /* @__PURE__ */ new Map();
  nextWireId = 0;
  /**
   * Create a new wire with random labels for 0 and 1
   */
  createWire() {
    const t = this.nextWireId++, e = f.random(), r = f.random();
    return this.wireLabels.set(t, [e, r]), t;
  }
  /**
   * Get wire labels
   */
  getWireLabels(t) {
    const e = this.wireLabels.get(t);
    if (!e)
      throw new Error(`Wire ${t} not found`);
    return e;
  }
  /**
   * Garble a gate using encryption
   */
  garbleGate(t) {
    const e = [];
    if (t.type === "XOR")
      return {
        gateId: t.output,
        encryptedTable: []
      };
    const [r, s] = this.getWireLabels(t.inputs[0]), [o, n] = t.inputs[1] !== void 0 ? this.getWireLabels(t.inputs[1]) : [r, s], [a, c] = this.getWireLabels(t.output), h = this.getTruthTable(t.type);
    for (let l = 0; l <= 1; l++)
      for (let u = 0; u <= 1; u++) {
        if (t.type === "NOT" && u > 0) continue;
        const p = l === 0 ? r : s, m = u === 0 ? o : n, y = h[l][u] === 0 ? a : c, v = this.encrypt(y, p, m);
        e.push(v);
      }
    return this.permuteTable(e), {
      gateId: t.output,
      encryptedTable: e
    };
  }
  /**
   * Encrypt a label using input labels as keys
   */
  encrypt(t, e, r) {
    const s = new Uint8Array(32);
    s.set(e.value, 0), s.set(r.value, 16);
    const o = g(s).slice(0, 16), n = new Uint8Array(16);
    return E(
      "aes-128-ctr",
      Buffer.from(o),
      Buffer.from(n)
    ).update(Buffer.from(t.value));
  }
  permuteTable(t) {
    for (let e = t.length - 1; e > 0; e--) {
      const r = Math.floor(Math.random() * (e + 1));
      [t[e], t[r]] = [t[r], t[e]];
    }
  }
  getTruthTable(t) {
    switch (t) {
      case "AND":
        return [
          [0, 0],
          [0, 1]
        ];
      case "OR":
        return [
          [0, 1],
          [1, 1]
        ];
      case "XOR":
        return [
          [0, 1],
          [1, 0]
        ];
      case "NOT":
        return [[1], [0]];
      default:
        throw new Error(`Unknown gate type: ${t}`);
    }
  }
}
class _ {
  /**
   * Evaluate a garbled gate given input labels
   */
  evaluateGate(t, e, r) {
    if (t.encryptedTable.length === 0)
      return this.evaluateXOR(e, r);
    for (const s of t.encryptedTable)
      try {
        return this.decrypt(s, e, r);
      } catch {
        continue;
      }
    throw new Error("Failed to evaluate garbled gate");
  }
  decrypt(t, e, r) {
    const s = new Uint8Array(32);
    s.set(e.value, 0), s.set(r.value, 16);
    const o = g(s).slice(0, 16), n = new Uint8Array(16), c = A(
      "aes-128-ctr",
      Buffer.from(o),
      Buffer.from(n)
    ).update(Buffer.from(t));
    return new f(c);
  }
  evaluateXOR(t, e) {
    const r = new Uint8Array(16);
    for (let s = 0; s < 16; s++)
      r[s] = t.value[s] ^ e.value[s];
    return new f(r);
  }
}
class $ {
  bitWidth;
  garbler;
  constructor(t = 32) {
    this.bitWidth = t, this.garbler = new M();
  }
  /**
   * Build and garble the minimum circuit
   */
  buildCircuit(t, e) {
    const r = this.numberToBits(t), s = this.numberToBits(e), o = r.map(() => this.garbler.createWire()), n = s.map(() => this.garbler.createWire()), a = this.buildComparator(o, n), c = this.buildMultiplexer(a, o, n), h = [];
    return {
      result: Math.min(t, e),
      garbledCircuit: {
        gates: h,
        wireLabels: /* @__PURE__ */ new Map(),
        outputWires: c
      }
    };
  }
  numberToBits(t) {
    const e = [];
    for (let r = 0; r < this.bitWidth; r++)
      e.push((t >> r & 1) === 1);
    return e;
  }
  buildComparator(t, e) {
    return this.garbler.createWire();
  }
  buildMultiplexer(t, e, r) {
    return e.map(() => this.garbler.createWire());
  }
}
async function W(i, t) {
  const e = Math.floor(i * 1e3), r = Math.floor(t * 1e3), s = new $(32), { result: o } = s.buildCircuit(e, r);
  return o / 1e3;
}
function b(i, t) {
  try {
    if (!i || !i._)
      return null;
    const e = i._[">"];
    if (!e || typeof e != "object")
      return null;
    const r = e[t];
    return typeof r == "number" && r > 0 ? r : null;
  } catch (e) {
    return console.error("[HOLSTER-TIMESTAMP] Error extracting timestamp:", e), null;
  }
}
function T(i, t) {
  return i === null && t === null ? 0 : i === null ? -1 : t === null ? 1 : i - t;
}
function P(i, t, e) {
  const r = b(i, t);
  return T(r, e) > 0;
}
function B(i) {
  try {
    if (!i || !i._ || !i._[">"])
      return null;
    const t = i._[">"];
    let e = null;
    for (const r of Object.keys(t)) {
      const s = t[r];
      typeof s == "number" && (e === null || s > e) && (e = s);
    }
    return e;
  } catch (t) {
    return console.error("[HOLSTER-TIMESTAMP] Error finding most recent timestamp:", t), null;
  }
}
function S(i) {
  if (i === null) return !1;
  const t = (/* @__PURE__ */ new Date("1970-01-02T00:00:00.000Z")).getTime();
  return i > t;
}
function L(i) {
  if (i === null) return "Unknown";
  try {
    return new Date(i).toISOString();
  } catch {
    return "Invalid";
  }
}
function D(i) {
  try {
    return i?._?.["#"] || null;
  } catch {
    return null;
  }
}
function C(i, t) {
  if (t === null)
    return i;
  const e = S(t);
  return i ? !e && i.reliable ? i : t > i.value ? {
    value: t,
    reliable: e,
    updatedAt: Date.now()
  } : i : {
    value: t,
    reliable: e,
    updatedAt: Date.now()
  };
}
class w {
  constructor(t, e, r, s) {
    this.holsterPath = t, this.streamType = e, this.onData = r, this.onError = s, this.streamId = `${e}_${Math.random().toString(36).substr(2, 9)}`;
  }
  reader = null;
  // ReadableStreamDefaultReader<T>
  stream = null;
  isActive = !1;
  holsterRef;
  streamId;
  /**
   * Start the subscription stream
   */
  async start() {
    if (this.isActive) {
      console.warn(`[STREAM] ${this.streamType} stream already active`);
      return;
    }
    try {
      this.isActive = !0, console.log(
        `[STREAM] Starting ${this.streamType} stream ${this.streamId}`
      ), this.stream = new ReadableStream({
        start: (t) => {
          try {
            if (this.holsterRef = this.holsterPath(), !this.holsterRef) {
              console.warn(
                `[STREAM] No Holster reference for ${this.streamType} stream ${this.streamId}`
              );
              return;
            }
            this.holsterRef.on((e) => {
              this.isActive && e != null && t.enqueue(e);
            }), console.log(
              `[STREAM] ${this.streamType} stream ${this.streamId} started successfully`
            );
          } catch (e) {
            console.error(
              `[STREAM] Error starting ${this.streamType} stream:`,
              e
            ), t.error(e), this.onError?.(e);
          }
        },
        cancel: () => {
          console.log(
            `[STREAM] Cancelling ${this.streamType} stream ${this.streamId}`
          ), this.cleanup();
        }
      }), this.reader = this.stream.getReader(), this.processStream();
    } catch (t) {
      console.error(
        `[STREAM] Failed to start ${this.streamType} stream:`,
        t
      ), this.cleanup(), this.onError?.(t);
    }
  }
  /**
   * Process the stream data
   */
  async processStream() {
    if (this.reader)
      try {
        for (; this.isActive; ) {
          const { value: t, done: e } = await this.reader.read();
          if (e) {
            console.log(
              `[STREAM] ${this.streamType} stream ${this.streamId} completed`
            );
            break;
          }
          t && this.isActive && this.onData(t);
        }
      } catch (t) {
        this.isActive && (console.error(`[STREAM] Error in ${this.streamType} stream:`, t), this.onError?.(t));
      } finally {
        this.isActive || this.cleanup();
      }
  }
  /**
   * Stop the subscription stream
   */
  stop() {
    this.isActive && (console.log(`[STREAM] Stopping ${this.streamType} stream ${this.streamId}`), this.isActive = !1, this.cleanup());
  }
  /**
   * Clean up resources
   */
  cleanup() {
    this.isActive = !1;
    try {
      this.reader && (this.reader.cancel(), this.reader = null), this.holsterRef && typeof this.holsterRef.off == "function" && (this.holsterRef.off(), this.holsterRef = null), this.stream = null, console.log(
        `[STREAM] Cleaned up ${this.streamType} stream ${this.streamId}`
      );
    } catch (t) {
      console.error(
        `[STREAM] Error during cleanup of ${this.streamType} stream:`,
        t
      );
    }
  }
  /**
   * Check if stream is active
   */
  get active() {
    return this.isActive;
  }
}
class N {
  activeStreams = /* @__PURE__ */ new Map();
  subscriptionType;
  lastContributorsList = [];
  isUpdating = !1;
  constructor(t) {
    this.subscriptionType = t;
  }
  /**
   * Create a new subscription stream only if it doesn't already exist
   */
  async createStream(t, e, r, s, o) {
    const n = `${t}_${r}`, a = this.activeStreams.get(n);
    if (a && a.active)
      return;
    a && (a.stop(), this.activeStreams.delete(n));
    const c = new w(
      e,
      `${this.subscriptionType}_${r}`,
      s,
      o
    );
    this.activeStreams.set(n, c);
    try {
      await c.start();
    } catch (h) {
      throw this.activeStreams.delete(n), h;
    }
  }
  /**
   * Stop a specific stream
   */
  stopStream(t, e) {
    const r = `${t}_${e}`, s = this.activeStreams.get(r);
    s && (s.stop(), this.activeStreams.delete(r));
  }
  /**
   * Stop all streams for a contributor
   */
  stopContributorStreams(t) {
    const e = [];
    for (const [r, s] of this.activeStreams.entries())
      r.startsWith(`${t}_`) && (s.stop(), e.push(r));
    e.forEach((r) => this.activeStreams.delete(r));
  }
  /**
   * Stop all streams
   */
  stopAllStreams() {
    console.log(
      `[STREAM-MANAGER] Stopping all ${this.subscriptionType} streams`
    );
    for (const [t, e] of this.activeStreams.entries())
      e.stop();
    this.activeStreams.clear(), this.lastContributorsList = [];
  }
  /**
   * Check if contributor lists are equal
   */
  arraysEqual(t, e) {
    if (t.length !== e.length) return !1;
    const r = [...t].sort(), s = [...e].sort();
    return r.every((o, n) => o === s[n]);
  }
  /**
   * Update subscriptions using delta-based approach with memoization
   */
  async updateSubscriptions(t, e) {
    if (!this.isUpdating && !this.arraysEqual(t, this.lastContributorsList)) {
      this.isUpdating = !0;
      try {
        if (!t.length) {
          this.stopAllStreams();
          return;
        }
        console.log(
          `[STREAM-MANAGER] Updating ${this.subscriptionType} subscriptions for ${t.length} contributors`
        );
        const r = /* @__PURE__ */ new Set();
        for (const a of this.activeStreams.keys()) {
          const c = a.split("_")[0];
          r.add(c);
        }
        const s = new Set(t), o = t.filter(
          (a) => !r.has(a)
        ), n = Array.from(r).filter(
          (a) => !s.has(a)
        );
        for (const a of n)
          this.stopContributorStreams(a);
        for (const a of o)
          try {
            await e(a);
          } catch (c) {
            console.error(
              `[STREAM-MANAGER] Failed to create streams for contributor ${a}:`,
              c
            );
          }
        this.lastContributorsList = [...t], console.log(
          `[STREAM-MANAGER] ${this.subscriptionType} streams: +${o.length} -${n.length} (total: ${this.activeStreams.size})`
        );
      } finally {
        this.isUpdating = !1;
      }
    }
  }
  /**
   * Get stream count for debugging
   */
  get streamCount() {
    return this.activeStreams.size;
  }
  /**
   * Get active stream keys for debugging
   */
  get activeStreamKeys() {
    return Array.from(this.activeStreams.keys());
  }
}
function U(i) {
  let t = null;
  return (e) => {
    const {
      dataType: r,
      validator: s,
      getCurrentData: o,
      updateStore: n,
      onUpdate: a,
      enableTimestampComparison: c,
      timestampField: h
    } = i;
    if (!e) {
      console.log(`[PROCESSOR] No ${r} data found`);
      return;
    }
    try {
      let l = e;
      if (s && (l = s(e), !l)) {
        console.error(`[PROCESSOR] Failed to validate ${r} data`);
        return;
      }
      const u = o();
      if (c)
        try {
          const m = b(e, h || "_");
          if (m !== null) {
            const d = C(
              t,
              m
            );
            if (d && d !== t) {
              if (T(
                m,
                t?.value || null
              ) <= 0 && S(m)) {
                console.log(
                  `[PROCESSOR] Incoming ${r} is older/same, ignoring update`
                );
                return;
              }
              S(m) && (console.log(
                `[PROCESSOR] Incoming ${r} is newer, accepting update`
              ), t = d);
            }
          }
        } catch (p) {
          console.warn(
            `[PROCESSOR] Error extracting timestamps for ${r}:`,
            p
          );
        }
      if (u && JSON.stringify(u) === JSON.stringify(l))
        return;
      console.log(`[PROCESSOR] ${r} data changed, updating store`), l && typeof l == "object" && (n(l), a?.());
    } catch (l) {
      console.error(`[PROCESSOR] Error processing ${r}:`, l);
    }
  };
}
export {
  G as AllocationError,
  H as AllocationSchema,
  X as CapacityIDSchema,
  K as CapacitySchema,
  j as CommitmentHelper,
  q as CommitmentSchema,
  F as CryptographicError,
  V as DIDSchema,
  z as DesireSchema,
  _ as Evaluator,
  M as Garbler,
  J as HolsterStorage,
  w as HolsterSubscriptionStream,
  Z as MPCProtocol,
  Q as MetricsCollector,
  Y as MutualRecognitionSchema,
  tt as ParticipantSchema,
  et as PercentageSchema,
  rt as RDXConfigSchema,
  st as RDXException,
  it as RecognitionValueSchema,
  at as Schemas,
  ot as SecretSharing,
  nt as SecureMemory,
  $ as SecureMinCircuit,
  ct as ShareSchema,
  N as StreamSubscriptionManager,
  lt as TEESimulator,
  ut as ValidationError,
  f as WireLabel,
  ht as commit,
  T as compareTimestamps,
  mt as createAllocation,
  ft as createCapacity,
  pt as createCommitment,
  U as createDataProcessor,
  dt as createDesire,
  St as createMutualRecognition,
  yt as createParticipant,
  gt as createRDXConfig,
  bt as createRecognitionValue,
  L as formatTimestamp,
  b as getHolsterTimestamp,
  B as getMostRecentTimestamp,
  D as getNodeId,
  Tt as getValidationErrors,
  P as isDataNewer,
  S as isReliableTimestamp,
  vt as parse,
  W as secureMinimumGarbled,
  C as updateTimestampMetadata,
  Rt as validate,
  Et as verify,
  At as verifyCommitment
};
//# sourceMappingURL=index.js.map
