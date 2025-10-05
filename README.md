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

#### Entities

**Participant (P)**: Individual, Organization, or Sovereign

- Has an immutable identifier (DID)
- Owns 100% Total-Recognition
- Can be both provider and recipient

**Recognition Matrix (R)**: For each ordered pair (A,B)

- \( R[A][B] \in [0,100] \)
- Represents A's recognition share of B's contribution towards A's self-actualization
- Percentage of A's Total-Recognition

**Mutual Recognition (MR)**:

- \( MR(A,B) = \min(R[A][B], R[B][A]) \)
- The minimum of bidirectional recognition values

**Capacity (C)**: Declared by a provider with structured metadata

- `type`: Category of capacity (e.g., "piano-lessons", "compute-hours")
- `quantity`: Total amount available
- `unit`: Measurement unit (e.g., "hours/week")
- `slots`: Time/resource subdivisions
- `filters`: Eligibility criteria
- `max_per_recipient`: Optional cap per recipient
- `oracle_source`: External data verification (optional)

**Filter**: Boolean predicate per participant

- Used to compute Specific-Share
- Examples: skills, location, certification status

**Desire (D)**:

- \( D[\text{Recipient}][\text{Provider}][\text{Capacity}] \in \mathbb{N} \)
- Units desired (discrete or continuous)

**Mutual-Desire (MD)**:

- \( MD = \min(\text{Provider_Desire}, \text{Recipient_Desire}) \)
- Both sides must consent

#### Identifiers

- **DIDs**: All participants use Decentralized Identifiers
- **Public Keys**: Sign commitments and declarations
- **UUIDs**: Capacities and slots use UUIDv4

#### Storage Model

**Current Implementation:**

- Fully decentralized P2P storage via Holster/Gun
- Local-first data persistence
- Real-time CRDT synchronization

**Future/Theoretical:**

- On-chain anchors (optional, light) for commitments and state hashes
- IPFS/Arweave for distributed backups with threshold encryption
- Blockchain integration for dispute resolution

---

### Cryptography & Privacy Model

#### Goals

- **Privacy**: Keep recognition values and desires private unless mutually exposed for settlement
- **Verifiability**: Allow cryptographic proofs that allocation rules were followed correctly
- **Non-repudiation**: All declarations are signed and immutable

#### Cryptographic Primitives

1. **DIDs & Verifiable Credentials**
   - Decentralized identity and attributes
   - Self-sovereign identity management

2. **Commitment Schemes** (Pedersen Commitments)
   - Formula: \( C = vG + rH \) where \( v \) is value, \( r \) is randomness
   - Properties: Hiding, binding, homomorphic
   - Used for recognition values and desires

3. **Secure Multi-Party Computation (MPC) / Trusted Execution Environments (TEE)**
   - Compute MR matrices without revealing raw inputs
   - Normalize shares in privacy-preserving manner
   - Current: Local simulation for PoC
   - Future: Distributed MPC clusters

4. **Zero-Knowledge Proofs (ZK-SNARK/PLONK)**
   - Prove correctness of allocation computations
   - Verify without revealing committed inputs
   - Future enhancement for production

5. **Threshold Encryption & Proxy Re-Encryption**
   - Share decrypted results only with authorized parties
   - Arbitrator access in dispute scenarios
   - Future enhancement

6. **Replay-proof Signed Messages**
   - All declarations signed with private keys
   - Timestamped for ordering
   - Prevents replay attacks

#### Privacy Workflows

**Commit Phase:**

- Participants commit hashes/commitments of recognition vectors and desires
- Commitments stored on-chain or in append-only logs
- Timestamps state without revealing values

**Compute Phase:**

- MPC/TEE computes MR, normalized shares, and tentative allocations
- Produces ZK-proofs matching commitments
- No raw values exposed during computation

**Reveal Phase:**

- Only settlement-required data revealed to counterparties
- Signed receipts/confirmations anchored on-chain
- Privacy preserved for non-involved parties

---

### Core Algorithms

#### Phase 1: Mutual Recognition Calculation

**Inputs:**

- Recognition commitments \( R[A][*] \) (encrypted/committed)
- Recognition commitments \( R[\*][A] \)

