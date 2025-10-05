/**
 * Centralized Zod v4 Schemas
 * Single source of truth for all data shapes and validation
 */

import { z } from "zod";

// ============================================================================
// Primitive Schemas
// ============================================================================

export const DIDSchema = z
  .string()
  .regex(/^did:[a-z0-9]+:.+/, "Invalid DID format")
  .describe("Decentralized Identifier");

export const PercentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100")
  .describe("Recognition percentage (0-100)");

export const CapacityIDSchema = z
  .string()
  .regex(/^cap-[a-f0-9]{16}$/, "Invalid capacity ID format")
  .describe("Capacity identifier");

export const HexStringSchema = z
  .string()
  .regex(/^[a-f0-9]+$/i, "Must be a hex string");

export const Bytes32Schema = z
  .instanceof(Uint8Array)
  .refine((val) => val.length === 32, "Must be exactly 32 bytes");

export const Bytes64Schema = z
  .instanceof(Uint8Array)
  .refine((val) => val.length === 64, "Must be exactly 64 bytes");

// ============================================================================
// Cryptographic Schemas
// ============================================================================

export const CommitmentSchema = z
  .object({
    value: Bytes64Schema.describe("EC point (x,y coordinates)"),
    randomness: Bytes32Schema.describe("Random blinding factor"),
  })
  .strict()
  .describe("Pedersen commitment");

export type Commitment = z.infer<typeof CommitmentSchema>;

export const ShareSchema = z
  .object({
    index: z.number().int().positive().describe("Share index (1-based)"),
    value: HexStringSchema.describe("Share value as hex string"),
  })
  .strict()
  .describe("Shamir secret share");

export type Share = z.infer<typeof ShareSchema>;

export const MPCShareSchema = z
  .object({
    shares: z.array(ShareSchema).min(1),
  })
  .strict()
  .describe("MPC share bundle");

export type MPCShare = z.infer<typeof MPCShareSchema>;

// ============================================================================
// Participant Schemas
// ============================================================================

export const ParticipantSchema = z
  .object({
    did: DIDSchema,
    name: z.string().min(1, "Name cannot be empty"),
    publicKey: z.string().optional(),
  })
  .strict()
  .describe("System participant");

export type Participant = z.infer<typeof ParticipantSchema>;

export const RecognitionValueSchema = z
  .object({
    percentage: PercentageSchema,
  })
  .strict()
  .describe("Recognition value");

export type RecognitionValue = z.infer<typeof RecognitionValueSchema>;

export const MutualRecognitionSchema = z
  .object({
    participantA: DIDSchema,
    participantB: DIDSchema,
    value: PercentageSchema.describe("min(R[A][B], R[B][A])"),
  })
  .strict()
  .describe("Mutual recognition between two participants");

export type MutualRecognition = z.infer<typeof MutualRecognitionSchema>;

// ============================================================================
// Capacity Schemas
// ============================================================================

export const CapacityFiltersSchema = z
  .record(z.string(), z.any())
  .describe("Filters for recipient eligibility");

// Slot Schema - individual time or resource slot
export const SlotIDSchema = z
  .string()
  .regex(/^slot-[a-f0-9]{16}$/, "Invalid slot ID format")
  .describe("Slot identifier");

export const AvailabilitySlotSchema = z
  .object({
    id: SlotIDSchema,
    quantity: z.number().nonnegative("Slot quantity cannot be negative"),
    metadata: z.record(z.string(), z.any()).optional(),
    // Optional timing fields
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    recurrence: z.string().optional(),
  })
  .strict()
  .describe("Availability slot within a capacity");

export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

export const CapacitySchema = z
  .object({
    id: CapacityIDSchema,
    providerDid: DIDSchema,
    capacityType: z.string().min(1, "Capacity type cannot be empty"),
    totalQuantity: z.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit cannot be empty"),
    filters: CapacityFiltersSchema.default({}),
    availabilitySlots: z
      .array(AvailabilitySlotSchema)
      .default([])
      .describe("Time or resource slots for allocation"),
  })
  .strict()
  .describe("Declared capacity");

export type Capacity = z.infer<typeof CapacitySchema>;

