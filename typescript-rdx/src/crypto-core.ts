/**
 * RDX Recognition Derivatives Exchange
 * Core Cryptographic Primitives - TypeScript Implementation
 *
 * This module provides:
 * 1. Pedersen commitments (elliptic curve based)
 * 2. Shamir secret sharing (threshold cryptography)
 * 3. MPC protocol for secure computation
 * 4. Allocation algorithms
 */

import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "crypto";
import secrets from "secrets.js-grempe";
import type {
  Commitment,
  Share,
  AllocationResult,
  AllocationOutput,
  MPCShare,
  AvailabilitySlot,
  MutualDesire,
  ProviderDesire,
  SlotAllocationResult,
} from "./schemas.js";

// Re-export types
export type {
  Commitment,
  Share,
  AllocationResult,
  AllocationOutput,
  MPCShare,
  AvailabilitySlot,
  MutualDesire,
  ProviderDesire,
  SlotAllocationResult,
};

// Filter function type
export type FilterPredicate = (
  recipientId: string,
  context: FilterContext
) => boolean;

export interface FilterContext {
  recipientMetadata?: Record<string, any>;
  capacityMetadata?: Record<string, any>;
}

// ============================================================================
// Constants
// ============================================================================

// Pedersen commitment generators
const G_PEDERSEN = secp256k1.ProjectivePoint.BASE;

// Second generator H (derived using hash-to-curve)
// H = hash_to_curve("RDX_Pedersen_H")
const H_PEDERSEN_X = BigInt(
  "0x50929B74C1A04954B78B4B6035E97A5E078A5A0F28EC96D547BFEE9ACE803AC0"
);
const H_PEDERSEN_Y = BigInt(
  "0x31D3C6863973926E049E637CB1B5F40A36DAC28AF1766968C30C2313F3A38904"
);
const H_PEDERSEN = new secp256k1.ProjectivePoint(
  H_PEDERSEN_X,
  H_PEDERSEN_Y,
  BigInt(1)
);

// ============================================================================
// Pedersen Commitments
// ============================================================================

/**
 * Create a Pedersen commitment: C = value*G + randomness*H
 *
 * Properties:
 * - Computationally hiding: Cannot determine value without randomness
 * - Perfectly binding: Cannot open to two different values
 * - Homomorphic: C(v1) + C(v2) = C(v1 + v2)
 *
 * @param value - Value to commit (0-100 for percentages, scaled by 10000)
 * @param randomness - 32 bytes of randomness (generated if not provided)
 * @returns Commitment object with 64-byte value and 32-byte randomness
 */
export function commit(value: number, randomness?: Uint8Array): Commitment {
  const rand = randomness || randomBytes(32);

  if (rand.length !== 32) {
    throw new Error("Randomness must be exactly 32 bytes");
  }

  // Scale float to integer (0.01% precision for percentages)
  const valueInt = BigInt(Math.floor(value * 10000));
  const randInt = bytesToBigInt(rand);

  // Compute C = valueInt * G + randInt * H
  const gTerm = G_PEDERSEN.multiply(valueInt);
  const hTerm = H_PEDERSEN.multiply(randInt);
  const commitmentPoint = gTerm.add(hTerm);

  // Serialize point as 64 bytes (x || y)
  const affinePoint = commitmentPoint.toAffine();
  const xBytes = bigIntToBytes(affinePoint.x, 32);
  const yBytes = bigIntToBytes(affinePoint.y, 32);

  const commitmentValue = new Uint8Array(64);
  commitmentValue.set(xBytes, 0);
  commitmentValue.set(yBytes, 32);

  return {
    value: commitmentValue,
    randomness: new Uint8Array(
      rand.buffer,
      rand.byteOffset,
      rand.byteLength
    ) as Uint8Array<ArrayBuffer>,
  };
}

/**
 * Verify a commitment opening
 *
 * @param commitment - The commitment to verify
 * @param value - The claimed value
 * @param randomness - The claimed randomness
 * @returns True if the opening is valid
 */
export function verifyCommitment(
  commitment: Commitment,
  value: number,
  randomness: Uint8Array
): boolean {
  try {
    const recomputed = commit(value, randomness);
    return constantTimeEqual(commitment.value, recomputed.value);
  } catch {
    return false;
  }
}

// ============================================================================
// Shamir Secret Sharing
// ============================================================================

export class SecretSharing {
  private readonly threshold: number;

  constructor(threshold: number) {
    if (threshold < 2) {
      throw new Error("Threshold must be at least 2");
    }
    this.threshold = threshold;
  }

