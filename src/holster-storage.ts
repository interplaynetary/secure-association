/**
 * Holster Storage Backend for RDX
 * Decentralized, real-time persistence using Holster (GunDB wire spec)
 */

import type {
  StorageBackend,
  Participant,
  Capacity,
  Allocation,
  AvailabilitySlot,
  ProviderDesire,
} from "./rdx-core.js";
import { ValidationError } from "./rdx-core.js";

// Holster will be imported dynamically
let Holster: any;

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
export class HolsterStorage implements StorageBackend {
  private holster: any;
  private user: any;
  private isInitialized = false;

  constructor(private options: { indexedDB?: boolean } = {}) {
    // Holster will be initialized asynchronously
  }

  /**
   * Initialize Holster and user authentication
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Dynamically import Holster
    const HolsterModule = await import("holster");
    Holster = HolsterModule.default || HolsterModule;

    // Initialize Holster instance
    this.holster = Holster(this.options);

    // Set up authenticated user context
    // In a real app, this would use proper authentication
    // For now, we use the userId directly
    this.user = this.holster.user(userId);

    this.isInitialized = true;
    console.log(`[HOLSTER] Initialized storage for user: ${userId.substring(0, 20)}...`);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("Holster storage not initialized. Call initialize() first.");
    }
  }

  // ========================================================================
  // Participant Operations
  // ========================================================================

  addParticipant(did: string, name: string, publicKey: string = ""): void {
    this.ensureInitialized();

    const participant = {
      did,
      name,
      publicKey,
      createdAt: Date.now(),
    };

    this.user.get("participants").get(did).put(participant, (err: any) => {
      if (err) {
        throw new ValidationError(`Failed to add participant: ${err}`);
      }
      console.log(`[HOLSTER] Added participant: ${name} (${did.substring(0, 20)}...)`);
    });
  }

  getParticipant(did: string): Promise<Participant | null> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      this.user
        .get("participants")
        .get(did)
        .once((data: any) => {
          if (!data) {
            resolve(null);
            return;
          }

          resolve({
            did: data.did,
            name: data.name,
            publicKey: data.publicKey,
          });
        });
    });
  }

  listParticipants(): Promise<Participant[]> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const participants: Participant[] = [];

      this.user
        .get("participants")
        .map()
        .once((data: any, key: string) => {
          if (data && key !== "_") {
            participants.push({
              did: data.did,
              name: data.name,
              publicKey: data.publicKey,
            });
          }

          // Note: In real usage, you'd want to batch this
          // For now, we resolve after collecting all
          resolve(participants);
        });
    });
  }

  // ========================================================================
  // Capacity Operations
  // ========================================================================

  addCapacity(capacity: Capacity): void {
    this.ensureInitialized();

    const capacityData = {
      id: capacity.id,
      providerDid: capacity.providerDid,
      capacityType: capacity.capacityType,
      totalQuantity: capacity.totalQuantity,
      unit: capacity.unit,
      filters: capacity.filters,
      createdAt: Date.now(),
    };

    this.user.get("capacities").get(capacity.id).put(capacityData, (err: any) => {
      if (err) {
        throw new ValidationError(`Failed to add capacity: ${err}`);
      }
      console.log(`[HOLSTER] Added capacity: ${capacity.id}`);
    });

    // Store slots separately for efficient querying
    if (capacity.availabilitySlots && capacity.availabilitySlots.length > 0) {
      capacity.availabilitySlots.forEach((slot) => {
        this.addSlot(slot, capacity.id);
      });
    }
  }

  getCapacity(id: string): Promise<Capacity | null> {
    this.ensureInitialized();

    return new Promise(async (resolve) => {
      this.user
        .get("capacities")
        .get(id)
        .once(async (data: any) => {
          if (!data) {
            resolve(null);
            return;
          }

          // Fetch associated slots
          const slots = await this.getSlots(id);

          resolve({
            id: data.id,
            providerDid: data.providerDid,
            capacityType: data.capacityType,
            totalQuantity: data.totalQuantity,
            unit: data.unit,
            filters: data.filters || {},
            availabilitySlots: slots,
          });
        });
    });
  }

  listCapacities(providerDid?: string): Promise<Capacity[]> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const capacities: Capacity[] = [];

      this.user
        .get("capacities")
        .map()
        .once(async (data: any, key: string) => {
          if (!data || key === "_") return;

          if (!providerDid || data.providerDid === providerDid) {
            const slots = await this.getSlots(data.id);

            capacities.push({
              id: data.id,
              providerDid: data.providerDid,
              capacityType: data.capacityType,
              totalQuantity: data.totalQuantity,
              unit: data.unit,
              filters: data.filters || {},
              availabilitySlots: slots,
            });
          }

          resolve(capacities);
        });
    });
  }

  // ========================================================================
  // Slot Operations
  // ========================================================================

  addSlot(slot: AvailabilitySlot, capacityId: string): void {
    this.ensureInitialized();

    const slotData = {
      id: slot.id,
      capacityId,
      quantity: slot.quantity,
      metadata: slot.metadata,
      startDate: slot.startDate,
      endDate: slot.endDate,
      recurrence: slot.recurrence,
      createdAt: Date.now(),
    };

    this.user
      .get("slots")
      .get(capacityId)
      .get(slot.id)
      .put(slotData, (err: any) => {
        if (err) {
          throw new ValidationError(`Failed to add slot: ${err}`);
        }
        console.log(`[HOLSTER] Added slot: ${slot.id} to capacity ${capacityId}`);
      });
  }

  getSlots(capacityId: string): Promise<AvailabilitySlot[]> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const slots: AvailabilitySlot[] = [];

      this.user
        .get("slots")
        .get(capacityId)
        .map()
        .once((data: any, key: string) => {
          if (!data || key === "_") return;

          slots.push({
            id: data.id,
            quantity: data.quantity,
            metadata: data.metadata,
            startDate: data.startDate,
            endDate: data.endDate,
            recurrence: data.recurrence,
          });

          resolve(slots);
        });
    });
  }

  // ========================================================================
  // Desire Operations
  // ========================================================================

  addDesire(
    recipientDid: string,
    capacityId: string,
    quantityDesired: number,
    slotId?: string
  ): void {
    this.ensureInitialized();

    const desireKey = `${recipientDid}_${capacityId}_${slotId || "none"}`;
    const desireData = {
      recipientDid,
      capacityId,
      slotId: slotId || null,
      quantityDesired,
      createdAt: Date.now(),
    };

    this.user.get("desires").get(desireKey).put(desireData, (err: any) => {
      if (err) {
        throw new ValidationError(`Failed to add desire: ${err}`);
      }
      console.log(`[HOLSTER] Added desire: ${desireKey}`);
    });
  }

  getDesires(
    capacityId: string,
    slotId?: string
  ): Promise<Array<{ recipientDid: string; quantity: number }>> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const desires: Array<{ recipientDid: string; quantity: number }> = [];

      this.user
        .get("desires")
        .map()
        .once((data: any, key: string) => {
          if (!data || key === "_") return;

          // Filter by capacityId and optionally slotId
          if (data.capacityId === capacityId) {
            const matchesSlot = slotId
              ? data.slotId === slotId
              : data.slotId === null;

            if (matchesSlot) {
              desires.push({
                recipientDid: data.recipientDid,
                quantity: data.quantityDesired,
              });
            }
          }

          resolve(desires);
        });
    });
  }

  // ========================================================================
  // Provider Desire Operations
  // ========================================================================

  addProviderDesire(providerDesire: ProviderDesire): void {
    this.ensureInitialized();

    const key = `${providerDesire.recipientDid}_${providerDesire.capacityId}_${providerDesire.slotId || "none"}`;
    const data = {
      providerDid: providerDesire.providerDid,
      recipientDid: providerDesire.recipientDid,
      capacityId: providerDesire.capacityId,
      slotId: providerDesire.slotId || null,
      quantityOffered: providerDesire.quantityOffered,
      createdAt: Date.now(),
    };

    this.user.get("providerDesires").get(key).put(data, (err: any) => {
      if (err) {
        throw new ValidationError(`Failed to add provider desire: ${err}`);
      }
      console.log(`[HOLSTER] Added provider desire: ${key}`);
    });
  }

  getProviderDesires(
    capacityId: string,
    slotId?: string
  ): Promise<Array<{ recipientDid: string; quantity: number }>> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const desires: Array<{ recipientDid: string; quantity: number }> = [];

      this.user
        .get("providerDesires")
        .map()
        .once((data: any, key: string) => {
          if (!data || key === "_") return;

          if (data.capacityId === capacityId) {
            const matchesSlot = slotId
              ? data.slotId === slotId
              : data.slotId === null;

            if (matchesSlot) {
              desires.push({
                recipientDid: data.recipientDid,
                quantity: data.quantityOffered,
              });
            }
          }

          resolve(desires);
        });
    });
  }

  // ========================================================================
  // Commitment Operations
  // ========================================================================

  addCommitment(
    fromDid: string,
    toDid: string,
    commitment: Uint8Array,
    randomness: Uint8Array
  ): void {
    this.ensureInitialized();

    const commitmentData = {
      fromDid,
      toDid,
      commitment: Array.from(commitment), // Convert to array for Gun storage
      randomness: Array.from(randomness),
      createdAt: Date.now(),
    };

    this.user.get("commitments").get(toDid).put(commitmentData, (err: any) => {
      if (err) {
        throw new ValidationError(`Failed to add commitment: ${err}`);
      }
      console.log(`[HOLSTER] Added commitment to ${toDid.substring(0, 20)}...`);
    });
  }

  getCommitment(
    fromDid: string,
    toDid: string
  ): Promise<{ commitment: Uint8Array; randomness: Uint8Array } | null> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      this.user
        .get("commitments")
        .get(toDid)
        .once((data: any) => {
          if (!data || data.fromDid !== fromDid) {
            resolve(null);
            return;
          }

          resolve({
            commitment: new Uint8Array(data.commitment),
            randomness: new Uint8Array(data.randomness),
          });
        });
    });
  }

  // ========================================================================
  // Allocation Operations
  // ========================================================================

  addAllocation(allocation: Allocation): void {
    this.ensureInitialized();

    const key = `${allocation.capacityId}_${allocation.slotId || "none"}_${allocation.recipientDid}`;
    const allocationData = {
      capacityId: allocation.capacityId,
      slotId: allocation.slotId || null,
      recipientDid: allocation.recipientDid,
      quantityAllocated: allocation.quantityAllocated,
      proof: allocation.proof ? Array.from(allocation.proof) : null,
      confirmed: allocation.confirmed,
      createdAt: Date.now(),
    };

    this.user.get("allocations").get(key).put(allocationData, (err: any) => {
      if (err) {
        console.error(`[HOLSTER] Failed to add allocation:`, err);
      } else {
        console.log(`[HOLSTER] Added allocation: ${key}`);
      }
    });
  }

  getAllocations(capacityId: string, slotId?: string): Promise<Allocation[]> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      const allocations: Allocation[] = [];

      this.user
        .get("allocations")
        .map()
        .once((data: any, key: string) => {
          if (!data || key === "_") return;

          if (data.capacityId === capacityId) {
            const matchesSlot = slotId
              ? data.slotId === slotId
              : true; // If no slotId filter, match all

            if (matchesSlot) {
              allocations.push({
                capacityId: data.capacityId,
                slotId: data.slotId,
                recipientDid: data.recipientDid,
                quantityAllocated: data.quantityAllocated,
                proof: data.proof ? new Uint8Array(data.proof) : undefined,
                confirmed: data.confirmed,
              });
            }
          }

          resolve(allocations);
        });
    });
  }

  // ========================================================================
  // Transaction Support
  // ========================================================================

  transaction<T>(fn: () => T): T {
    // Holster doesn't have built-in transactions like SQL
    // For now, just execute the function
    // In a real implementation, you might want to implement optimistic updates
    return fn();
  }

  // ========================================================================
  // Cleanup
  // ========================================================================

  close(): void {
    console.log("[HOLSTER] Closing storage connection");
    this.isInitialized = false;
  }
}

