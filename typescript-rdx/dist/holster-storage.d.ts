/**
 * Holster Storage Backend for RDX
 * Decentralized, real-time persistence using Holster (GunDB wire spec)
 */
import type { StorageBackend, Participant, Capacity, Allocation, AvailabilitySlot, ProviderDesire } from "./rdx-core.js";
/**
 * Holster-based storage implementation
 *
 * Data Structure (per user):
 * user.get('participants') -> { [did]: Participant }
 * user.get('capacities') -> { [id]: Capacity }
 * user.get('slots').get(capacityId) -> { [slotId]: AvailabilitySlot }
 * user.get('desires') -> { [recipientDid_capacityId_slotId]: Desire }
 * user.get('providerDesires') -> { [recipientDid_capacityId_slotId]: ProviderDesire }
 * user.get('commitments') -> { [toDid]: { commitment, randomness } }
 * user.get('allocations') -> { [capacityId_slotId_recipientDid]: Allocation }
 */
export declare class HolsterStorage implements StorageBackend {
    private options;
    private holster;
    private user;
    private isInitialized;
    constructor(options?: {
        indexedDB?: boolean;
    });
    /**
     * Initialize Holster and user authentication
     */
    initialize(userId: string): Promise<void>;
    private ensureInitialized;
    addParticipant(did: string, name: string, publicKey?: string): void;
    getParticipant(did: string): Promise<Participant | null>;
    listParticipants(): Promise<Participant[]>;
    addCapacity(capacity: Capacity): void;
    getCapacity(id: string): Promise<Capacity | null>;
    listCapacities(providerDid?: string): Promise<Capacity[]>;
    addSlot(slot: AvailabilitySlot, capacityId: string): void;
    getSlots(capacityId: string): Promise<AvailabilitySlot[]>;
    addDesire(recipientDid: string, capacityId: string, quantityDesired: number, slotId?: string): void;
    getDesires(capacityId: string, slotId?: string): Promise<Array<{
        recipientDid: string;
        quantity: number;
    }>>;
    addProviderDesire(providerDesire: ProviderDesire): void;
    getProviderDesires(capacityId: string, slotId?: string): Promise<Array<{
        recipientDid: string;
        quantity: number;
    }>>;
    addCommitment(fromDid: string, toDid: string, commitment: Uint8Array, randomness: Uint8Array): void;
    getCommitment(fromDid: string, toDid: string): Promise<{
        commitment: Uint8Array;
        randomness: Uint8Array;
    } | null>;
    addAllocation(allocation: Allocation): void;
    getAllocations(capacityId: string, slotId?: string): Promise<Allocation[]>;
    transaction<T>(fn: () => T): T;
    close(): void;
}
//# sourceMappingURL=holster-storage.d.ts.map