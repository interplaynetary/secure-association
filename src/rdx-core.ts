/**
 * RDX Core - Data Structures & Utilities
 * Uses centralized Zod schemas for validation
 */

import { randomBytes } from "crypto";
import { commit as createCommitment } from "./crypto-core.js";
import {
  // Import all schemas
  Schemas,
  // Import types
  type Participant,
  type RecognitionValue,
  type MutualRecognition,
  type Capacity,
  type Desire,
  type Allocation,
  type RDXConfig,
  type Commitment,
  type AvailabilitySlot,
  type MutualDesire,
  type ProviderDesire,
  // Import validation helpers
  parse,
} from "./schemas.js";

// ============================================================================
// Re-export types and schemas
// ============================================================================

export type {
  Participant,
  RecognitionValue,
  MutualRecognition,
  Capacity,
  AvailabilitySlot,
  Desire,
  MutualDesire,
  ProviderDesire,
  Allocation,
  SlotAllocationResult,
  RDXConfig,
  Commitment,
  Share,
  AllocationResult,
  AllocationOutput,
  GateType,
  Gate,
  GarbledGate,
  GarbledCircuit,
  MPCShare,
} from "./schemas.js";

export {
  Schemas,
  parse,
  DIDSchema,
  PercentageSchema,
  CapacityIDSchema,
  SlotIDSchema,
  ParticipantSchema,
  RecognitionValueSchema,
  MutualRecognitionSchema,
  CapacitySchema,
  AvailabilitySlotSchema,
  DesireSchema,
  MutualDesireSchema,
  ProviderDesireSchema,
  AllocationSchema,
  SlotAllocationResultSchema,
  RDXConfigSchema,
  CommitmentSchema,
  ShareSchema,
  // Also export validation helpers for external use
  validate,
  getValidationErrors,
} from "./schemas.js";

// ============================================================================
// Custom Exceptions
// ============================================================================

export class RDXException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RDXException";
  }
}

export class ValidationError extends RDXException {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class CryptographicError extends RDXException {
  constructor(message: string) {
    super(message);
    this.name = "CryptographicError";
  }
}

export class AllocationError extends RDXException {
  constructor(message: string) {
    super(message);
    this.name = "AllocationError";
  }
}

// ============================================================================
// Validated Constructors
// ============================================================================

/**
 * Create and validate a Participant
 */
export function createParticipant(
  did: string,
  name: string,
  publicKey?: string
): Participant {
  return parse(Schemas.Participant, { did, name, publicKey });
}

/**
 * Create and validate a RecognitionValue
 */
export function createRecognitionValue(percentage: number): RecognitionValue {
  return parse(Schemas.RecognitionValue, { percentage });
}

/**
 * Create and validate a MutualRecognition
 */
export function createMutualRecognition(
  participantA: string,
  participantB: string,
  value: number
): MutualRecognition {
  return parse(Schemas.MutualRecognition, {
    participantA,
    participantB,
    value,
  });
}

/**
 * Create and validate an AvailabilitySlot
 */
export function createSlot(
  id: string,
  quantity: number,
  metadata?: Record<string, any>,
  startDate?: string,
  endDate?: string,
  recurrence?: string
): AvailabilitySlot {
  return parse(Schemas.AvailabilitySlot, {
    id,
    quantity,
    metadata,
    startDate,
    endDate,
    recurrence,
  }) as AvailabilitySlot;
}

/**
 * Create and validate a Capacity
 */
export function createCapacity(
  id: string,
  providerDid: string,
  capacityType: string,
  totalQuantity: number,
  unit: string,
  filters?: Record<string, any>,
  availabilitySlots?: AvailabilitySlot[]
): Capacity {
  return parse(Schemas.Capacity, {
    id,
    providerDid,
    capacityType,
    totalQuantity,
    unit,
    filters: filters ?? {},
    availabilitySlots: availabilitySlots ?? [],
  }) as Capacity;
}

/**
 * Create and validate a Desire
 */
export function createDesire(
  recipientDid: string,
  capacityId: string,
  quantityDesired: number,
  slotId?: string
): Desire {
  return parse(Schemas.Desire, {
    recipientDid,
    capacityId,
    quantityDesired,
    slotId,
  });
}

/**
 * Create and validate a ProviderDesire
 */
export function createProviderDesire(
  providerDid: string,
  recipientDid: string,
  capacityId: string,
  quantityOffered: number,
  slotId?: string
): ProviderDesire {
  return parse(Schemas.ProviderDesire, {
    providerDid,
    recipientDid,
    capacityId,
    slotId,
    quantityOffered,
  }) as ProviderDesire;
}

/**
 * Create and validate a MutualDesire
 */
export function createMutualDesire(
  recipientDid: string,
  capacityId: string,
  recipientDesire: number,
  providerDesire: number,
  slotId?: string
): MutualDesire {
  const mutual = Math.min(recipientDesire, providerDesire);
  return parse(Schemas.MutualDesire, {
    recipientDid,
    capacityId,
    slotId,
    recipientDesire,
    providerDesire,
    mutual,
  }) as MutualDesire;
}

/**
 * Create and validate an Allocation
 */
export function createAllocation(
  capacityId: string,
  recipientDid: string,
  quantityAllocated: number,
  slotId?: string,
  proof?: Uint8Array,
  confirmed?: boolean
): Allocation {
  return parse(Schemas.Allocation, {
    capacityId,
    slotId,
    recipientDid,
    quantityAllocated,
    proof,
    confirmed: confirmed ?? false,
  }) as Allocation;
}

/**
 * Create and validate RDXConfig
 */
export function createRDXConfig(
  mpcNodes?: number,
  threshold?: number,
  logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR"
): RDXConfig {
  return parse(Schemas.RDXConfig, {
    mpcNodes: mpcNodes ?? 3,
    threshold,
    logLevel: logLevel ?? "INFO",
  }) as RDXConfig;
}

// ============================================================================
// Performance Metrics Collector
// ============================================================================

export class MetricsCollector {
  private metrics: Map<
    string,
    { count: number; totalTime: number; avgTime: number }
  > = new Map();