  /**
   * Split a value into shares using Shamir secret sharing
   *
   * @param value - Value to share (will be scaled to integer)
   * @param numShares - Total number of shares to create
   * @returns Array of shares
   */
  share(value: number, numShares: number): Share[] {
    if (numShares < this.threshold) {
      throw new Error(`Need at least ${this.threshold} shares`);
    }

    // Scale to integer with 6 decimal precision
    const valueInt = Math.floor(value * 1_000_000);
    const valueHex = valueInt.toString(16).padStart(16, "0");

    // Use secrets.js-grempe for proper Shamir sharing
    const shareStrings = secrets.share(valueHex, numShares, this.threshold);

    return shareStrings.map(
      (shareStr: string, index: number): Share => ({
        index: index + 1,
        value: shareStr,
      })
    );
  }

  /**
   * Reconstruct a value from shares
   *
   * @param shares - At least threshold shares
   * @returns Reconstructed value
   */
  reconstruct(shares: Share[]): number {
    if (shares.length < this.threshold) {
      throw new Error(
        `Insufficient shares: need ${this.threshold}, got ${shares.length}`
      );
    }

    const shareStrings = shares.slice(0, this.threshold).map((s) => s.value);
    const valueHex = secrets.combine(shareStrings);
    const valueInt = parseInt(valueHex, 16);

    return valueInt / 1_000_000;
  }
}

// ============================================================================
// MPC Protocol
// ============================================================================

export class MPCProtocol {
  private readonly numNodes: number;
  private readonly secretSharing: SecretSharing;

  constructor(numNodes: number = 3) {
    if (numNodes < 3) {
      throw new Error("MPC requires at least 3 nodes");
    }

    this.numNodes = numNodes;
    const threshold = Math.floor(numNodes / 2) + 1;
    this.secretSharing = new SecretSharing(threshold);
  }

  /**
   * Share a value across MPC nodes
   */
  secretShare(value: number, numShares: number): Share[] {
    return this.secretSharing.share(value, numShares);
  }

  /**
   * Reconstruct value from shares
   */
  reconstruct(shares: Share[]): number {
    return this.secretSharing.reconstruct(shares);
  }

  /**
   * Compute mutual recognition: MR = min(R[A][B], R[B][A])
   *
   * This is done securely using garbled circuits for the min operation
   */
  async computeMutualRecognition(
    sharesA: Share[],
    sharesB: Share[]
  ): Promise<Share[]> {
    // For simplicity, we reconstruct and compute min
    // In production, this would use garbled circuits
    const valueA = this.reconstruct(sharesA);
    const valueB = this.reconstruct(sharesB);
    const minValue = Math.min(valueA, valueB);

    return this.secretShare(minValue, this.numNodes);
  }

  /**
   * Secure minimum using garbled circuits
   * NOTE: This is a simplified version. Full implementation would use
   * the garbled circuits module for true secure computation.
   */
  async secureMin(sharesA: Share[], sharesB: Share[]): Promise<Share[]> {
    return this.computeMutualRecognition(sharesA, sharesB);
  }