// ============================================================================
// Desire Schemas
// ============================================================================

export const DesireSchema = z
  .object({
    recipientDid: DIDSchema,
    capacityId: CapacityIDSchema,
    quantityDesired: z.number().positive("Desired quantity must be positive"),
    slotId: SlotIDSchema.optional().describe("Optional slot-specific desire"),
  })
  .strict()
  .describe("Recipient desire for capacity");

export type Desire = z.infer<typeof DesireSchema>;

// Mutual Desire - combines provider and recipient desires
export const MutualDesireSchema = z
  .object({
    recipientDid: DIDSchema,
    capacityId: CapacityIDSchema,
    slotId: SlotIDSchema.optional(),
    recipientDesire: z.number().nonnegative(),
    providerDesire: z.number().nonnegative(),
    mutual: z.number().nonnegative().describe("min(provider, recipient)"),
  })
  .strict()
  .describe("Mutual desire between provider and recipient");

export type MutualDesire = z.infer<typeof MutualDesireSchema>;

// Provider Desire - how much provider wants to give to each recipient
export const ProviderDesireSchema = z
  .object({
    providerDid: DIDSchema,
    recipientDid: DIDSchema,
    capacityId: CapacityIDSchema,
    slotId: SlotIDSchema.optional(),
    quantityOffered: z
      .number()
      .nonnegative("Offered quantity cannot be negative"),
  })
  .strict()
  .describe("Provider's desire to allocate to specific recipient");

export type ProviderDesire = z.infer<typeof ProviderDesireSchema>;

// ============================================================================
// Allocation Schemas
// ============================================================================

export const AllocationSchema = z
  .object({
    capacityId: CapacityIDSchema,
    slotId: SlotIDSchema.optional(),
    recipientDid: DIDSchema,
    quantityAllocated: z
      .number()
      .nonnegative("Allocated quantity cannot be negative"),
    proof: z.instanceof(Uint8Array).optional(),
    confirmed: z.boolean().default(false),
  })
  .strict()
  .describe("Computed allocation");

export type Allocation = z.infer<typeof AllocationSchema>;

export const AllocationResultSchema = z
  .record(DIDSchema, z.number().nonnegative())
  .describe("Map of recipient DIDs to allocated quantities");

export type AllocationResult = z.infer<typeof AllocationResultSchema>;

// Slot-specific allocation result with full transparency
export const SlotAllocationResultSchema = z
  .object({
    slotId: SlotIDSchema,
    totalQuantity: z.number().nonnegative(),
    allocations: AllocationResultSchema,
    unusedCapacity: z.number().nonnegative(),
    mutualDesires: z.record(
      DIDSchema,
      z.object({
        recipientDesire: z.number().nonnegative(),
        providerDesire: z.number().nonnegative(),
        mutual: z.number().nonnegative(),
      })
    ),
    normalizedShares: z.record(DIDSchema, z.number().nonnegative()),
    redistributionAmounts: z.record(DIDSchema, z.number().nonnegative()),
    timestamp: z.string().datetime(),
  })
  .strict()
  .describe("Complete slot allocation result with full transparency");

export type SlotAllocationResult = z.infer<typeof SlotAllocationResultSchema>;

export const AllocationOutputSchema = z
  .object({
    allocations: z.array(
      z.object({
        recipientDid: DIDSchema,
        quantityAllocated: z.number().nonnegative(),
        slotId: SlotIDSchema.optional(),
      })
    ),
    attestation: z.instanceof(Uint8Array).describe("TEE attestation"),
  })
  .strict()
  .describe("TEE allocation output");

export type AllocationOutput = z.infer<typeof AllocationOutputSchema>;

// ============================================================================
// Configuration Schemas
// ============================================================================

export const RDXConfigSchema = z
  .object({
    mpcNodes: z
      .number()
      .int()
      .min(3, "MPC requires at least 3 nodes")
      .default(3),
    threshold: z
      .number()
      .int()
      .min(2, "Threshold must be at least 2")
      .optional(),
    logLevel: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
  })
  .strict()
  .refine(
    (data) => {
      const threshold = data.threshold || Math.floor(data.mpcNodes / 2) + 1;
      return threshold <= data.mpcNodes;
    },
    {
      message: "Threshold cannot exceed number of MPC nodes",
    }
  )
  .describe("RDX system configuration");

