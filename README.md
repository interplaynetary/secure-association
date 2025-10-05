# Recognition Derivatives Exchange (RDX)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**A decentralized, privacy-preserving, tokenless capacity allocation system based on mutual recognition.**

RDX implements Free-Association mathematics (Mutual Recognition, General/Specific Shares, Mutual Desire, and Allocation) to enable non-monetary "recognition derivatives" - options/rights to capacities that respect privacy, non-transferability, and mutual consent.

## 🎯 Why RDX?

Traditional markets use money to allocate resources. RDX uses **mutual recognition** instead:

- **No Money Required**: Allocate time, skills, and resources based on mutual value recognition
- **Community-First**: Built for cooperatives, collectives, and mutual aid networks
- **Privacy-Preserving**: Your recognition values stay private via cryptographic commitments
- **Fair Allocation**: Mathematical guarantees based on mutual desire and recognition shares
- **Decentralized**: No central authority controls the system

**Example**: Alice offers piano lessons. Bob, Carol, and Dave all want lessons. Instead of highest bidder wins, RDX allocates based on mutual recognition scores - ensuring those who mutually value each other's contributions get matched first.

## ✨ Features

- 🔐 **Privacy-Preserving**: MPC, Shamir secret sharing, and Pedersen commitments
- 🌐 **Fully Decentralized**: P2P storage via Holster/Gun (no central server)
- 🔒 **Non-Transferable**: Recognition and allocations bound to DIDs
- ⚡ **Real-Time Sync**: Live data propagation across peers
- 🛡️ **Type-Safe**: End-to-end TypeScript + Zod validation
- 🚀 **Production-Ready**: Built with `@noble/curves`, `@noble/hashes`, and battle-tested crypto

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rdx-typescript

# Install dependencies (requires Bun)
bun install

# Build the project
bun run build
```

### Basic Usage

```bash
# Register participants
bun run cli -- register --did "did:example:alice" --name "Alice"
bun run cli -- register --did "did:example:bob" --name "Bob"

# Set mutual recognition
bun run cli -- set-recognition --from-did "did:example:alice" --to-did "did:example:bob" --percentage 25
bun run cli -- set-recognition --from-did "did:example:bob" --to-did "did:example:alice" --percentage 30

# Alice declares capacity
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "piano-lessons" \
  --quantity 10 \
  --unit "hours/week"

# Bob expresses desire
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id <capacity-id> \
  --quantity 2

# Compute allocation
bun run cli -- compute-allocation \
  --provider-did "did:example:alice" \
  --capacity-id <capacity-id>

# View results
bun run cli -- show-allocation \
  --did "did:example:bob" \
  --capacity-id <capacity-id>
```

## 📚 Documentation

- **[CLI Guide](CLI_GUIDE.md)** - Complete command reference with examples
- **[Architecture](ARCHITECTURE.md)** - System design, components, and data flow
- **[Current Flow (CLI)](RDX-FLOW-CLI.md)** - Step-by-step flow of the implemented system
- **[Future Flow (API)](RDX-FLOW-A.mm)** - Theoretical server-based design (Mermaid diagram)
- **[Specification](#specification)** - Theoretical foundations (see below)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│          CLI (rdx-cli.ts)               │
├─────────────────────────────────────────┤
│     Allocation Algorithms (crypto)      │
├─────────────────────────────────────────┤
│   Core Data Layer (schemas, factories)  │
├─────────────────────────────────────────┤
│   Storage & Sync (Holster/Gun)          │
├─────────────────────────────────────────┤
│   Crypto Primitives (Pedersen, Shamir)  │
└─────────────────────────────────────────┘
```

### Core Modules

| Module                | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `crypto-core.ts`      | Cryptographic operations and allocation algorithms |
| `garbled-circuits.ts` | Yao's Garbled Circuits for secure computation      |
| `rdx-core.ts`         | Factory functions, validation, utilities           |
| `schemas.ts`          | Zod schemas for runtime validation                 |
| `holster-storage.ts`  | Decentralized P2P storage backend                  |
| `holster-streams.ts`  | Real-time subscription management                  |
| `rdx-cli.ts`          | Command-line interface                             |

## 🎯 Core Principles

1. **Non-Transferability**: Recognition and allocations are bound to DIDs
2. **Mutual Consent**: Both provider and recipient must agree for allocations to execute
3. **Privacy**: Recognition values remain confidential via MPC and commitments
4. **Tokenless**: No fungible tokens - uses capability vouchers instead
5. **Decentralized**: No trusted third party required
6. **Verifiable**: Cryptographic proofs for allocation correctness

## 🧪 Development

```bash
# Run tests
bun run test

# Watch mode
bun run test:watch

# Type checking
bun run typecheck

# Build
bun run build
```

## 📦 Project Structure

