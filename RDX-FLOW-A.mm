%% RDX Flow A - FUTURE/THEORETICAL Design (Phase 1-2)
%% 
%% ⚠️  This describes the planned server-based architecture with REST APIs.
%% ⚠️  For the CURRENT CLI implementation, see RDX-FLOW-CLI.md
%%
%% Status: Phase 0 (CLI) is complete. This design is planned for Phase 1-2.
%%

sequenceDiagram
participant Alice as Alice (Provider)
participant Bob as Bob (Recipient)
participant IDR as Identity Registry
participant RDX as RDX API Server
participant DS as Discovery Service
participant MPC as MPC/TEE Compute
participant Chain as On-Chain Anchors

    Note over Alice,Chain: FUTURE DESIGN - Phase 1: Registration & Identity Setup

    Alice->>IDR: POST /v1/participants<br/>{did: "did:example:alice", pubkey, credentials}
    IDR-->>Alice: 200 OK {participant_id}
    IDR->>Chain: Anchor DID commitment hash

    Bob->>IDR: POST /v1/participants<br/>{did: "did:example:bob", pubkey, credentials}
    IDR-->>Bob: 200 OK {participant_id}
    IDR->>Chain: Anchor DID commitment hash

    Note over Alice,Chain: Phase 2: Recognition Exchange (Prior Context)

    Alice->>Alice: Generate R[Alice][Bob] = 15%<br/>Compute commitment: C_A = commit(15, r_A)
    Alice->>RDX: POST /v1/commitments/recognition<br/>{from: "alice", to: "bob", commitment: C_A, timestamp}
    RDX->>Chain: Anchor hash(C_A) + metadata
    RDX-->>Alice: 200 OK {commitment_id}

    Bob->>Bob: Generate R[Bob][Alice] = 20%<br/>Compute commitment: C_B = commit(20, r_B)
    Bob->>RDX: POST /v1/commitments/recognition<br/>{from: "bob", to: "alice", commitment: C_B, timestamp}
    RDX->>Chain: Anchor hash(C_B) + metadata
    RDX-->>Bob: 200 OK {commitment_id}

    Note over Alice,Chain: Phase 3: Capacity Declaration

    Alice->>Alice: Create capacity metadata:<br/>{type: "piano_lesson", quantity: 10,<br/>unit: "hours/week", slots: [...],<br/>filters: {skill_min: "beginner"},<br/>max_per_recipient: 3}

    Alice->>Alice: Encrypt capacity details<br/>E_cap = encrypt(capacity, K_alice)

    Alice->>RDX: POST /v1/capacities<br/>{provider: "alice", encrypted_capacity: E_cap,<br/>public_metadata: {type, tags}, signature}
    RDX->>Chain: Anchor hash(E_cap) + public_metadata
    RDX-->>Alice: 200 OK {capacity_id: "cap-uuid-123"}

    RDX->>DS: Publish capacity to discovery<br/>{capacity_id, public_metadata, filters}

    Note over Alice,Chain: Phase 4: Desire Expression & Discovery

    Bob->>DS: Query available capacities<br/>GET /v1/capacities?type=piano_lesson&filter=...
    DS-->>Bob: [{capacity_id: "cap-uuid-123", metadata}]

    Bob->>Bob: Generate desire:<br/>D[Bob][Alice][cap-uuid-123] = 2 hours<br/>Compute commitment: C_D = commit(2, r_D)

    Bob->>RDX: POST /v1/commitments/desire<br/>{recipient: "bob", provider: "alice",<br/>capacity_id: "cap-uuid-123",<br/>commitment: C_D, signature}
    RDX->>Chain: Anchor hash(C_D) + metadata
    RDX-->>Bob: 200 OK {desire_commitment_id}

    Note over Alice,Chain: Phase 5: Matching & MPC Allocation Computation

    Bob->>RDX: POST /v1/match<br/>{capacity_id: "cap-uuid-123",<br/>recipient: "bob", signature}
    RDX-->>Bob: 202 Accepted {job_id: "job-789"}

    RDX->>MPC: Initialize secure computation job<br/>{job_id: "job-789",<br/>participants: ["alice", "bob"],<br/>capacity_id, commitments: [C_A, C_B, C_D]}

    MPC->>MPC: Request commitment openings<br/>from participants via secure channel

    Alice->>MPC: Reveal to MPC: R[Alice][Bob]=15%, r_A
    Bob->>MPC: Reveal to MPC: R[Bob][Alice]=20%, r_B,<br/>D=2, r_D

    MPC->>MPC: Verify commitments:<br/>commit(15, r_A) == C_A ✓<br/>commit(20, r_B) == C_B ✓<br/>commit(2, r_D) == C_D ✓

    MPC->>MPC: Compute MR(Alice, Bob):<br/>MR = min(R[A][B], R[B][A])<br/>= min(15%, 20%) = 15%

    MPC->>MPC: Compute allocation:<br/>GeneralShare(Bob, Alice) = 15% / 15% = 100%<br/>(Bob is only recipient with mutual desire)<br/>Filter(Bob, capacity) = 1 (passes beginner filter)<br/>SpecificShare(Bob, Alice, cap) = 100% * 1 = 100%

    MPC->>MPC: Apply mutual desire:<br/>ProviderDesire = 10 hours available<br/>RecipientDesire = 2 hours requested<br/>MD = min(10, 2) = 2 hours<br/>FinalAllocation(Bob) = min(10 * 100%, 2) = 2 hours

    MPC->>MPC: Generate ZK proof π:<br/>Proves correct computation of MR, normalization,<br/>and allocation without revealing raw R values

    MPC->>RDX: Return computation result<br/>{job_id: "job-789",<br/>allocations: [{recipient: "bob", quantity: 2}],<br/>proof: π, unused_capacity: 8}

    RDX->>Chain: Anchor hash(allocations) + proof reference

    Note over Alice,Chain: Phase 6: Allocation Review & Confirmation

    RDX->>Alice: WebSocket notification<br/>{job_id: "job-789", status: "computed",<br/>proposed_allocation: {bob: 2 hours}}

    RDX->>Bob: WebSocket notification<br/>{job_id: "job-789", status: "computed",<br/>your_allocation: 2 hours}

    Alice->>Alice: Review allocation proposal<br/>(verify proof, check slots available)

    Alice->>RDX: POST /v1/allocations/job-789/confirm<br/>{provider: "alice", approved: true,<br/>slot_ids: ["slot-mon-2pm", "slot-wed-3pm"],<br/>signature}
    RDX-->>Alice: 200 OK

    Bob->>Bob: Review allocation proposal<br/>(verify proof, check slots work for schedule)

    Bob->>RDX: POST /v1/allocations/job-789/confirm<br/>{recipient: "bob", approved: true,<br/>preferred_slots: ["slot-mon-2pm", "slot-wed-3pm"],<br/>signature}
    RDX-->>Bob: 200 OK

    Note over Alice,Chain: Phase 7: Capability Issuance & Settlement

    RDX->>RDX: Both parties confirmed ✓<br/>Generate capability voucher

    RDX->>RDX: Create capability:<br/>{capability_id: "urn:cap:uuid-456",<br/>provider: "did:example:alice",<br/>recipient: "did:example:bob",<br/>capacity_id: "cap-uuid-123",<br/>slot_ids: ["slot-mon-2pm", "slot-wed-3pm"],<br/>quantity: 2, nonce: "...",<br/>expiry: "2025-12-31T23:59:59Z"}

    RDX->>Alice: Sign capability with Alice's private key<br/>signature_alice = sign(capability, sk_alice)

    RDX->>Chain: Anchor capability hash + signature

    RDX->>Bob: POST /v1/capabilities/urn:cap:uuid-456<br/>{capability, signature_alice}

    Bob->>Bob: Store capability voucher securely

    Note over Alice,Chain: Phase 8: Capability Redemption (At Lesson Time)

    Bob->>RDX: POST /v1/capabilities/urn:cap:uuid-456/redeem<br/>{slot_id: "slot-mon-2pm",<br/>recipient_signature, timestamp}

    RDX->>RDX: Verify capability:<br/>- Check recipient DID matches Bob ✓<br/>- Verify Alice's signature ✓<br/>- Check expiry not passed ✓<br/>- Check slot not already redeemed ✓<br/>- Check nonce not replayed ✓

    RDX->>Chain: Record redemption (anti-replay)

    RDX->>Alice: WebSocket notification<br/>{capability_id, slot_id: "slot-mon-2pm",<br/>redeemed_by: "bob", timestamp}

    RDX-->>Bob: 200 OK {redemption_receipt,<br/>access_token: "use-this-for-zoom-link"}

    Alice->>Bob: (External) Deliver lesson via Zoom/physical

    Note over Alice,Chain: Phase 9: Post-Settlement Confirmation

    Bob->>RDX: POST /v1/settlements/urn:cap:uuid-456<br/>{slot_id: "slot-mon-2pm",<br/>confirmed: true, rating: 5,<br/>signature}

    Alice->>RDX: POST /v1/settlements/urn:cap:uuid-456<br/>{slot_id: "slot-mon-2pm",<br/>delivered: true, signature}

    RDX->>Chain: Anchor settlement confirmation<br/>(both signatures + hashes)

    RDX->>RDX: Update reputation metrics<br/>(optional, privacy-preserving buckets)

    Note over Alice,Chain: Alternative Flow: Dispute Resolution

    alt Dispute: Bob claims lesson not delivered
        Bob->>RDX: POST /v1/disputes<br/>{capability_id, slot_id,<br/>claim: "no_delivery",<br/>evidence: encrypted_proof}
        RDX-->>Bob: 200 OK {dispute_id}
        RDX->>Alice: Notify dispute opened
        Alice->>RDX: POST /v1/disputes/{dispute_id}/response<br/>{evidence: encrypted_counter_proof}
        RDX->>MPC: Request arbitration with encrypted evidence
        MPC->>MPC: Arbitrator reviews MPC-decrypted evidence
        MPC->>RDX: Arbitration ruling<br/>{outcome: "refund" | "confirmed",<br/>reasoning, signature}
        RDX->>Chain: Anchor ruling
        RDX->>Bob: Notify outcome
        RDX->>Alice: Notify outcome
    end