export type RDXConfig = z.infer<typeof RDXConfigSchema>;

// ============================================================================
// Garbled Circuits Schemas
// ============================================================================

export const GateTypeSchema = z.enum(["AND", "OR", "XOR", "NOT"]);
export type GateType = z.infer<typeof GateTypeSchema>;

export const WireLabelSchema = z
  .instanceof(Uint8Array)
  .refine((val) => val.length === 16, "Wire label must be 16 bytes (128 bits)");

export const GateSchema = z
  .object({
    type: GateTypeSchema,
    inputs: z.array(z.number().int().nonnegative()).min(1).max(2),
    output: z.number().int().nonnegative(),
  })
  .strict();

export type Gate = z.infer<typeof GateSchema>;

export const GarbledGateSchema = z
  .object({
    encryptedTable: z.array(z.instanceof(Uint8Array)),
  })
  .strict();

export type GarbledGate = z.infer<typeof GarbledGateSchema>;

export const GarbledCircuitSchema = z
  .object({
    gates: z.array(GarbledGateSchema),
    inputWireLabels: z.record(
      z.string(),
      z.tuple([WireLabelSchema, WireLabelSchema])
    ),
    outputWireLabels: z.record(z.string(), WireLabelSchema),
  })
  .strict();

export type GarbledCircuit = z.infer<typeof GarbledCircuitSchema>;

// ============================================================================
// Storage Backend Interface Schema
// ============================================================================

export const StorageOperationSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("addParticipant"),
    did: DIDSchema,
    name: z.string(),
    publicKey: z.string().optional(),
  }),
  z.object({
    operation: z.literal("getParticipant"),
    did: DIDSchema,
  }),
  z.object({
    operation: z.literal("addCapacity"),
    capacity: CapacitySchema,
  }),
  z.object({
    operation: z.literal("addDesire"),
    recipientDid: DIDSchema,
    capacityId: CapacityIDSchema,
    quantityDesired: z.number().positive(),
  }),
]);

export type StorageOperation = z.infer<typeof StorageOperationSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Parse and validate data against schema, throwing descriptive error
 */
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    throw new Error(`Validation failed:\n${errors.join("\n")}`);
  }
  return result.data;
}

/**
 * Check if data matches schema without throwing
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
}

/**
 * Get human-readable validation errors
 */
export function getValidationErrors<T>(
  schema: z.ZodType<T>,
  data: unknown
): string[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
}

// ============================================================================
// Export all schemas
// ============================================================================

export const Schemas = {
  // Primitives
  DID: DIDSchema,
  Percentage: PercentageSchema,
  CapacityID: CapacityIDSchema,
  HexString: HexStringSchema,
  Bytes32: Bytes32Schema,
  Bytes64: Bytes64Schema,

  // Cryptography
  Commitment: CommitmentSchema,
  Share: ShareSchema,
  MPCShare: MPCShareSchema,

  // Participants
  Participant: ParticipantSchema,
  RecognitionValue: RecognitionValueSchema,
  MutualRecognition: MutualRecognitionSchema,

  // Capacity & Allocation
  SlotID: SlotIDSchema,
  AvailabilitySlot: AvailabilitySlotSchema,
  Capacity: CapacitySchema,
  Desire: DesireSchema,
  MutualDesire: MutualDesireSchema,
  ProviderDesire: ProviderDesireSchema,
  Allocation: AllocationSchema,
  AllocationResult: AllocationResultSchema,
  SlotAllocationResult: SlotAllocationResultSchema,
  AllocationOutput: AllocationOutputSchema,

  // Configuration
  RDXConfig: RDXConfigSchema,

  // Garbled Circuits
  GateType: GateTypeSchema,
  WireLabel: WireLabelSchema,
  Gate: GateSchema,
  GarbledGate: GarbledGateSchema,
  GarbledCircuit: GarbledCircuitSchema,

  // Storage
  StorageOperation: StorageOperationSchema,
} as const;

export default Schemas;
