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
import type { Commitment, Share, AllocationResult, AllocationOutput, MPCShare, AvailabilitySlot, MutualDesire, ProviderDesire, SlotAllocationResult } from "./schemas.js";
export type { Commitment, Share, AllocationResult, AllocationOutput, MPCShare, AvailabilitySlot, MutualDesire, ProviderDesire, SlotAllocationResult, };
export type FilterPredicate = (recipientId: string, context: FilterContext) => boolean;
export interface FilterContext {
    recipientMetadata?: Record<string, any>;
    capacityMetadata?: Record<string, any>;
}
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
export declare function commit(value: number, randomness?: Uint8Array): Commitment;
/**
 * Verify a commitment opening
 *
 * @param commitment - The commitment to verify
 * @param value - The claimed value
 * @param randomness - The claimed randomness
 * @returns True if the opening is valid
 */
export declare function verifyCommitment(commitment: Commitment, value: number, randomness: Uint8Array): boolean;
export declare class SecretSharing {
    private readonly threshold;
    constructor(threshold: number);
    /**
     * Split a value into shares using Shamir secret sharing
     *
     * @param value - Value to share (will be scaled to integer)
     * @param numShares - Total number of shares to create
     * @returns Array of shares
     */
    share(value: number, numShares: number): Share[];
    /**
     * Reconstruct a value from shares
     *
     * @param shares - At least threshold shares
     * @returns Reconstructed value
     */
    reconstruct(shares: Share[]): number;
}
export declare class MPCProtocol {
    private readonly numNodes;
    private readonly secretSharing;
    constructor(numNodes?: number);
    /**
     * Share a value across MPC nodes
     */
    secretShare(value: number, numShares: number): Share[];
    /**
     * Reconstruct value from shares
     */
    reconstruct(shares: Share[]): number;
    /**
     * Compute mutual recognition: MR = min(R[A][B], R[B][A])
     *
     * This is done securely using garbled circuits for the min operation
     */
    computeMutualRecognition(sharesA: Share[], sharesB: Share[]): Promise<Share[]>;
    /**
     * Secure minimum using garbled circuits
     * NOTE: This is a simplified version. Full implementation would use
     * the garbled circuits module for true secure computation.
     */
    secureMin(sharesA: Share[], sharesB: Share[]): Promise<Share[]>;
    /**
     * Compute normalized allocation based on mutual recognition shares
     *
     * @param mrShares - Map of recipient IDs to their MR shares
     * @param totalCapacity - Total capacity to allocate
     * @param desires - Map of recipient IDs to desired amounts
     * @returns Allocation results
     */
    computeNormalizedAllocation(mrShares: Record<string, Share[]>, totalCapacity: number, desires: Record<string, number>): AllocationResult;
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
    computeSlotAllocation(slot: AvailabilitySlot, mrShares: Record<string, Share[]>, recipientDesires: Record<string, number>, providerDesires: Record<string, number>, filterPredicate?: FilterPredicate, filterContext?: FilterContext): SlotAllocationResult;
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
    computeMultiSlotAllocation(slots: AvailabilitySlot[], mrShares: Record<string, Share[]>, recipientDesires: Record<string, Record<string, number>>, // recipientId -> slotId -> amount
    providerDesires: Record<string, Record<string, number>>, // recipientId -> slotId -> amount
    filterPredicate?: FilterPredicate, filterContext?: FilterContext): SlotAllocationResult[];
}
export declare class TEESimulator {
    /**
     * Simulate allocation computation in a Trusted Execution Environment
     */
    computeAllocationInEnclave(recognitionCommitments: Array<{
        from: string;
        to: string;
        commitment: Commitment;
        value: number;
        randomness: Uint8Array;
    }>, capacityTotal: number, desires: Record<string, number>): AllocationOutput;
}
export { commit as createCommitment, verifyCommitment as verify };
//# sourceMappingURL=crypto-core.d.ts.map