# 🚀 RDX CLI - Complete Usage Guide

## Quick Start

```bash
# Make sure you're in the typescript-rdx directory
cd typescript-rdx

# Run any command with bun
bun run cli -- <command> [options]
```

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Commands Overview](#commands-overview)
3. [Step-by-Step Tutorial](#step-by-step-tutorial)
4. [Command Reference](#command-reference)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)

---

## Installation

```bash
# Install dependencies
bun install

# Build the project (optional, for production)
bun run build
```

---

## Commands Overview

| Command              | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `register`           | Register a new participant                      |
| `list-participants`  | List all registered participants                |
| `set-recognition`    | Set recognition value between two participants  |
| `declare-capacity`   | Declare a new capacity (what you can provide)   |
| `list-capacities`    | List all declared capacities                    |
| `express-desire`     | Express desire for a capacity (what you want)   |
| `compute-allocation` | Compute allocations based on mutual recognition |
| `show-allocation`    | Show computed allocations for a capacity        |

---

## Step-by-Step Tutorial

### Scenario: Alice offers piano lessons, Bob wants to learn

#### Step 1: Register Participants

```bash
# Register Alice (the provider)
bun run cli -- register \
  --did "did:example:alice" \
  --name "Alice"

# Register Bob (the recipient)
bun run cli -- register \
  --did "did:example:bob" \
  --name "Bob"
```

**Output:**

```
🔐 Registering participant...
   DID: did:example:alice
   Name: Alice

✅ Successfully registered Alice
   You can now declare capacities and express desires.
```

#### Step 2: Verify Registration

```bash
bun run cli -- list-participants
```

**Output:**

```
👥 Registered Participants:

──────────────────────────────────────────────────────────────────────
  Alice
  DID: did:example:alice
  Key: a3b5c7d9e1f3a5b7...
──────────────────────────────────────────────────────────────────────
  Bob
  DID: did:example:bob
  Key: b4c6d8e0f2a4b6c8...
──────────────────────────────────────────────────────────────────────
```

#### Step 3: Set Mutual Recognition

```bash
# Alice recognizes Bob at 15%
bun run cli -- set-recognition \
  --from-did "did:example:alice" \
  --to-did "did:example:bob" \
  --percentage 15

# Bob recognizes Alice at 20%
bun run cli -- set-recognition \
  --from-did "did:example:bob" \
  --to-did "did:example:alice" \
  --percentage 20
```

**Output:**

```
🤝 Setting recognition:
   From: did:example:alice
   To: did:example:bob
   Recognition: 15%

🔒 Creating cryptographic commitment...
✅ Recognition commitment stored
   Commitment: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...
   (Recognition value is kept private)
```

#### Step 4: Alice Declares Her Capacity

```bash
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "piano_lessons" \
  --quantity 10 \
  --unit "hours/week"
```

**Output:**

```
📦 Declaring capacity:
   Provider: did:example:alice
   Type: piano_lessons
   Quantity: 10 hours/week

✅ Capacity declared successfully
   Capacity ID: cap-a1b2c3d4e5f6a7b8
   Recipients can now express desire for this capacity
```

#### Step 5: List Available Capacities

```bash
bun run cli -- list-capacities
```

**Output:**

```
📦 Available Capacities:

──────────────────────────────────────────────────────────────────────
  piano_lessons
  ID: cap-a1b2c3d4e5f6a7b8
  Provider: did:example:alice
  Quantity: 10 hours/week
──────────────────────────────────────────────────────────────────────
```

#### Step 6: Bob Expresses Desire

```bash
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-a1b2c3d4e5f6a7b8" \
  --quantity 2
```

**Output:**

```
💭 Expressing desire:
   Recipient: did:example:bob
   Capacity: cap-a1b2c3d4e5f6a7b8
   Quantity: 2

✅ Desire expressed successfully
   Use compute-allocation to calculate allocations
```

#### Step 7: Compute Allocation

```bash
bun run cli -- compute-allocation \
  --capacity-id "cap-a1b2c3d4e5f6a7b8" \
  --use-tee
```

**Output:**

```
⚙️  Computing allocation for capacity: cap-a1b2c3d4e5f6a7b8
   Provider: did:example:alice
   Total: 10 hours/week

📊 Found 1 desire(s)

   Processing recipient: did:example:bob

🔐 Running secure computation...

✅ Allocation computed successfully!

📊 Results:

──────────────────────────────────────────────────────────────────────
   Recipient: did:example:bob
   Allocated: 2.00 hours/week
──────────────────────────────────────────────────────────────────────

🔐 TEE Attestation: RDX_Allocation_Enclave_v1
```

#### Step 8: View Final Allocation

```bash
bun run cli -- show-allocation \
  --capacity-id "cap-a1b2c3d4e5f6a7b8"
```

**Output:**

```
📊 Allocations:

──────────────────────────────────────────────────────────────────────
   Recipient: did:example:bob
   Allocated: 2 hours/week
   Confirmed: No
──────────────────────────────────────────────────────────────────────
```

---

## Command Reference

### `register`

Register a new participant in the RDX system.

**Usage:**

```bash
bun run cli -- register --did <DID> --name <NAME> [--public-key <KEY>]
```

**Options:**

- `--did` (required): Decentralized Identifier (e.g., `did:example:alice`)
- `--name` (required): Human-readable name
- `--public-key` (optional): Public key for cryptographic operations

**Example:**

```bash
bun run cli -- register \
  --did "did:example:charlie" \
  --name "Charlie" \
  --public-key "0x1234567890abcdef"
```

---

### `list-participants`

List all registered participants.

**Usage:**

```bash
bun run cli -- list-participants
```

**No options required**

---

### `set-recognition`

Set recognition value from one participant to another (creates a cryptographic commitment).

**Usage:**

```bash
bun run cli -- set-recognition \
  --from-did <FROM_DID> \
  --to-did <TO_DID> \
  --percentage <VALUE>
```

**Options:**

- `--from-did` (required): DID of the recognizer
- `--to-did` (required): DID of the recognized
- `--percentage` (required): Recognition percentage (0-100)

**Example:**

```bash
bun run cli -- set-recognition \
  --from-did "did:example:alice" \
  --to-did "did:example:bob" \
  --percentage 25
```

**Note:**

- Recognition is **directional** (A→B is separate from B→A)
- Recognition values are kept **private** using Pedersen commitments
- **Mutual Recognition** = min(R[A][B], R[B][A])

---

### `declare-capacity`

Declare a capacity you can provide to others.

**Usage:**

```bash
bun run cli -- declare-capacity \
  --provider-did <DID> \
  --type <TYPE> \
  --quantity <NUMBER> \
  --unit <UNIT> \
  [--filters <JSON>]
```

**Options:**

- `--provider-did` (required): Your DID
- `--type` (required): Type of capacity (e.g., `consulting`, `piano_lessons`)
- `--quantity` (required): Total amount available
- `--unit` (required): Unit of measurement (e.g., `hours/week`, `sessions/month`)
- `--filters` (optional): JSON object with eligibility filters (default: `{}`)

**Examples:**

Simple capacity:

```bash
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "consulting" \
  --quantity 20 \
  --unit "hours/week"
```

With filters:

```bash
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "advanced_training" \
  --quantity 5 \
  --unit "hours/week" \
  --filters '{"skill_level":"advanced","location":"remote"}'
```

---

### `list-capacities`

List all declared capacities, optionally filtered by provider.

**Usage:**

```bash
bun run cli -- list-capacities [--provider <DID>]
```

**Options:**

- `--provider` (optional): Filter by provider DID

**Examples:**

List all capacities:

```bash
bun run cli -- list-capacities
```

List Alice's capacities only:

```bash
bun run cli -- list-capacities --provider "did:example:alice"
```

---

### `express-desire`

Express desire for a specific capacity.

**Usage:**

```bash
bun run cli -- express-desire \
  --recipient-did <DID> \
  --capacity-id <ID> \
  --quantity <NUMBER>
```

**Options:**

- `--recipient-did` (required): Your DID (who wants the capacity)
- `--capacity-id` (required): The capacity ID (from `list-capacities`)
- `--quantity` (required): How much you want

**Example:**

```bash
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-1234567890abcdef" \
  --quantity 3
```

---

### `compute-allocation`

Compute allocations based on mutual recognition and desires.

**Usage:**

```bash
bun run cli -- compute-allocation \
  --capacity-id <ID> \
  [--use-tee]
```

**Options:**

- `--capacity-id` (required): The capacity to allocate
- `--use-tee` (optional): Use TEE simulation with attestation

**Example:**

```bash
bun run cli -- compute-allocation \
  --capacity-id "cap-1234567890abcdef" \
  --use-tee
```

**How it works:**

1. Retrieves all desires for the capacity
2. Computes **Mutual Recognition** for each recipient
3. Normalizes based on MR values
4. Applies **Mutual Desire** constraints
5. Performs **zero-waste redistribution**

---

### `show-allocation`

Display computed allocations for a capacity.

**Usage:**

```bash
bun run cli -- show-allocation --capacity-id <ID>
```

**Options:**

- `--capacity-id` (required): The capacity ID

**Example:**

```bash
bun run cli -- show-allocation \
  --capacity-id "cap-1234567890abcdef"
```

---

## Examples

### Example 1: Simple Two-Person Scenario

```bash
# Setup
bun run cli -- register --did "did:example:alice" --name "Alice"
bun run cli -- register --did "did:example:bob" --name "Bob"

# Mutual recognition (15% min)
bun run cli -- set-recognition --from-did "did:example:alice" --to-did "did:example:bob" --percentage 15
bun run cli -- set-recognition --from-did "did:example:bob" --to-did "did:example:alice" --percentage 20

# Alice offers 10 hours of consulting
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "consulting" \
  --quantity 10 \
  --unit "hours/week"

# Bob wants 5 hours
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-..." \
  --quantity 5

# Compute (Bob gets 5 hours, 5 unused)
bun run cli -- compute-allocation --capacity-id "cap-..."
```

### Example 2: Three-Person Scenario

```bash
# Register everyone
bun run cli -- register --did "did:example:alice" --name "Alice"
bun run cli -- register --did "did:example:bob" --name "Bob"
bun run cli -- register --did "did:example:charlie" --name "Charlie"

# Set up recognition network
# Alice recognizes Bob: 30%, Charlie: 20%
bun run cli -- set-recognition --from-did "did:example:alice" --to-did "did:example:bob" --percentage 30
bun run cli -- set-recognition --from-did "did:example:alice" --to-did "did:example:charlie" --percentage 20

# Bob recognizes Alice: 25%, Charlie: 15%
bun run cli -- set-recognition --from-did "did:example:bob" --to-did "did:example:alice" --percentage 25
bun run cli -- set-recognition --from-did "did:example:bob" --to-did "did:example:charlie" --percentage 15

# Charlie recognizes Alice: 35%, Bob: 20%
bun run cli -- set-recognition --from-did "did:example:charlie" --to-did "did:example:alice" --percentage 35
bun run cli -- set-recognition --from-did "did:example:charlie" --to-did "did:example:bob" --percentage 20

# Alice offers consulting (15 hours/week)
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "consulting" \
  --quantity 15 \
  --unit "hours/week"

# Both Bob and Charlie want some
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-..." \
  --quantity 8

bun run cli -- express-desire \
  --recipient-did "did:example:charlie" \
  --capacity-id "cap-..." \
  --quantity 7

# Compute proportional allocation
# Bob gets: (25/45) * 15 = 8.33 hours → capped at 8 (his desire)
# Charlie gets: (20/45) * 15 = 6.67 hours (within his desire)
bun run cli -- compute-allocation --capacity-id "cap-..."
```

### Example 3: Capacity with Filters

```bash
# Declare a capacity only for advanced users
bun run cli -- declare-capacity \
  --provider-did "did:example:alice" \
  --type "advanced_coaching" \
  --quantity 5 \
  --unit "sessions/month" \
  --filters '{"level":"advanced","verified":true}'

# This is stored but filtering logic would be implemented in future versions
```

---

## Troubleshooting

### Error: "Participant not found"

**Solution:** Make sure you've registered the participant first:

```bash
bun run cli -- register --did "did:example:yourname" --name "Your Name"
```

### Error: "Capacity not found"

**Solution:** List available capacities to get the correct ID:

```bash
bun run cli -- list-capacities
```

### Error: "No desires expressed for this capacity"

**Solution:** At least one person must express desire before computing allocation:

```bash
bun run cli -- express-desire \
  --recipient-did "did:example:bob" \
  --capacity-id "cap-..." \
  --quantity 5
```

### Error: "Missing commitments, skipping..."

**Solution:** Both participants must set mutual recognition before allocation:

```bash
# Provider → Recipient
bun run cli -- set-recognition \
  --from-did "did:example:alice" \
  --to-did "did:example:bob" \
  --percentage 15

# Recipient → Provider
bun run cli -- set-recognition \
  --from-did "did:example:bob" \
  --to-did "did:example:alice" \
  --percentage 20
```

### Tip: Database Location

The CLI stores data in `rdx.db` in the current directory. To reset:

```bash
rm rdx.db
```

---

## Key Concepts

### Mutual Recognition (MR)

```
MR(Alice, Bob) = min(R[Alice][Bob], R[Bob][Alice])
```

The system uses the **minimum** of both directions.

**Example:**

- Alice → Bob: 30%
- Bob → Alice: 20%
- MR = min(30, 20) = **20%**

### Allocation Algorithm

1. **Compute Mutual Recognition** for all recipient-provider pairs
2. **Normalize by total MR**: `NormalizedShare = MR / Sum(all MRs)`
3. **Apply capacity**: `RawAllocation = NormalizedShare * TotalCapacity`
4. **Apply Mutual Desire**: `FinalAllocation = min(RawAllocation, RecipientDesire)`
5. **Redistribute unused capacity** among unsatisfied recipients

### Privacy

- Recognition values are stored as **Pedersen commitments**
- Only commitment hashes are visible, not actual values
- TEE simulation provides **cryptographic attestation**

---

## Next Steps

Ready to use the CLI? Start with the tutorial:

```bash
# 1. Register yourself
bun run cli -- register --did "did:example:yourname" --name "Your Name"

# 2. Explore what's possible
bun run cli -- list-participants
bun run cli -- list-capacities

# 3. Try the examples above!
```

---

**Questions? Issues?**

- Check `TYPESCRIPT_MIGRATION.md` for architecture details
- Check `BUN_VITE_MIGRATION.md` for setup information
- Check `README.md` for system overview

**Happy allocating! 🎉**
