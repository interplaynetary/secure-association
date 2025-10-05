/**
 * Centralized Zod v4 Schemas
 * Single source of truth for all data shapes and validation
 */
import { z } from "zod";
export declare const DIDSchema: z.ZodString;
export declare const PercentageSchema: z.ZodNumber;
export declare const CapacityIDSchema: z.ZodString;
export declare const HexStringSchema: z.ZodString;
export declare const Bytes32Schema: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
export declare const Bytes64Schema: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
export declare const CommitmentSchema: z.ZodObject<{
    value: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
    randomness: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
}, "strict", z.ZodTypeAny, {
    value: Uint8Array<ArrayBuffer>;
    randomness: Uint8Array<ArrayBuffer>;
}, {
    value: Uint8Array<ArrayBuffer>;
    randomness: Uint8Array<ArrayBuffer>;
}>;
export type Commitment = z.infer<typeof CommitmentSchema>;
export declare const ShareSchema: z.ZodObject<{
    index: z.ZodNumber;
    value: z.ZodString;
}, "strict", z.ZodTypeAny, {
    value: string;
    index: number;
}, {
    value: string;
    index: number;
}>;
export type Share = z.infer<typeof ShareSchema>;
export declare const MPCShareSchema: z.ZodObject<{
    shares: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        value: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        value: string;
        index: number;
    }, {
        value: string;
        index: number;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    shares: {
        value: string;
        index: number;
    }[];
}, {
    shares: {
        value: string;
        index: number;
    }[];
}>;
export type MPCShare = z.infer<typeof MPCShareSchema>;
export declare const ParticipantSchema: z.ZodObject<{
    did: z.ZodString;
    name: z.ZodString;
    publicKey: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    did: string;
    name: string;
    publicKey?: string | undefined;
}, {
    did: string;
    name: string;
    publicKey?: string | undefined;
}>;
export type Participant = z.infer<typeof ParticipantSchema>;
export declare const RecognitionValueSchema: z.ZodObject<{
    percentage: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    percentage: number;
}, {
    percentage: number;
}>;
export type RecognitionValue = z.infer<typeof RecognitionValueSchema>;
export declare const MutualRecognitionSchema: z.ZodObject<{
    participantA: z.ZodString;
    participantB: z.ZodString;
    value: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    value: number;
    participantA: string;
    participantB: string;
}, {
    value: number;
    participantA: string;
    participantB: string;
}>;
export type MutualRecognition = z.infer<typeof MutualRecognitionSchema>;
export declare const CapacityFiltersSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
export declare const SlotIDSchema: z.ZodString;
export declare const AvailabilitySlotSchema: z.ZodObject<{
    id: z.ZodString;
    quantity: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    recurrence: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    id: string;
    quantity: number;
    metadata?: Record<string, any> | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    recurrence?: string | undefined;
}, {
    id: string;
    quantity: number;
    metadata?: Record<string, any> | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    recurrence?: string | undefined;
}>;
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;
export declare const CapacitySchema: z.ZodObject<{
    id: z.ZodString;
    providerDid: z.ZodString;
    capacityType: z.ZodString;
    totalQuantity: z.ZodNumber;
    unit: z.ZodString;
    filters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    availabilitySlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        recurrence: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }, {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    id: string;
    providerDid: string;
    capacityType: string;
    totalQuantity: number;
    unit: string;
    filters: Record<string, any>;
    availabilitySlots: {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }[];
}, {
    id: string;
    providerDid: string;
    capacityType: string;
    totalQuantity: number;
    unit: string;
    filters?: Record<string, any> | undefined;
    availabilitySlots?: {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }[] | undefined;
}>;
export type Capacity = z.infer<typeof CapacitySchema>;
export declare const DesireSchema: z.ZodObject<{
    recipientDid: z.ZodString;
    capacityId: z.ZodString;
    quantityDesired: z.ZodNumber;
    slotId: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    recipientDid: string;
    capacityId: string;
    quantityDesired: number;
    slotId?: string | undefined;
}, {
    recipientDid: string;
    capacityId: string;
    quantityDesired: number;
    slotId?: string | undefined;
}>;
export type Desire = z.infer<typeof DesireSchema>;
export declare const MutualDesireSchema: z.ZodObject<{
    recipientDid: z.ZodString;
    capacityId: z.ZodString;
    slotId: z.ZodOptional<z.ZodString>;
    recipientDesire: z.ZodNumber;
    providerDesire: z.ZodNumber;
    mutual: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    recipientDid: string;
    capacityId: string;
    recipientDesire: number;
    providerDesire: number;
    mutual: number;
    slotId?: string | undefined;
}, {
    recipientDid: string;
    capacityId: string;
    recipientDesire: number;
    providerDesire: number;
    mutual: number;
    slotId?: string | undefined;
}>;
export type MutualDesire = z.infer<typeof MutualDesireSchema>;
export declare const ProviderDesireSchema: z.ZodObject<{
    providerDid: z.ZodString;
    recipientDid: z.ZodString;
    capacityId: z.ZodString;
    slotId: z.ZodOptional<z.ZodString>;
    quantityOffered: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    providerDid: string;
    recipientDid: string;
    capacityId: string;
    quantityOffered: number;
    slotId?: string | undefined;
}, {
    providerDid: string;
    recipientDid: string;
    capacityId: string;
    quantityOffered: number;
    slotId?: string | undefined;
}>;
export type ProviderDesire = z.infer<typeof ProviderDesireSchema>;
export declare const AllocationSchema: z.ZodObject<{
    capacityId: z.ZodString;
    slotId: z.ZodOptional<z.ZodString>;
    recipientDid: z.ZodString;
    quantityAllocated: z.ZodNumber;
    proof: z.ZodOptional<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>>;
    confirmed: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    recipientDid: string;
    capacityId: string;
    quantityAllocated: number;
    confirmed: boolean;
    slotId?: string | undefined;
    proof?: Uint8Array<ArrayBuffer> | undefined;
}, {
    recipientDid: string;
    capacityId: string;
    quantityAllocated: number;
    slotId?: string | undefined;
    proof?: Uint8Array<ArrayBuffer> | undefined;
    confirmed?: boolean | undefined;
}>;
export type Allocation = z.infer<typeof AllocationSchema>;
export declare const AllocationResultSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
export type AllocationResult = z.infer<typeof AllocationResultSchema>;
export declare const SlotAllocationResultSchema: z.ZodObject<{
    slotId: z.ZodString;
    totalQuantity: z.ZodNumber;
    allocations: z.ZodRecord<z.ZodString, z.ZodNumber>;
    unusedCapacity: z.ZodNumber;
    mutualDesires: z.ZodRecord<z.ZodString, z.ZodObject<{
        recipientDesire: z.ZodNumber;
        providerDesire: z.ZodNumber;
        mutual: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
    }, {
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
    }>>;
    normalizedShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
    redistributionAmounts: z.ZodRecord<z.ZodString, z.ZodNumber>;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    totalQuantity: number;
    slotId: string;
    allocations: Record<string, number>;
    unusedCapacity: number;
    mutualDesires: Record<string, {
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
    }>;
    normalizedShares: Record<string, number>;
    redistributionAmounts: Record<string, number>;
    timestamp: string;
}, {
    totalQuantity: number;
    slotId: string;
    allocations: Record<string, number>;
    unusedCapacity: number;
    mutualDesires: Record<string, {
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
    }>;
    normalizedShares: Record<string, number>;
    redistributionAmounts: Record<string, number>;
    timestamp: string;
}>;
export type SlotAllocationResult = z.infer<typeof SlotAllocationResultSchema>;
export declare const AllocationOutputSchema: z.ZodObject<{
    allocations: z.ZodArray<z.ZodObject<{
        recipientDid: z.ZodString;
        quantityAllocated: z.ZodNumber;
        slotId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        recipientDid: string;
        quantityAllocated: number;
        slotId?: string | undefined;
    }, {
        recipientDid: string;
        quantityAllocated: number;
        slotId?: string | undefined;
    }>, "many">;
    attestation: z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>;
}, "strict", z.ZodTypeAny, {
    allocations: {
        recipientDid: string;
        quantityAllocated: number;
        slotId?: string | undefined;
    }[];
    attestation: Uint8Array<ArrayBuffer>;
}, {
    allocations: {
        recipientDid: string;
        quantityAllocated: number;
        slotId?: string | undefined;
    }[];
    attestation: Uint8Array<ArrayBuffer>;
}>;
export type AllocationOutput = z.infer<typeof AllocationOutputSchema>;
export declare const RDXConfigSchema: z.ZodEffects<z.ZodObject<{
    mpcNodes: z.ZodDefault<z.ZodNumber>;
    threshold: z.ZodOptional<z.ZodNumber>;
    logLevel: z.ZodDefault<z.ZodEnum<["DEBUG", "INFO", "WARN", "ERROR"]>>;
}, "strict", z.ZodTypeAny, {
    mpcNodes: number;
    logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
    threshold?: number | undefined;
}, {
    mpcNodes?: number | undefined;
    threshold?: number | undefined;
    logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | undefined;
}>, {
    mpcNodes: number;
    logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
    threshold?: number | undefined;
}, {
    mpcNodes?: number | undefined;
    threshold?: number | undefined;
    logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | undefined;
}>;
export type RDXConfig = z.infer<typeof RDXConfigSchema>;
export declare const GateTypeSchema: z.ZodEnum<["AND", "OR", "XOR", "NOT"]>;
export type GateType = z.infer<typeof GateTypeSchema>;
export declare const WireLabelSchema: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
export declare const GateSchema: z.ZodObject<{
    type: z.ZodEnum<["AND", "OR", "XOR", "NOT"]>;
    inputs: z.ZodArray<z.ZodNumber, "many">;
    output: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "AND" | "OR" | "XOR" | "NOT";
    inputs: number[];
    output: number;
}, {
    type: "AND" | "OR" | "XOR" | "NOT";
    inputs: number[];
    output: number;
}>;
export type Gate = z.infer<typeof GateSchema>;
export declare const GarbledGateSchema: z.ZodObject<{
    encryptedTable: z.ZodArray<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, "many">;
}, "strict", z.ZodTypeAny, {
    encryptedTable: Uint8Array<ArrayBuffer>[];
}, {
    encryptedTable: Uint8Array<ArrayBuffer>[];
}>;
export type GarbledGate = z.infer<typeof GarbledGateSchema>;
export declare const GarbledCircuitSchema: z.ZodObject<{
    gates: z.ZodArray<z.ZodObject<{
        encryptedTable: z.ZodArray<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, "many">;
    }, "strict", z.ZodTypeAny, {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }, {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }>, "many">;
    inputWireLabels: z.ZodRecord<z.ZodString, z.ZodTuple<[z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>], null>>;
    outputWireLabels: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}, "strict", z.ZodTypeAny, {
    gates: {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }[];
    inputWireLabels: Record<string, [Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>]>;
    outputWireLabels: Record<string, Uint8Array<ArrayBuffer>>;
}, {
    gates: {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }[];
    inputWireLabels: Record<string, [Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>]>;
    outputWireLabels: Record<string, Uint8Array<ArrayBuffer>>;
}>;
export type GarbledCircuit = z.infer<typeof GarbledCircuitSchema>;
export declare const StorageOperationSchema: z.ZodDiscriminatedUnion<"operation", [z.ZodObject<{
    operation: z.ZodLiteral<"addParticipant">;
    did: z.ZodString;
    name: z.ZodString;
    publicKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    did: string;
    name: string;
    operation: "addParticipant";
    publicKey?: string | undefined;
}, {
    did: string;
    name: string;
    operation: "addParticipant";
    publicKey?: string | undefined;
}>, z.ZodObject<{
    operation: z.ZodLiteral<"getParticipant">;
    did: z.ZodString;
}, "strip", z.ZodTypeAny, {
    did: string;
    operation: "getParticipant";
}, {
    did: string;
    operation: "getParticipant";
}>, z.ZodObject<{
    operation: z.ZodLiteral<"addCapacity">;
    capacity: z.ZodObject<{
        id: z.ZodString;
        providerDid: z.ZodString;
        capacityType: z.ZodString;
        totalQuantity: z.ZodNumber;
        unit: z.ZodString;
        filters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        availabilitySlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            quantity: z.ZodNumber;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            recurrence: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }, {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters: Record<string, any>;
        availabilitySlots: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[];
    }, {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters?: Record<string, any> | undefined;
        availabilitySlots?: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    operation: "addCapacity";
    capacity: {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters: Record<string, any>;
        availabilitySlots: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[];
    };
}, {
    operation: "addCapacity";
    capacity: {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters?: Record<string, any> | undefined;
        availabilitySlots?: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[] | undefined;
    };
}>, z.ZodObject<{
    operation: z.ZodLiteral<"addDesire">;
    recipientDid: z.ZodString;
    capacityId: z.ZodString;
    quantityDesired: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    recipientDid: string;
    capacityId: string;
    quantityDesired: number;
    operation: "addDesire";
}, {
    recipientDid: string;
    capacityId: string;
    quantityDesired: number;
    operation: "addDesire";
}>]>;
export type StorageOperation = z.infer<typeof StorageOperationSchema>;
/**
 * Parse and validate data against schema, throwing descriptive error
 */
export declare function parse<T>(schema: z.ZodType<T>, data: unknown): T;
/**
 * Check if data matches schema without throwing
 */
export declare function validate<T>(schema: z.ZodType<T>, data: unknown): boolean;
/**
 * Get human-readable validation errors
 */
export declare function getValidationErrors<T>(schema: z.ZodType<T>, data: unknown): string[];
export declare const Schemas: {
    readonly DID: z.ZodString;
    readonly Percentage: z.ZodNumber;
    readonly CapacityID: z.ZodString;
    readonly HexString: z.ZodString;
    readonly Bytes32: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
    readonly Bytes64: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
    readonly Commitment: z.ZodObject<{
        value: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
        randomness: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
    }, "strict", z.ZodTypeAny, {
        value: Uint8Array<ArrayBuffer>;
        randomness: Uint8Array<ArrayBuffer>;
    }, {
        value: Uint8Array<ArrayBuffer>;
        randomness: Uint8Array<ArrayBuffer>;
    }>;
    readonly Share: z.ZodObject<{
        index: z.ZodNumber;
        value: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        value: string;
        index: number;
    }, {
        value: string;
        index: number;
    }>;
    readonly MPCShare: z.ZodObject<{
        shares: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            value: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            value: string;
            index: number;
        }, {
            value: string;
            index: number;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        shares: {
            value: string;
            index: number;
        }[];
    }, {
        shares: {
            value: string;
            index: number;
        }[];
    }>;
    readonly Participant: z.ZodObject<{
        did: z.ZodString;
        name: z.ZodString;
        publicKey: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        did: string;
        name: string;
        publicKey?: string | undefined;
    }, {
        did: string;
        name: string;
        publicKey?: string | undefined;
    }>;
    readonly RecognitionValue: z.ZodObject<{
        percentage: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        percentage: number;
    }, {
        percentage: number;
    }>;
    readonly MutualRecognition: z.ZodObject<{
        participantA: z.ZodString;
        participantB: z.ZodString;
        value: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        value: number;
        participantA: string;
        participantB: string;
    }, {
        value: number;
        participantA: string;
        participantB: string;
    }>;
    readonly SlotID: z.ZodString;
    readonly AvailabilitySlot: z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        recurrence: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }, {
        id: string;
        quantity: number;
        metadata?: Record<string, any> | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        recurrence?: string | undefined;
    }>;
    readonly Capacity: z.ZodObject<{
        id: z.ZodString;
        providerDid: z.ZodString;
        capacityType: z.ZodString;
        totalQuantity: z.ZodNumber;
        unit: z.ZodString;
        filters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        availabilitySlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            quantity: z.ZodNumber;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            recurrence: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }, {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters: Record<string, any>;
        availabilitySlots: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[];
    }, {
        id: string;
        providerDid: string;
        capacityType: string;
        totalQuantity: number;
        unit: string;
        filters?: Record<string, any> | undefined;
        availabilitySlots?: {
            id: string;
            quantity: number;
            metadata?: Record<string, any> | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            recurrence?: string | undefined;
        }[] | undefined;
    }>;
    readonly Desire: z.ZodObject<{
        recipientDid: z.ZodString;
        capacityId: z.ZodString;
        quantityDesired: z.ZodNumber;
        slotId: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        recipientDid: string;
        capacityId: string;
        quantityDesired: number;
        slotId?: string | undefined;
    }, {
        recipientDid: string;
        capacityId: string;
        quantityDesired: number;
        slotId?: string | undefined;
    }>;
    readonly MutualDesire: z.ZodObject<{
        recipientDid: z.ZodString;
        capacityId: z.ZodString;
        slotId: z.ZodOptional<z.ZodString>;
        recipientDesire: z.ZodNumber;
        providerDesire: z.ZodNumber;
        mutual: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        recipientDid: string;
        capacityId: string;
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
        slotId?: string | undefined;
    }, {
        recipientDid: string;
        capacityId: string;
        recipientDesire: number;
        providerDesire: number;
        mutual: number;
        slotId?: string | undefined;
    }>;
    readonly ProviderDesire: z.ZodObject<{
        providerDid: z.ZodString;
        recipientDid: z.ZodString;
        capacityId: z.ZodString;
        slotId: z.ZodOptional<z.ZodString>;
        quantityOffered: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        providerDid: string;
        recipientDid: string;
        capacityId: string;
        quantityOffered: number;
        slotId?: string | undefined;
    }, {
        providerDid: string;
        recipientDid: string;
        capacityId: string;
        quantityOffered: number;
        slotId?: string | undefined;
    }>;
    readonly Allocation: z.ZodObject<{
        capacityId: z.ZodString;
        slotId: z.ZodOptional<z.ZodString>;
        recipientDid: z.ZodString;
        quantityAllocated: z.ZodNumber;
        proof: z.ZodOptional<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>>;
        confirmed: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        recipientDid: string;
        capacityId: string;
        quantityAllocated: number;
        confirmed: boolean;
        slotId?: string | undefined;
        proof?: Uint8Array<ArrayBuffer> | undefined;
    }, {
        recipientDid: string;
        capacityId: string;
        quantityAllocated: number;
        slotId?: string | undefined;
        proof?: Uint8Array<ArrayBuffer> | undefined;
        confirmed?: boolean | undefined;
    }>;
    readonly AllocationResult: z.ZodRecord<z.ZodString, z.ZodNumber>;
    readonly SlotAllocationResult: z.ZodObject<{
        slotId: z.ZodString;
        totalQuantity: z.ZodNumber;
        allocations: z.ZodRecord<z.ZodString, z.ZodNumber>;
        unusedCapacity: z.ZodNumber;
        mutualDesires: z.ZodRecord<z.ZodString, z.ZodObject<{
            recipientDesire: z.ZodNumber;
            providerDesire: z.ZodNumber;
            mutual: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            recipientDesire: number;
            providerDesire: number;
            mutual: number;
        }, {
            recipientDesire: number;
            providerDesire: number;
            mutual: number;
        }>>;
        normalizedShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
        redistributionAmounts: z.ZodRecord<z.ZodString, z.ZodNumber>;
        timestamp: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        totalQuantity: number;
        slotId: string;
        allocations: Record<string, number>;
        unusedCapacity: number;
        mutualDesires: Record<string, {
            recipientDesire: number;
            providerDesire: number;
            mutual: number;
        }>;
        normalizedShares: Record<string, number>;
        redistributionAmounts: Record<string, number>;
        timestamp: string;
    }, {
        totalQuantity: number;
        slotId: string;
        allocations: Record<string, number>;
        unusedCapacity: number;
        mutualDesires: Record<string, {
            recipientDesire: number;
            providerDesire: number;
            mutual: number;
        }>;
        normalizedShares: Record<string, number>;
        redistributionAmounts: Record<string, number>;
        timestamp: string;
    }>;
    readonly AllocationOutput: z.ZodObject<{
        allocations: z.ZodArray<z.ZodObject<{
            recipientDid: z.ZodString;
            quantityAllocated: z.ZodNumber;
            slotId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            recipientDid: string;
            quantityAllocated: number;
            slotId?: string | undefined;
        }, {
            recipientDid: string;
            quantityAllocated: number;
            slotId?: string | undefined;
        }>, "many">;
        attestation: z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>;
    }, "strict", z.ZodTypeAny, {
        allocations: {
            recipientDid: string;
            quantityAllocated: number;
            slotId?: string | undefined;
        }[];
        attestation: Uint8Array<ArrayBuffer>;
    }, {
        allocations: {
            recipientDid: string;
            quantityAllocated: number;
            slotId?: string | undefined;
        }[];
        attestation: Uint8Array<ArrayBuffer>;
    }>;
    readonly RDXConfig: z.ZodEffects<z.ZodObject<{
        mpcNodes: z.ZodDefault<z.ZodNumber>;
        threshold: z.ZodOptional<z.ZodNumber>;
        logLevel: z.ZodDefault<z.ZodEnum<["DEBUG", "INFO", "WARN", "ERROR"]>>;
    }, "strict", z.ZodTypeAny, {
        mpcNodes: number;
        logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
        threshold?: number | undefined;
    }, {
        mpcNodes?: number | undefined;
        threshold?: number | undefined;
        logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | undefined;
    }>, {
        mpcNodes: number;
        logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
        threshold?: number | undefined;
    }, {
        mpcNodes?: number | undefined;
        threshold?: number | undefined;
        logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | undefined;
    }>;
    readonly GateType: z.ZodEnum<["AND", "OR", "XOR", "NOT"]>;
    readonly WireLabel: z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>;
    readonly Gate: z.ZodObject<{
        type: z.ZodEnum<["AND", "OR", "XOR", "NOT"]>;
        inputs: z.ZodArray<z.ZodNumber, "many">;
        output: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "AND" | "OR" | "XOR" | "NOT";
        inputs: number[];
        output: number;
    }, {
        type: "AND" | "OR" | "XOR" | "NOT";
        inputs: number[];
        output: number;
    }>;
    readonly GarbledGate: z.ZodObject<{
        encryptedTable: z.ZodArray<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, "many">;
    }, "strict", z.ZodTypeAny, {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }, {
        encryptedTable: Uint8Array<ArrayBuffer>[];
    }>;
    readonly GarbledCircuit: z.ZodObject<{
        gates: z.ZodArray<z.ZodObject<{
            encryptedTable: z.ZodArray<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, "many">;
        }, "strict", z.ZodTypeAny, {
            encryptedTable: Uint8Array<ArrayBuffer>[];
        }, {
            encryptedTable: Uint8Array<ArrayBuffer>[];
        }>, "many">;
        inputWireLabels: z.ZodRecord<z.ZodString, z.ZodTuple<[z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>], null>>;
        outputWireLabels: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodType<Uint8Array<ArrayBuffer>, z.ZodTypeDef, Uint8Array<ArrayBuffer>>, Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    }, "strict", z.ZodTypeAny, {
        gates: {
            encryptedTable: Uint8Array<ArrayBuffer>[];
        }[];
        inputWireLabels: Record<string, [Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>]>;
        outputWireLabels: Record<string, Uint8Array<ArrayBuffer>>;
    }, {
        gates: {
            encryptedTable: Uint8Array<ArrayBuffer>[];
        }[];
        inputWireLabels: Record<string, [Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>]>;
        outputWireLabels: Record<string, Uint8Array<ArrayBuffer>>;
    }>;
    readonly StorageOperation: z.ZodDiscriminatedUnion<"operation", [z.ZodObject<{
        operation: z.ZodLiteral<"addParticipant">;
        did: z.ZodString;
        name: z.ZodString;
        publicKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        did: string;
        name: string;
        operation: "addParticipant";
        publicKey?: string | undefined;
    }, {
        did: string;
        name: string;
        operation: "addParticipant";
        publicKey?: string | undefined;
    }>, z.ZodObject<{
        operation: z.ZodLiteral<"getParticipant">;
        did: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        did: string;
        operation: "getParticipant";
    }, {
        did: string;
        operation: "getParticipant";
    }>, z.ZodObject<{
        operation: z.ZodLiteral<"addCapacity">;
        capacity: z.ZodObject<{
            id: z.ZodString;
            providerDid: z.ZodString;
            capacityType: z.ZodString;
            totalQuantity: z.ZodNumber;
            unit: z.ZodString;
            filters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
            availabilitySlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                quantity: z.ZodNumber;
                metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                startDate: z.ZodOptional<z.ZodString>;
                endDate: z.ZodOptional<z.ZodString>;
                recurrence: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }, {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }>, "many">>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            providerDid: string;
            capacityType: string;
            totalQuantity: number;
            unit: string;
            filters: Record<string, any>;
            availabilitySlots: {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }[];
        }, {
            id: string;
            providerDid: string;
            capacityType: string;
            totalQuantity: number;
            unit: string;
            filters?: Record<string, any> | undefined;
            availabilitySlots?: {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        operation: "addCapacity";
        capacity: {
            id: string;
            providerDid: string;
            capacityType: string;
            totalQuantity: number;
            unit: string;
            filters: Record<string, any>;
            availabilitySlots: {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }[];
        };
    }, {
        operation: "addCapacity";
        capacity: {
            id: string;
            providerDid: string;
            capacityType: string;
            totalQuantity: number;
            unit: string;
            filters?: Record<string, any> | undefined;
            availabilitySlots?: {
                id: string;
                quantity: number;
                metadata?: Record<string, any> | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                recurrence?: string | undefined;
            }[] | undefined;
        };
    }>, z.ZodObject<{
        operation: z.ZodLiteral<"addDesire">;
        recipientDid: z.ZodString;
        capacityId: z.ZodString;
        quantityDesired: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        recipientDid: string;
        capacityId: string;
        quantityDesired: number;
        operation: "addDesire";
    }, {
        recipientDid: string;
        capacityId: string;
        quantityDesired: number;
        operation: "addDesire";
    }>]>;
};
export default Schemas;
//# sourceMappingURL=schemas.d.ts.map