**Algorithm:**

```
For each pair (A, B) where both have committed:
  MR[A][B] = min(R[A][B], R[B][A])
```

#### Phase 2: General Share Calculation

**Formula:**

```
GeneralShare(U, P) = MR(P, U) / Σ(x in RecipientsOfP) MR(P, x)
```

Where:

- \( U \) is the recipient
- \( P \) is the provider
- Sum is over all recipients with mutual desire

#### Phase 3: Specific Share & Filtering

**Algorithm:**

```
SpecificShare(U, P, Capacity) = GeneralShare(U, P) × Filter(U, Capacity)

NormalizeSpecificShares:
  Σ(all filtered recipients) SpecificShare = 1
```

**Filter examples:**

- Skill level requirements
- Geographic constraints
- Certification status

#### Phase 4: Mutual Desire & Allocation

**Formulas:**

```
MutualDesire(Capacity, Recipient) = min(ProviderDeclared, RecipientRequested)

NormalizedMRShare = MR(Prov, Recipient) / Σ(r in MutuallyDesiring) MR(Prov, r)

RawAllocation = Capacity.quantity × NormalizedMRShare

FinalAllocation = min(RawAllocation, MutualDesire)
```

#### Phase 5: Zero-Waste Redistribution

**Algorithm:**

```
Initialize worklist = unsatisfied_recipients
leftover = total_capacity - allocated

while leftover > ε and len(worklist) > 0:
  recompute normalized_MR among worklist
  allocate proportionally to MR shares
  remove satisfied recipients from worklist
  update leftover

  if no progress: break
```

**Properties:**

- Iterative refinement
- Respects mutual desire constraints
- Minimizes waste
- Converges to optimal allocation

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

### Tokenless Smart Contracts & Capabilities

#### Design Principles

1. **Non-Fungibility**: Recognition values must NOT be tradeable tokens
2. **Non-Transferability**: Allocations bound to specific DIDs
3. **Capability-Based**: Use signed vouchers representing execution rights
4. **Verifiable**: Cryptographic proof of authorization

#### Capability Token Design

**Structure:**

```json
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
```

**Properties:**

- Signed by provider's private key
- Verifiable via provider's public key
- Non-transferable (recipient DID checked)
- Time-bounded (expiry timestamp)
- Replay-protected (nonce)

#### On-Chain Anchors (Future)

**Minimal Storage:**

- Hash of capability blob
- Metadata: capacity ID, timestamp, ZK-proof reference
- Dispute timeout window
- Capability Revocation Lists (CRLs) for cancellations

**Benefits:**

- Small blockchain footprint
- Auditability without revealing details
- Dispute resolution support

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

### Governance & Upgradability

#### Governance Registry (Future)

**On-Chain Parameters:**

- MPC/TEE operator registry
- Dispute arbitrator list
- Oracle configurations
- Protocol versioning

#### Governance Models

**Flexible Governance:**

- **Democratic**: One-member-one-vote for collectives
- **Delegated**: Reputation-weighted voting
- **Steward Council**: Multi-sig for sovereign implementations

**Upgrade Process:**

- Multi-signature approval from governance council
- ZK-proof of backward-compatibility
- Migration testing period
- Graceful fallback mechanisms

---

### Dispute Resolution

#### 4-Stage Process

**1. Automated Reconciliation** (Instant)

- Verify receipts and signatures
- Check ZK-proofs
- Match commitments
- Auto-resolve if valid

**2. Mediation** (72-hour window)

- Both parties submit clarifying evidence
- Automated mismatch detection
- Suggest resolution paths
- Facilitate agreement

**3. Arbitration** (Binding)

- Pre-registered arbitrator (DID)
- Request MPC inputs reveal (threshold encryption)
- Review evidence in secure environment
- Issue binding ruling with reasoning
- Anchor decision on-chain

**4. Punitive Measures** (Reputation)

- Track repeated dishonest behavior
- Reputation scores (privacy-preserving)
- Temporary suspension from capacity classes
- Removal for severe violations
- Hashed reputation buckets (consent to reveal)

---

### Scaling & Performance

#### Optimization Strategies

