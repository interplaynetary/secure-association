/**
 * RDX (Recognition Derivatives Exchange)
 * Main Export File
 */

// Core cryptography
export {
  commit,
  createCommitment,
  verify,
  verifyCommitment,
  SecretSharing,
  MPCProtocol,
  TEESimulator,
  type Commitment,
  type Share,
  type AllocationResult,
  type AllocationOutput,
} from "./crypto-core.js";

// Garbled circuits
export {
  WireLabel,
  Garbler,
  Evaluator,
  SecureMinCircuit,
  secureMinimumGarbled,
  type GateType,
  type Gate,
  type GarbledGate,
  type GarbledCircuit,
} from "./garbled-circuits.js";

// Core data structures and factories
export {
  // Exceptions
  RDXException,
  ValidationError,
  CryptographicError,
  AllocationError,

  // Factory functions
  createParticipant,
  createRecognitionValue,
  createMutualRecognition,
  createCapacity,
  createDesire,
  createAllocation,
  createRDXConfig,

  // Utilities
  MetricsCollector,
  SecureMemory,
  CommitmentHelper,

  // Types
  type Participant,
  type RecognitionValue,
  type MutualRecognition,
  type Capacity,
  type Desire,
  type Allocation,
  type RDXConfig,
  type StorageBackend,

  // Schemas
  Schemas,
  parse,
  validate,
  getValidationErrors,
  DIDSchema,
  PercentageSchema,
  CapacityIDSchema,
  ParticipantSchema,
  RecognitionValueSchema,
  MutualRecognitionSchema,
  CapacitySchema,
  DesireSchema,
  AllocationSchema,
  RDXConfigSchema,
  CommitmentSchema,
  ShareSchema,
} from "./rdx-core.js";

// Storage (Decentralized)
export { HolsterStorage } from "./holster-storage.js";

// Holster streams & timestamps
export {
  HolsterSubscriptionStream,
  StreamSubscriptionManager,
  createDataProcessor,
  type DataProcessorConfig,
} from "./holster-streams.js";

export {
  getHolsterTimestamp,
  compareTimestamps,
  isDataNewer,
  getMostRecentTimestamp,
  isReliableTimestamp,
  formatTimestamp,
  getNodeId,
  updateTimestampMetadata,
  type TimestampMetadata,
} from "./holster-timestamps.js";