```
rdx-typescript/
├── src/
│   ├── crypto-core.ts        # Crypto operations & allocation
│   ├── garbled-circuits.ts   # Secure computation
│   ├── rdx-core.ts           # Core data structures
│   ├── schemas.ts            # Zod validation schemas
│   ├── holster-storage.ts    # P2P storage
│   ├── holster-streams.ts    # Real-time sync
│   ├── holster-timestamps.ts # Conflict resolution
│   ├── rdx-cli.ts            # CLI interface
│   └── index.ts              # Public API
├── tests/                    # Test suites
├── docs/                     # Additional documentation
├── CLI_GUIDE.md              # Command reference
├── ARCHITECTURE.md           # System architecture
└── README.md                 # This file
```

## 🔬 Example: Piano Lesson Allocation

```typescript
import {
  HolsterStorage,
  createParticipant,
  createCapacity,
  computeSlotAllocation,
} from "rdx-typescript";

// Initialize storage
const storage = new HolsterStorage();
await storage.initialize("did:example:alice");

// Register participants
await storage.addParticipant("did:example:alice", "Alice");
await storage.addParticipant("did:example:bob", "Bob");

// Set recognition
await storage.addCommitment(
  "did:example:alice",
  "did:example:bob",
  commit(25),
  randomness
);

// Declare capacity
const capacity = createCapacity(
  "cap-001",
  "did:example:alice",
  "piano-lessons",
  10,
  "hours/week"
);
await storage.addCapacity(capacity);

// Compute allocation
const result = await computeSlotAllocation(/* ... */);
console.log(result.allocations); // Bob gets 2 hours
```

---

## 📖 Specification

> **Note**: The following sections provide the theoretical and mathematical foundations of RDX. For implementation details, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Core Concepts & Data Model

Entities

Participant (P): Individual, Organization, or Sovereign. Has an immutable identifier (DID). Owns 100% Total-Recognition.

Recognition Matrix (R): For each ordered pair (A,B): R[A][B] ∈ [0,100] representing A's recognition share of B's contribution towards A's self-actualization (percentage of A's Total-Recognition).

MutualRecognition (MR): MR(A,B) = min(R[A][B], R[B][A]).

Capacity (C): Declared by a provider Prov(C) with structured metadata: type, quantity, slot(s), filters, divisibility, max_per_recipient, constraints, oracle_source.

Filter: Boolean predicate per participant used to compute Specific-Share (e.g. skills, location, certification).

Desire (D): D[Recipient][Prov][Capacity] ∈ ℕ (units desired) or continuous fraction.

Mutual-Desire (MD): MD = min(Provider_Desire, Recipient_Desire) per the spec.

Identifiers

All participants use Decentralized Identifiers (DIDs). Public keys sign commitments.

Capacities and slots use UUIDv4.

Storage model

**Current Implementation:** Fully decentralized P2P storage via Holster/Gun with local-first data persistence.

**Future/Theoretical:** On-chain anchors (optional, light) for commitments and state hashes. Support for IPFS/Arweave for distributed backups with threshold encryption.

---

Cryptography & Privacy Model

Goals

Keep recognition values and desires private unless mutually exposed for settlement.

Allow verifiable proofs that allocation rules were followed.

Primitives

1. DIDs & Verifiable Credentials: Identity and attributes.

2. Commitment Schemes: Pedersen commitments for recognition & desires: commit(x; r).

3. Secure Multi-Party Computation (MPC) OR Trusted Execution Environments (TEE): For computing MR matrices, normalization, and allocations without revealing raw inputs.

4. Zero-Knowledge Proofs (ZK-SNARK/PLONK): To prove correctness of allocation computations given committed inputs.

5. Threshold Encryption & Proxy Re-Encryption: For sharing decrypted results only with mutually interested parties (or arbitrator if dispute).

6. Replay-proof Signed Messages: All declarations signed and timestamped.

Privacy Workflows

Commit Phase: Participants commit hashes/commitments of recognition vectors and desires on-chain or in append-only logs. These commitments timestamp state without revealing values.

Compute Phase: An MPC/Tee computes MR, normalized shares, and tentative allocations. It produces zk-proofs matching commitments.

Reveal Phase: Only data required for settlement is revealed to involved counterparties, and receipts (signed confirmations) are anchored on-chain.

---

Core Algorithms (pseudocode)

Mutual Recognition and General-Share

# Inputs: recognition commitments R[A][*] (encrypted/committed), R[\*][A]

# Compute MR[A][B] = min(R[A][B], R[B][A]) for all pairs where both committed

# For provider P and recipient U:

GeneralShare(U, P) = MR(P, U) / SUM\_{x in RecipientsOfP} MR(P, x)

Specific-Share & Allocation

SpecificShare(U, P, Capacity) = GeneralShare(U,P) \* Filter(U,Capacity)
NormalizeSpecificShares across filtered recipients to sum to 1.