  startOperation(operationName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const existing = this.metrics.get(operationName) || {
        count: 0,
        totalTime: 0,
        avgTime: 0,
      };

      const newCount = existing.count + 1;
      const newTotal = existing.totalTime + duration;

      this.metrics.set(operationName, {
        count: newCount,
        totalTime: newTotal,
        avgTime: newTotal / newCount,
      });
    };
  }

  getMetrics(operationName?: string) {
    if (operationName) {
      return this.metrics.get(operationName) || null;
    }
    return Object.fromEntries(this.metrics);
  }

  report(): string {
    const lines = ["Performance Metrics Report:", "=".repeat(60)];

    for (const [operation, stats] of this.metrics.entries()) {
      lines.push(`${operation}:`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Total Time: ${stats.totalTime.toFixed(2)}ms`);
      lines.push(`  Avg Time: ${stats.avgTime.toFixed(2)}ms`);
      lines.push("");
    }

    return lines.join("\n");
  }

  reset(): void {
    this.metrics.clear();
  }
}

// ============================================================================
// Secure Memory Management
// ============================================================================

export class SecureMemory<T> {
  private value: T | null;
  private cleared: boolean = false;

  constructor(value: T) {
    this.value = value;
  }

  get(): T {
    if (this.cleared) {
      throw new Error("Secure memory has been cleared");
    }
    if (this.value === null) {
      throw new Error("Value is null");
    }
    return this.value;
  }

  clear(): void {
    if (this.value && typeof this.value === "object") {
      // Zero out if it's a Uint8Array
      if (this.value instanceof Uint8Array) {
        this.value.fill(0);
      }
    }
    this.value = null;
    this.cleared = true;
  }

  isCleared(): boolean {
    return this.cleared;
  }
}

// ============================================================================
// Commitment Helper
// ============================================================================

export class CommitmentHelper {
  static createWithRandomness(value: number): {
    commitment: Commitment;
    randomness: Uint8Array;
  } {
    const randomness = randomBytes(32);
    const commitment = createCommitment(value, randomness);
    return { commitment, randomness };
  }

  static createSecure(value: number): {
    commitment: Commitment;
    getRandomness: () => Uint8Array;
    clearRandomness: () => void;
  } {
    const secureRandomness = new SecureMemory(randomBytes(32));
    const commitment = createCommitment(value, secureRandomness.get());

    return {
      commitment,
      getRandomness: () => secureRandomness.get(),
      clearRandomness: () => secureRandomness.clear(),
    };
  }
}

// ============================================================================
// Storage Backend Interface
// ============================================================================

export interface StorageBackend {
  // Participants
  addParticipant(did: string, name: string, publicKey?: string): void | Promise<void>;
  getParticipant(did: string): Participant | null | Promise<Participant | null>;
  listParticipants(): Participant[] | Promise<Participant[]>;

  // Capacities
  addCapacity(capacity: Capacity): void | Promise<void>;
  getCapacity(id: string): Capacity | null | Promise<Capacity | null>;
  listCapacities(providerDid?: string): Capacity[] | Promise<Capacity[]>;

  // Desires
  addDesire(
    recipientDid: string,
    capacityId: string,
    quantityDesired: number,
    slotId?: string
  ): void | Promise<void>;
  getDesires(
    capacityId: string,
    slotId?: string
  ): Array<{ recipientDid: string; quantity: number }> | Promise<Array<{ recipientDid: string; quantity: number }>>;

  // Commitments
  addCommitment(
    fromDid: string,
    toDid: string,
    commitment: Uint8Array,
    randomness: Uint8Array
  ): void | Promise<void>;
  getCommitment(
    fromDid: string,
    toDid: string
  ): { commitment: Uint8Array; randomness: Uint8Array } | null | Promise<{ commitment: Uint8Array; randomness: Uint8Array } | null>;

  // Allocations
  addAllocation(allocation: Allocation): void | Promise<void>;
  getAllocations(capacityId: string, slotId?: string): Allocation[] | Promise<Allocation[]>;
}