**Sharding by Social Graph:**

- Partition matching and compute by social subnetworks
- Localize computation to reduce overhead
- Cross-shard coordination for wide networks

**Hierarchical Aggregation:**

- Aggregate MR values at organizational nodes
- Reduce pairwise computations
- Leverage associative properties of min/sum operations

**Asynchronous MPC Pools:**

- Rotating operator pools for availability
- Job batching for efficiency
- Load balancing across nodes

**Cache & Incremental Compute:**

- Store previous MR-normalization denominators
- Compute only deltas for small updates
- Memoize expensive operations

---

### Oracles & Data Integration

#### External Data Sources

**Oracle Declaration:**

- Capacities reference external data streams
- Declare `oracle_source` with attestation method
- Examples: sensor data, API feeds, telemetry

**Attestation Methods:**

- **TLSNotary**: Prove HTTPS responses
- **Chainlink-style**: Decentralized oracle network
- **Signed Telemetry**: Direct from IoT devices

**Settlement Requirements:**

- Oracle attestations required for data-dependent allocations
- Signed checkpoints anchored on-chain
- Audit trail for verification

---

### Legal & Compliance

#### KYC/AML

**Where Required:**

- Money-like exchanges
- Cross-border regulated services
- High-value capacity transfers

**Implementation:**

- Verifiable Credential attestations
- Privacy-preserving KYC (zero-knowledge proofs)
- Regulatory compliance hooks

#### Securities & Derivatives Law

**Design Considerations:**

- **Default**: Non-monetary, non-fungible allocations
- **If Monetary**: Route via registered intermediaries
- **Licensing**: Swap dealer / licensed entity required
- **Regulatory Sandboxes**: Phase 3 pilot programs

#### Data Protection (GDPR/CCPA)

**Compliance Strategy:**

- Personal data encrypted by default
- Right to erasure (revoke commitments)
- Data portability (export allocations)
- Consent-based reveal
- Legal process support

---

### Example Use Cases

#### Flow A: Individual Offering Skills

**Scenario**: Alice offers piano lessons

1. **Declare Capacity**
   - Alice: 10 piano-hours/week, slotized
   - Commits declaration, posts hash

2. **Express Desire**
   - Bob: Wants 2 hours/week
   - Posts commitment

3. **Compute Allocation**
   - System calculates \( MR(\text{Alice}, \text{Bob}) \)
   - If mutual-desire positive: 2 hours allocated
   - MPC produces allocation + ZK-proof

4. **Issue Capability**
   - Alice signs capability for Bob
   - Includes: capacity_id, slot_ids, expiry
   - Non-transferable to Bob's DID

5. **Redeem & Fulfill**
   - Bob redeems capability at lesson time
   - System records fulfilled allocation
   - Both parties confirm delivery

**Current Implementation**: See [RDX-FLOW-CLI.md](RDX-FLOW-CLI.md) for detailed CLI flow

---

#### Flow B: Organization Offering Resources

**Scenario**: Tech collective shares compute infrastructure

1. **Publish Capacity**
   - Org X: 1000 CPU-hours
   - Filters: Org-level credentials required
   - Multiple availability slots

2. **Multiple Recipients**
   - Startups express desires
   - MR-based normalization
   - Proportional allocations computed

3. **Issue Vouchers**
   - Non-transferable access-vouchers
   - Time-bounded credentials
   - Usage tracking and reporting

---

#### Flow C: Sovereign-Level Cooperation

**Scenario**: International mutual aid for disaster response

1. **Policy Recognition**
   - Country A & B exchange signed recognitions
   - Ministry-level commitments
   - Anchored on-chain

2. **Quota Determination**
   - MR determines access quotas
   - Capacities: Satellite time, technical assistance
   - Data-access permissions

3. **Non-Monetary Settlement**
   - Scheduling and credentials (not currency)
   - Remote access tokens
   - Audit trail for accountability

---

### User Experience Guidelines

#### Privacy-First Design

- **Default**: Hide raw recognition values from UI
- **Consent**: Explicit permission for revealing data
- **Aggregates**: Show normalized shares, not absolute values

#### Allocation Preview

**Before Confirmation:**