MutualDesire(ProvCapacity, Recipient) = min(ProviderDeclaredToRecipient, RecipientRequestedFromProvider)
NormalizedMRShare = MR(Prov, Recipient) / SUM\_{r in MutuallyDesiringRecipients} MR(Prov, r)
RawAllocation = Capacity.quantity \* NormalizedMRShare
FinalAllocation = min(RawAllocation, MutualDesire)
Redistribute unused capacity among unsatisfied mutually-desiring recipients iteratively

Zero-waste Redistribution (iterative)

Keep a worklist of unsatisfied recipients; while leftover > epsilon: recompute normalized MR among unsatisfied recipients and allocate proportionally; stop when no more progress.

---

Execution Model

**Current Implementation (CLI + P2P):**

1. Participants register via CLI commands, storing data in local Holster/Gun nodes
2. Capacities declared via CLI and synced across P2P network
3. Desires expressed via CLI and stored in distributed graph
4. Allocation computation runs locally using `crypto-core.ts` algorithms
5. Results stored in P2P network and accessible via CLI queries
6. Real-time sync via Gun's built-in conflict resolution

**Future/Theoretical (Server + On-chain):**

1. Identity Registry for KYC/VC credentials
2. Discovery Layer with encrypted bloom filters
3. Matching Engine for mutual interest clustering
4. MPC/TEE clusters for privacy-preserving computation
5. ZK-proof generation for allocation verification
6. On-chain anchors for commitments and dispute resolution
7. Capability token issuance and redemption infrastructure

---

Tokenless Smart Contracts & Capabilities

Principles

Recognition values must not be fungible tokens. Instead, use capability tokens or signed one-time vouchers to represent an execution right that is non-transferable and bound to DIDs.

Capability Token Design

Capability = sign( provider_DID, recipient_DID, capacity_id, slot_id, nonce, expiry )

Stored as a signed JSON object; verifiable by any verifier via provider public key.

Not transferable: verifier checks recipient_DID.

On-chain Anchors

Only store small commitments: hash(commitment_blob) and meta (capacity id, timestamp, zk-proof reference, dispute timeout).

Optionally store capability revocation lists (CRLs) if a provider cancels.

---

User Interface

**Current Implementation (CLI):**

```bash
# Identity & Onboarding
rdx register --did <did> --name <name>
rdx list-participants

# Recognition
rdx set-recognition --from-did <did> --to-did <did> --percentage <num>

# Capacities
rdx declare-capacity --provider-did <did> --type <type> --quantity <num> --unit <unit>
rdx list-capacities [--provider <did>]

# Desires
rdx express-desire --recipient-did <did> --capacity-id <id> --quantity <num>

# Allocation
rdx compute-allocation --provider-did <did> --capacity-id <id> [--use-tee]
rdx show-allocation --did <did> --capacity-id <id>
```

See [CLI_GUIDE.md](CLI_GUIDE.md) for complete command reference.

**Future/Theoretical (REST + WebSocket API):**

```
POST /v1/participants - register DID + credentials
GET /v1/participants/{did} - public metadata
POST /v1/capacities - publish capacity
GET /v1/capacities?filter= - discover capacities
POST /v1/commitments/recognition - commit recognition
POST /v1/commitments/desire - commit desire
POST /v1/match - request matching (returns job_id)
WS /v1/jobs/{job_id} - real-time updates
POST /v1/allocations/{job_id}/confirm - confirm allocation
GET /v1/capabilities/{cap_id} - fetch capability
POST /v1/capabilities/{cap_id}/redeem - redeem capability
POST /v1/disputes - open dispute
```

---

Governance & Upgradability

On-chain Governance Registry stores protocol parameters (e.g., MPC/Tee operators, dispute arbitrators, oracle configs).

Governance model can be hybrid: democratic within an association (one-member-one-vote), delegated reputation, or council of stewards (for sovereign-level implementations).

Upgrades to computation logic require multi-signature of governance council plus zk-proof of backward-compatibility migrations.

---

Dispute Resolution

1. Automated Reconciliation: First attempt: verify receipts, signatures, and zk-proofs.

2. Mediation: If mismatch, auto-initiate a mediation window where both parties can submit clarifying evidence.

3. Arbitration: If unresolved, an arbitrator (pre-registered DID or institutional arbitrator) can request MPC inputs reveal under threshold encryption and issue binding ruling.

4. Punitive Measures: Repeated dishonest declarations may result in loss of reputation, temporary suspension, or removal from certain capacity classes. Reputation records are anchored but privacy-preserving (hashed reputation buckets unless consented to reveal).

---

Scaling & Performance

Sharding by Social Graph: Partition matching and compute by social subnetworks to localize computation.

