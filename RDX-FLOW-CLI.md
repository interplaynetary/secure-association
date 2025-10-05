# RDX Flow - Current CLI Implementation

## Flow A: Individual Piano Lesson Allocation (Alice → Bob)

### Overview

This flow demonstrates the current TypeScript CLI implementation using Holster/Gun for P2P storage.

---

### Phase 1: Registration & Identity Setup

**Alice registers:**

```bash
bun run cli -- register --did "did:example:alice" --name "Alice"
```

**What happens:**

- `HolsterStorage` initializes Gun chain at `user/did:example:alice/`
- Public key generated automatically (secp256k1)
- Participant data stored in P2P network: `user/did:example:alice/participants/alice`
- Data syncs to other Gun peers automatically

**Bob registers:**

```bash
bun run cli -- register --did "did:example:bob" --name "Bob"
```

**What happens:**

- Same process as Alice
- Bob's data stored at: `user/did:example:bob/participants/bob`
- Both participants can now discover each other on the network

---

### Phase 2: Recognition Exchange

**Alice sets recognition for Bob:**

```bash
bun run cli -- set-recognition \
  --from-did "did:example:alice" \
  --to-did "did:example:bob" \
  --percentage 25
```

**What happens:**

1. `crypto-core.ts::commit()` creates Pedersen commitment: `C_A = commit(25, r_A)`
2. Commitment stored at: `user/alice/commitments/bob`
3. Recognition value (25%) and randomness stored locally
4. Gun network propagates commitment to peers

**Bob sets recognition for Alice:**

```bash
bun run cli -- set-recognition \
  --from-did "did:example:bob" \
  --to-did "did:example:alice" \
  --percentage 30
```

**What happens:**

1. Pedersen commitment: `C_B = commit(30, r_B)`
2. Stored at: `user/bob/commitments/alice`
3. Both commitments now available on P2P network

---

### Phase 3: Capacity Declaration

**Alice declares piano lesson capacity:**

```bash
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "piano-lessons" \
  --quantity 10 \
  --unit "hours/week" \
  --filters '{"skill_level": "beginner"}'
```

**What happens:**

1. `createCapacity()` factory validates data with Zod schema
2. Generates UUID: `cap-abc123`
3. Capacity stored at: `user/alice/capacities/cap-abc123`
4. Metadata includes:
   - `providerDid`: `did:example:alice`
   - `capacityType`: `"piano-lessons"`
   - `totalQuantity`: `10`
   - `unit`: `"hours/week"`
   - `filters`: `{"skill_level": "beginner"}`
5. Gun network syncs to all peers

**Bob discovers capacities:**

```bash
bun run cli -- list-capacities --did "did:example:bob"
```

**What happens:**

- CLI queries Gun network for all capacities
- Filters can be applied locally
- Bob sees Alice's piano lesson capacity

---

### Phase 4: Desire Expression

**Bob expresses desire:**

```bash
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-abc123" \
  --quantity 2
```

**What happens:**

1. `createDesire()` factory creates desire object
2. Stored at: `user/bob/desires/bob_cap-abc123_null` (no specific slot)
3. Desire includes:
   - `recipientDid`: `did:example:bob`
   - `capacityId`: `cap-abc123`
   - `quantity`: `2`
4. Gun network propagates to peers
5. Alice's node receives notification via `HolsterSubscriptionStream`

---

### Phase 5: Allocation Computation

**Alice computes allocation:**

```bash
bun run cli -- compute-allocation \
  --provider-did "did:example:alice" \
  --capacity-id "cap-abc123"
```

**What happens:**

1. **Fetch Data from P2P Network:**
   - Capacity: `user/alice/capacities/cap-abc123`
   - Desires: `user/*/desires/*_cap-abc123_*` (query all peers)
   - Commitments: `user/alice/commitments/*`, `user/bob/commitments/*`

2. **Compute Mutual Recognition (MPC simulation):**

   ```typescript
   // crypto-core.ts::computeSlotAllocation()

   // Phase 1: Calculate MR
   R_alice_bob = 25; // from commitment
   R_bob_alice = 30; // from commitment
   MR = min(25, 30) = 25;
   ```

3. **Apply Filters:**

   ```typescript
   // Phase 2: Check filters
   bob_skill_level = "beginner"
   capacity_filter = {"skill_level": "beginner"}
   filter_result = 1 (Bob passes)
   ```