- Show effective allocation amounts
- Display MR normalization (aggregated)
- Explain filtering results
- Preview slot assignments

**Information Hiding:**

- Don't reveal raw peer recognition percentages
- Show relative shares only
- Protect participant privacy

#### Explainability

**Visual Tools:**

- Graph visualization of recognition network
- Impact analysis: "What if I change this recognition?"
- Allocation flow diagrams
- Sensitivity analysis

**Feedback:**

- Real-time updates as recognition changes
- Notification of new allocations
- Status tracking for capabilities

---

Roadmap & Implementation Phases

1. ✅ **Phase 0 — Proof-of-Concept (COMPLETE)**: TypeScript implementation with CLI, P2P storage via Holster/Gun, local MPC simulation, full allocation algorithms, Pedersen commitments, Shamir secret sharing, garbled circuits.

2. 🚧 **Phase 1 — Privacy-Preserving MVP (IN PROGRESS)**: Web UI, distributed MPC coordination, on-chain commitment anchors, basic dispute flow, public discovery layer.

3. 📋 **Phase 2 — Interoperability (PLANNED)**: Oracle integration, DID ecosystem bridges, calendar/resource connectors, enterprise pilots, mobile apps.

4. 🔮 **Phase 3 — Sovereign Pilots (FUTURE)**: Regulatory sandbox implementations, country-to-country pilots for specific capacities (e.g., disaster response, technical assistance).

---

### Risks & Mitigations

#### Security Risks

| Risk                  | Mitigation Strategy                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Data Manipulation** | • Require signed telemetry<br>• Multiple oracle attestations<br>• Reputation slashing for provable lies<br>• Audit trails on-chain     |
| **Sybil Attacks**     | • Reputation credentials required<br>• VC attestations for identity<br>• Social-graph proof-of-personhood<br>• Rate-limited onboarding |
| **Replay Attacks**    | • Nonce-based commitments<br>• Timestamp validation<br>• Capability expiry enforcement                                                 |
| **MPC Collusion**     | • Threshold security (k-of-n)<br>• Rotating operator pools<br>• ZK-proof verification<br>• Slashing for malicious operators            |

#### Legal Risks

| Risk                          | Mitigation Strategy                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Securities Classification** | • Default: Non-monetary settlement<br>• No fungible tokens<br>• Licensed intermediaries for monetary components<br>• Regulatory sandbox participation |
| **Data Privacy Violations**   | • GDPR/CCPA compliance by design<br>• Encrypted storage<br>• Right to erasure support<br>• Consent-based reveal                                       |
| **Cross-Border Compliance**   | • Jurisdictional hooks<br>• KYC/AML for regulated capacities<br>• Local legal entity partnerships                                                     |

#### Performance Risks

| Risk                    | Mitigation Strategy                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Computation Cost**    | • Batched MPC operations<br>• Incremental computation (deltas only)<br>• Caching of normalization factors<br>• Limit full-graph recomputation frequency |
| **Network Congestion**  | • Sharding by social graph<br>• Hierarchical aggregation<br>• Asynchronous processing<br>• Job prioritization                                           |
| **Storage Scalability** | • IPFS/Arweave for large data<br>• On-chain: minimal anchors only<br>• Pruning of old allocations<br>• Compressed representations                       |

---

### Appendix: Data Formats

#### Example Signed Capability

```json
{
  "capability_id": "urn:cap:uuid-a3f2c871-4d5e-4b8c-9a1f-e7d6c5b4a3f2",
  "provider": "did:example:alice",
  "recipient": "did:example:bob",
  "capacity_id": "cap-piano-lessons-001",
  "slot_ids": ["slot-mon-14:00", "slot-wed-16:00"],
  "quantity": 2,
  "nonce": "7f8e9d0c1b2a3",
  "expiry": "2026-01-01T00:00:00Z",
  "signature": "304502210098abc...def"
}
```

#### Example Commitment

```json
{
  "from_did": "did:example:alice",
  "to_did": "did:example:bob",
  "commitment": "02a7c4e8f9b1d3...",
  "timestamp": "2025-10-05T14:32:15Z",
  "signature": "30450221009def..."
}
```

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