Hierarchical Aggregation: Aggregate MR values at organizational nodes to reduce pairwise computations (sums & mins are associative under some transforms).

Asynchronous MPC Pools: Use rotating MPC operator pools, with job batching.

Cache & Incremental Compute: Store previous MR-normalization denominators and incremental deltas for small recognition updates.

---

Oracles & Data-Stream Integration

Capacities referencing external data (e.g., a sensor stream) declare an oracle_source with an oracle attestation method (TLSNotary, Chainlink-like signer, or direct signed telemetry). Oracle attestations are required to settle allocations tied to data outcomes.

Use authenticated data feeds, with signed checkpoints anchored on-chain for audits.

---

Legal & Compliance Considerations

KYC/AML: Where capacities have legal exposure (money-like exchanges, cross-border regulated services), require VC attestations for KYC.

Securities/Derivatives Law: Recognition derivatives that resemble financial options may trigger securities or derivatives laws. Design RDX to avoid fungible monetary payouts by default; if monetary settlement is desired, route via registered entity (swap dealer / licensed intermediary).

Data Protection: Comply with GDPR/CCPA: keep personal data encrypted and revealable only with consent or legal process.

---

Example Flows

Flow A — Individual Writing a "lesson" Option

1. Alice (provider) declares Capacity: 10 piano-hours/week, slotized. Commits declaration and posts hash.

2. Bob expresses Desire: 2 piano-hours/week; posts commitment.

3. System computes MR(Alice,Bob). If mutual-desire positive and allocation algorithm returns 2 hours, MPC produces allocation & zk-proof.

4. Alice signs capability for Bob for specific slots: cap = sign(Alice, Bob, cap_id, slot_ids, expiry).

5. Bob redeems capability; system records fulfilled allocation.

Flow B — Organization Offering Compute Capacity as Options

1. Org X publishes 1000 CPU-hours as capacities with filters requiring Org-level credentials.

2. Multiple recipients (startups) express desires; MR-based normalizations compute proportional allocations.

3. Organization issues non-transferable access-vouchers to recipients.

Flow C — Country-Level Mutual-Recognition Clearing

1. Country A and B exchange signed policy recognitions by Ministries (anchored commitments).

2. MR determines quotas for data-access or technical assistance. Capacities are national project slots (e.g., satellite time)

3. Settlement occurs via executed capacity allocations (scheduling, remote access credentials), not currency transfers.

---

UX Notes

Default views should emphasize privacy and simple consent flows.

Allow participants to preview effective allocations before confirm (showing aggregated MR normalization but not raw peer recognitions).

Provide explainable AI/graphs showing how recognition shifts influence allocations.

---

Roadmap & Implementation Phases

1. ✅ **Phase 0 — Proof-of-Concept (COMPLETE)**: TypeScript implementation with CLI, P2P storage via Holster/Gun, local MPC simulation, full allocation algorithms, Pedersen commitments, Shamir secret sharing, garbled circuits.

2. 🚧 **Phase 1 — Privacy-Preserving MVP (IN PROGRESS)**: Web UI, distributed MPC coordination, on-chain commitment anchors, basic dispute flow, public discovery layer.

3. 📋 **Phase 2 — Interoperability (PLANNED)**: Oracle integration, DID ecosystem bridges, calendar/resource connectors, enterprise pilots, mobile apps.

4. 🔮 **Phase 3 — Sovereign Pilots (FUTURE)**: Regulatory sandbox implementations, country-to-country pilots for specific capacities (e.g., disaster response, technical assistance).

---

Risks & Mitigations

Data manipulation: Require signed telemetry & multiple oracle attestations. Use slashing of reputation for provable lies.

Sybil attacks: Use reputation credentials, VC attestations, social-graph proofs, or limited-capacity onboarding.

Legal classification as securities: Keep default settlement non-monetary; use licensed intermediaries for monetary components.

Computation cost: Use batched MPC and incremental computations; limit global full-graph recomputation frequency.

---

Appendix: Example Signed Capability JSON

{
"capability_id": "urn:cap:uuid-...",
"provider": "did:example:alice",
"recipient": "did:example:bob",
"capacity_id": "uuid-...",
"slot_ids": ["slot-..."],
"quantity": 2,
"nonce": "...",
"expiry": "2026-01-01T00:00:00Z",
"signature": "sig_base64"
}

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct before submitting PRs.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Links

- **[CLI Guide](CLI_GUIDE.md)** - Detailed command reference
- **[Architecture Documentation](ARCHITECTURE.md)** - System design and implementation
- **[Technical Reports](docs/reports/)** - Migration guides and implementation notes

## 💬 Support

For questions, issues, or discussions:

- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review the CLI Guide for usage examples

---

**Status**: Production-ready TypeScript implementation  
**Version**: 1.0.0  
**Last Updated**: October 2025