4. **Calculate Shares:**

   ```typescript
   // Phase 3: General Share
   total_MR = 25 (only Bob has mutual desire)
   GeneralShare(Bob, Alice) = 25 / 25 = 100%

   // Phase 4: Specific Share
   SpecificShare(Bob) = 100% * 1 = 100%
   ```

5. **Calculate Mutual Desire:**

   ```typescript
   // Phase 5: Mutual Desire
   provider_desire = 10 (total capacity)
   recipient_desire = 2 (Bob's request)
   MD = min(10, 2) = 2
   ```

6. **Final Allocation:**

   ```typescript
   // Phase 6: Allocate with zero-waste
   raw_allocation = 10 * 100% = 10
   final_allocation = min(10, 2) = 2 hours

   // Bob gets 2 hours
   // 8 hours remain unallocated
   ```

7. **Store Results:**
   - Allocation stored at: `user/alice/allocations/cap-abc123_null_bob`
   - Includes:
     - `capacityId`: `cap-abc123`
     - `recipientDid`: `did:example:bob`
     - `allocatedQuantity`: `2`
     - `computedAt`: timestamp
   - Gun network propagates results

8. **CLI Output:**

   ```
   ✅ Allocation computed successfully!

   Results:
   - Bob (did:example:bob): 2 hours/week
   - Unused capacity: 8 hours/week
   ```

---

### Phase 6: View Allocation

**Bob checks his allocation:**

```bash
bun run cli -- show-allocation \
  --did "did:example:bob" \
  --capacity-id "cap-abc123"
```

**What happens:**

1. Query Gun network: `user/*/allocations/*_cap-abc123_*_bob`
2. Retrieve allocation data
3. Display results:

   ```
   📊 Allocation Details

   Capacity: piano-lessons (10 hours/week)
   Provider: Alice (did:example:alice)

   Your Allocation: 2 hours/week
   Status: Confirmed
   Computed: 2025-10-05 14:32:15
   ```

---

## Architecture Diagram (Current Implementation)

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│                      (rdx-cli.ts)                           │
│                                                              │
│  Commands: register, set-recognition, declare-capacity,     │
│            express-desire, compute-allocation                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Logic                         │
│              (crypto-core.ts, rdx-core.ts)                  │
│                                                              │
│  • Pedersen commitments                                     │
│  • Shamir secret sharing                                    │
│  • MPC simulation                                           │
│  • 6-phase allocation algorithm                             │
│  • Zod validation                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Storage Layer                              │
│         (holster-storage.ts, holster-streams.ts)            │
│                                                              │
│  • P2P data storage                                         │
│  • Real-time subscriptions                                  │
│  • Conflict resolution                                      │
│  • Local-first persistence                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Gun Network                              │
│                   (Holster/Gun.js)                          │
│                                                              │
│  • Decentralized graph database                             │
│  • Automatic synchronization                                │
│  • Conflict-free replicated data (CRDT)                     │
│  • Peer discovery and relay                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Differences from Theoretical Design (RDX-FLOW-A.mm)

| Aspect           | Theoretical (RDX-FLOW-A.mm) | Current Implementation     |
| ---------------- | --------------------------- | -------------------------- |
| **Interface**    | REST API + WebSocket        | CLI commands               |
| **Identity**     | Separate Identity Registry  | Built into Holster storage |
| **Discovery**    | Discovery Service           | Gun network queries        |
| **Storage**      | Centralized API server      | P2P Gun/Holster            |
| **MPC**          | Distributed MPC cluster     | Local simulation           |
| **Blockchain**   | On-chain anchors            | No blockchain              |
| **Capabilities** | Server-issued tokens        | Not yet implemented        |
| **Disputes**     | Arbitration service         | Not yet implemented        |

---

## Next Steps (Phase 1)

To move toward the theoretical design:

1. **Web UI** - Browser-based interface (Svelte/React)
2. **Distributed MPC** - Multi-party computation across peers
3. **On-chain Anchors** - Optional blockchain integration
4. **Capability Tokens** - Signed, redeemable vouchers
5. **Discovery Service** - Enhanced capacity marketplace
6. **Dispute Resolution** - Arbitration workflow

---

**Status**: Phase 0 Complete (CLI + P2P)  
**Next**: Phase 1 (Web UI + Advanced Features)  
**Date**: October 2025
