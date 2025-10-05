/**
 * RDX Core - Data Structures & Utilities
 * Uses centralized Zod schemas for validation
 */
import { type Participant, type RecognitionValue, type MutualRecognition, type Capacity, type Desire, type Allocation, type RDXConfig, type Commitment, type AvailabilitySlot, type MutualDesire, type ProviderDesire } from "./schemas.js";
export type { Participant, RecognitionValue, MutualRecognition, Capacity, AvailabilitySlot, Desire, MutualDesire, ProviderDesire, Allocation, SlotAllocationResult, RDXConfig, Commitment, Share, AllocationResult, AllocationOutput, GateType, Gate, GarbledGate, GarbledCircuit, MPCShare, } from "./schemas.js";
export { Schemas, parse, DIDSchema, PercentageSchema, CapacityIDSchema, SlotIDSchema, ParticipantSchema, RecognitionValueSchema, MutualRecognitionSchema, CapacitySchema, AvailabilitySlotSchema, DesireSchema, MutualDesireSchema, ProviderDesireSchema, AllocationSchema, SlotAllocationResultSchema, RDXConfigSchema, CommitmentSchema, ShareSchema, validate, getValidationErrors, } from "./schemas.js";
export declare class RDXException extends Error {
    constructor(message: string);
}
export declare class ValidationError extends RDXException {
    constructor(message: string);
}
export declare class CryptographicError extends RDXException {
    constructor(message: string);
}
export declare class AllocationError extends RDXException {
    constructor(message: string);
}
/**
 * Create and validate a Participant
 */
export declare function createParticipant(did: string, name: string, publicKey?: string): Participant;
/**
 * Create and validate a RecognitionValue
 */
export declare function createRecognitionValue(percentage: number): RecognitionValue;
/**
 * Create and validate a MutualRecognition
 */
export declare function createMutualRecognition(participantA: string, participantB: string, value: number): MutualRecognition;
/**
 * Create and validate an AvailabilitySlot
 */
export declare function createSlot(id: string, quantity: number, metadata?: Record<string, any>, startDate?: string, endDate?: string, recurrence?: string): AvailabilitySlot;
/**
 * Create and validate a Capacity
 */
export declare function createCapacity(id: string, providerDid: string, capacityType: string, totalQuantity: number, unit: string, filters?: Record<string, any>, availabilitySlots?: AvailabilitySlot[]): Capacity;
/**
 * Create and validate a Desire
 */
export declare function createDesire(recipientDid: string, capacityId: string, quantityDesired: number, slotId?: string): Desire;
/**
 * Create and validate a ProviderDesire
 */
export declare function createProviderDesire(providerDid: string, recipientDid: string, capacityId: string, quantityOffered: number, slotId?: string): ProviderDesire;
/**
 * Create and validate a MutualDesire
 */
export declare function createMutualDesire(recipientDid: string, capacityId: string, recipientDesire: number, providerDesire: number, slotId?: string): MutualDesire;
/**
 * Create and validate an Allocation
 */
export declare function createAllocation(capacityId: string, recipientDid: string, quantityAllocated: number, slotId?: string, proof?: Uint8Array, confirmed?: boolean): Allocation;
/**
 * Create and validate RDXConfig
 */
export declare function createRDXConfig(mpcNodes?: number, threshold?: number, logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR"): RDXConfig;
export declare class MetricsCollector {
    private metrics;
    startOperation(operationName: string): () => void;
    getMetrics(operationName?: string): {
        count: number;
        totalTime: number;
        avgTime: number;
    } | {
        [k: string]: {
            count: number;
            totalTime: number;
            avgTime: number;
        };
    } | null;
    report(): string;
    reset(): void;
}
export declare class SecureMemory<T> {
    private value;
    private cleared;
    constructor(value: T);
    get(): T;
    clear(): void;
    isCleared(): boolean;
}
export declare class CommitmentHelper {
    static createWithRandomness(value: number): {
        commitment: Commitment;
        randomness: Uint8Array;
    };
    static createSecure(value: number): {
        commitment: Commitment;
        getRandomness: () => Uint8Array;
        clearRandomness: () => void;
    };
}
export interface StorageBackend {
    addParticipant(did: string, name: string, publicKey?: string): void | Promise<void>;
    getParticipant(did: string): Participant | null | Promise<Participant | null>;
    listParticipants(): Participant[] | Promise<Participant[]>;
    addCapacity(capacity: Capacity): void | Promise<void>;
    getCapacity(id: string): Capacity | null | Promise<Capacity | null>;
    listCapacities(providerDid?: string): Capacity[] | Promise<Capacity[]>;
    addDesire(recipientDid: string, capacityId: string, quantityDesired: number, slotId?: string): void | Promise<void>;
    getDesires(capacityId: string, slotId?: string): Array<{
        recipientDid: string;
        quantity: number;
    }> | Promise<Array<{
        recipientDid: string;
        quantity: number;
    }>>;
    addCommitment(fromDid: string, toDid: string, commitment: Uint8Array, randomness: Uint8Array): void | Promise<void>;
    getCommitment(fromDid: string, toDid: string): {
        commitment: Uint8Array;
        randomness: Uint8Array;
    } | null | Promise<{
        commitment: Uint8Array;
        randomness: Uint8Array;
    } | null>;
    addAllocation(allocation: Allocation): void | Promise<void>;
    getAllocations(capacityId: string, slotId?: string): Allocation[] | Promise<Allocation[]>;
}
//# sourceMappingURL=rdx-core.d.ts.map