  /**
   * Compute normalized allocation based on mutual recognition shares
   *
   * @param mrShares - Map of recipient IDs to their MR shares
   * @param totalCapacity - Total capacity to allocate
   * @param desires - Map of recipient IDs to desired amounts
   * @returns Allocation results
   */
  computeNormalizedAllocation(
    mrShares: Record<string, Share[]>,
    totalCapacity: number,
    desires: Record<string, number>
  ): AllocationResult {
    // Reconstruct all MR values
    const mrValues: Record<string, number> = {};
    for (const [recipientId, shares] of Object.entries(mrShares)) {
      mrValues[recipientId] = this.reconstruct(shares);
    }

    // Filter recipients with positive MR
    const validRecipients = Object.entries(mrValues).filter(([, mr]) => mr > 0);

    if (validRecipients.length === 0) {
      return {};
    }

    // Calculate total MR
    const totalMR = validRecipients.reduce((sum, [, mr]) => sum + mr, 0);

    // Initial proportional allocation
    const allocations: Record<string, number> = {};
    let remaining = totalCapacity;

    for (const [recipientId, mr] of validRecipients) {
      const proportionalShare = (mr / totalMR) * totalCapacity;
      const desire = desires[recipientId] || 0;
      const allocated = Math.min(proportionalShare, desire);

      allocations[recipientId] = allocated;
      remaining -= allocated;
    }

    // Redistribute remaining capacity (zero-waste)
    if (remaining > 0.01) {
      const unsatisfied = validRecipients.filter(([recipientId, mr]) => {
        const allocated = allocations[recipientId];
        const proportional = (mr / totalMR) * totalCapacity;
        return allocated < proportional;
      });

      if (unsatisfied.length > 0) {
        const unsatisfiedTotalMR = unsatisfied.reduce(
          (sum, [, mr]) => sum + mr,
          0
        );

        for (const [recipientId, mr] of unsatisfied) {
          const extraShare = (mr / unsatisfiedTotalMR) * remaining;
          allocations[recipientId] += extraShare;
        }
      }
    }

    return allocations;
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
  computeSlotAllocation(
    slot: AvailabilitySlot,
    mrShares: Record<string, Share[]>,
    recipientDesires: Record<string, number>,
    providerDesires: Record<string, number>,
    filterPredicate?: FilterPredicate,
    filterContext?: FilterContext
  ): SlotAllocationResult {
    const timestamp = new Date().toISOString();

    // Phase 1: Reconstruct all MR values
    const mrValues: Record<string, number> = {};
    for (const [recipientId, shares] of Object.entries(mrShares)) {
      mrValues[recipientId] = this.reconstruct(shares);
    }

    // Phase 2: Apply filters to get specific shares
    let filteredMRValues: Record<string, number> = {};

    if (filterPredicate && filterContext) {
      // Apply filter and normalize among filtered recipients
      for (const [recipientId, mrValue] of Object.entries(mrValues)) {
        if (mrValue > 0 && filterPredicate(recipientId, filterContext)) {
          filteredMRValues[recipientId] = mrValue;
        }
      }
    } else {
      // No filter, use all recipients with positive MR
      filteredMRValues = { ...mrValues };
    }

    // Filter only those with positive MR
    const validRecipients = Object.entries(filteredMRValues).filter(
      ([, mr]) => mr > 0
    );

    if (validRecipients.length === 0) {
      // No valid recipients - return empty allocation
      return {
        slotId: slot.id,
        totalQuantity: slot.quantity,
        allocations: {},
        unusedCapacity: slot.quantity,
        mutualDesires: {},
        normalizedShares: {},
        redistributionAmounts: {},
        timestamp,
      };
    }

    // Phase 3: Calculate mutual desires
    const mutualDesires: Record<
      string,
      { recipientDesire: number; providerDesire: number; mutual: number }
    > = {};

    for (const [recipientId] of validRecipients) {
      const recipientDesire = recipientDesires[recipientId] || 0;
      const providerDesire = providerDesires[recipientId] || 0;
      const mutual = Math.min(recipientDesire, providerDesire);

      if (mutual > 0) {
        mutualDesires[recipientId] = {
          recipientDesire,
          providerDesire,
          mutual,
        };
      }
    }

    // Filter to only mutually desiring recipients
    const mutuallyDesiringRecipients = validRecipients.filter(
      ([recipientId]) => (mutualDesires[recipientId]?.mutual || 0) > 0
    );

    if (mutuallyDesiringRecipients.length === 0) {
      // No mutual desires - return empty allocation
      return {
        slotId: slot.id,
        totalQuantity: slot.quantity,
        allocations: {},
        unusedCapacity: slot.quantity,
        mutualDesires,
        normalizedShares: {},
        redistributionAmounts: {},
        timestamp,
      };
    }

    // Phase 4: Normalize MR shares among mutually desiring recipients
    const totalMR = mutuallyDesiringRecipients.reduce(
      (sum, [, mr]) => sum + mr,
      0
    );

    const normalizedShares: Record<string, number> = {};
    for (const [recipientId, mr] of mutuallyDesiringRecipients) {
      normalizedShares[recipientId] = mr / totalMR;
    }

    // Phase 5: Initial proportional allocation constrained by mutual desire
    const allocations: Record<string, number> = {};
    let usedCapacity = 0;

    for (const [recipientId, normalizedShare] of Object.entries(
      normalizedShares
    )) {
      const rawAllocation = slot.quantity * normalizedShare;
      const mutualDesire = mutualDesires[recipientId]?.mutual || 0;
      const constrainedAllocation = Math.min(rawAllocation, mutualDesire);

      if (constrainedAllocation > 0) {
        allocations[recipientId] = constrainedAllocation;
        usedCapacity += constrainedAllocation;
      }
    }

    // Phase 6: Zero-waste redistribution
    let unusedCapacity = slot.quantity - usedCapacity;
    const redistributionAmounts: Record<string, number> = {};

    if (unusedCapacity > 0.01) {
      // Find unsatisfied recipients
      const unsatisfiedRecipients = mutuallyDesiringRecipients.filter(
        ([recipientId, mr]) => {
          const allocated = allocations[recipientId] || 0;
          const proportional = (mr / totalMR) * slot.quantity;
          const mutualDesire = mutualDesires[recipientId]?.mutual || 0;
          return allocated < Math.min(proportional, mutualDesire);
        }
      );

      if (unsatisfiedRecipients.length > 0) {
        const unsatisfiedTotalMR = unsatisfiedRecipients.reduce(
          (sum, [, mr]) => sum + mr,
          0
        );

        for (const [recipientId, mr] of unsatisfiedRecipients) {
          const redistributionShare = mr / unsatisfiedTotalMR;
          const redistributionAmount = unusedCapacity * redistributionShare;
          const currentAllocation = allocations[recipientId] || 0;
          const mutualDesire = mutualDesires[recipientId]?.mutual || 0;
          const maxAdditional = mutualDesire - currentAllocation;
          const actualRedistribution = Math.min(
            redistributionAmount,
            maxAdditional
          );

          if (actualRedistribution > 0) {
            redistributionAmounts[recipientId] = actualRedistribution;
            allocations[recipientId] = currentAllocation + actualRedistribution;
            usedCapacity += actualRedistribution;
          }
        }

        unusedCapacity = slot.quantity - usedCapacity;
      }
    }

    return {
      slotId: slot.id,
      totalQuantity: slot.quantity,
      allocations,
      unusedCapacity,
      mutualDesires,
      normalizedShares,
      redistributionAmounts,
      timestamp,
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
  computeMultiSlotAllocation(
    slots: AvailabilitySlot[],
    mrShares: Record<string, Share[]>,
    recipientDesires: Record<string, Record<string, number>>, // recipientId -> slotId -> amount
    providerDesires: Record<string, Record<string, number>>, // recipientId -> slotId -> amount
    filterPredicate?: FilterPredicate,
    filterContext?: FilterContext
  ): SlotAllocationResult[] {
    const results: SlotAllocationResult[] = [];

    for (const slot of slots) {
      // Extract slot-specific desires
      const slotRecipientDesires: Record<string, number> = {};
      const slotProviderDesires: Record<string, number> = {};

      for (const recipientId of Object.keys(mrShares)) {
        slotRecipientDesires[recipientId] =
          recipientDesires[recipientId]?.[slot.id] || 0;
        slotProviderDesires[recipientId] =
          providerDesires[recipientId]?.[slot.id] || 0;
      }

      const slotResult = this.computeSlotAllocation(
        slot,
        mrShares,
        slotRecipientDesires,
        slotProviderDesires,
        filterPredicate,
        filterContext
      );

      results.push(slotResult);
    }

    return results;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (const byte of bytes) {
    result = (result << BigInt(8)) | BigInt(byte);
  }
  return result;
}

function bigIntToBytes(value: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  let temp = value;

  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(temp & BigInt(0xff));
    temp = temp >> BigInt(8);
  }

  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
}

// ============================================================================
// TEE Simulator
// ============================================================================

export class TEESimulator {
  /**
   * Simulate allocation computation in a Trusted Execution Environment
   */
  computeAllocationInEnclave(
    recognitionCommitments: Array<{
      from: string;
      to: string;
      commitment: Commitment;
      value: number;
      randomness: Uint8Array;
    }>,
    capacityTotal: number,
    desires: Record<string, number>
  ): AllocationOutput {
    // Verify all commitments
    for (const rec of recognitionCommitments) {
      if (!verifyCommitment(rec.commitment, rec.value, rec.randomness)) {
        throw new Error(`Invalid commitment from ${rec.from} to ${rec.to}`);
      }
    }

    // Compute mutual recognition
    const mrValues: Record<string, number> = {};
    const participants = new Set<string>();

    for (const rec of recognitionCommitments) {
      participants.add(rec.from);
      participants.add(rec.to);
    }

    // Build MR matrix (simplified - assumes pairwise commitments exist)
    for (const rec of recognitionCommitments) {
      const reverseRec = recognitionCommitments.find(
        (r) => r.from === rec.to && r.to === rec.from
      );

      if (reverseRec) {
        const mr = Math.min(rec.value, reverseRec.value);
        mrValues[rec.to] = (mrValues[rec.to] || 0) + mr;
      }
    }

    // Compute allocations
    const totalMR = Object.values(mrValues).reduce((sum, mr) => sum + mr, 0);
    const allocations: Array<{
      recipientDid: string;
      quantityAllocated: number;
    }> = [];

    if (totalMR > 0) {
      for (const [recipientDid, mr] of Object.entries(mrValues)) {
        const proportional = (mr / totalMR) * capacityTotal;
        const desire = desires[recipientDid] || 0;
        const allocated = Math.min(proportional, desire);

        if (allocated > 0) {
          allocations.push({
            recipientDid,
            quantityAllocated: allocated,
          });
        }
      }
    }

    // Generate attestation
    const attestationData = Buffer.from(
      `RDX_Allocation_Enclave_v1:${allocations.length}:${capacityTotal}`
    );
    const attestationHash = sha256(attestationData);
    const attestation = new Uint8Array(
      attestationHash.buffer,
      attestationHash.byteOffset,
      attestationHash.byteLength
    ) as Uint8Array<ArrayBuffer>;

    return { allocations, attestation };
  }
}

// ============================================================================
// Additional Exports (aliases for convenience)
// ============================================================================

export { commit as createCommitment, verifyCommitment as verify };
