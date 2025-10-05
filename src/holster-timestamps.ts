/**
 * Holster/Gun Timestamp Utility
 * 
 * Provides timestamp extraction from Holster's wire spec (GunDB format)
 * Wire spec format: { _: { "#": nodeId, ">": { field: timestamp } } }
 */

/**
 * Extract timestamp for a specific field from Holster wire data
 * 
 * @param wireData - The Holster wire data object
 * @param fieldName - The field name to get the timestamp for
 * @returns Unix timestamp in milliseconds, or null if unavailable
 */
export function getHolsterTimestamp(
  wireData: any,
  fieldName: string
): number | null {
  try {
    // Check if wire data has Gun metadata
    if (!wireData || !wireData._) {
      return null;
    }

    // Access the state timestamps object
    const stateTimestamps = wireData._[">"];
    if (!stateTimestamps || typeof stateTimestamps !== "object") {
      return null;
    }

    // Get timestamp for the specific field
    const timestamp = stateTimestamps[fieldName];
    
    if (typeof timestamp === "number" && timestamp > 0) {
      return timestamp;
    }

    return null;
  } catch (error) {
    console.error("[HOLSTER-TIMESTAMP] Error extracting timestamp:", error);
    return null;
  }
}

/**
 * Compare two timestamps to determine which is newer
 * 
 * @param timestamp1 - First timestamp (milliseconds)
 * @param timestamp2 - Second timestamp (milliseconds)
 * @returns Positive if timestamp1 is newer, negative if timestamp2 is newer, 0 if equal
 */
export function compareTimestamps(
  timestamp1: number | null,
  timestamp2: number | null
): number {
  if (timestamp1 === null && timestamp2 === null) return 0;
  if (timestamp1 === null) return -1;
  if (timestamp2 === null) return 1;
  return timestamp1 - timestamp2;
}

/**
 * Check if data is newer than a reference timestamp
 * 
 * @param wireData - The Holster wire data object
 * @param fieldName - The field name to check
 * @param referenceTimestamp - The timestamp to compare against (milliseconds)
 * @returns true if data is newer, false otherwise
 */
export function isDataNewer(
  wireData: any,
  fieldName: string,
  referenceTimestamp: number | null
): boolean {
  const dataTimestamp = getHolsterTimestamp(wireData, fieldName);
  return compareTimestamps(dataTimestamp, referenceTimestamp) > 0;
}

/**
 * Extract the most recent timestamp from wire data by checking all fields
 * 
 * @param wireData - The Holster wire data object
 * @returns The most recent timestamp found, or null if none available
 */
export function getMostRecentTimestamp(wireData: any): number | null {
  try {
    if (!wireData || !wireData._ || !wireData._[">"]) {
      return null;
    }

    const stateTimestamps = wireData._[">"];
    let mostRecent: number | null = null;

    for (const field of Object.keys(stateTimestamps)) {
      const timestamp = stateTimestamps[field];
      if (typeof timestamp === "number") {
        if (mostRecent === null || timestamp > mostRecent) {
          mostRecent = timestamp;
        }
      }
    }

    return mostRecent;
  } catch (error) {
    console.error("[HOLSTER-TIMESTAMP] Error finding most recent timestamp:", error);
    return null;
  }
}

/**
 * Check if a timestamp is considered "reliable"
 * Gun/Holster may use epoch time (0 or very low values) as placeholder
 * 
 * @param timestamp - Timestamp to check (milliseconds)
 * @returns true if timestamp appears to be a real value
 */
export function isReliableTimestamp(timestamp: number | null): boolean {
  if (timestamp === null) return false;

  // Consider timestamps after Jan 2, 1970 as reliable
  const MIN_RELIABLE_TIMESTAMP = new Date("1970-01-02T00:00:00.000Z").getTime();
  return timestamp > MIN_RELIABLE_TIMESTAMP;
}

/**
 * Format a timestamp for display
 * 
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO string format, or 'Unknown' if null/invalid
 */
export function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) return "Unknown";

  try {
    return new Date(timestamp).toISOString();
  } catch (error) {
    return "Invalid";
  }
}

/**
 * Extract node ID from wire data
 * 
 * @param wireData - The Holster wire data object
 * @returns Node ID or null if unavailable
 */
export function getNodeId(wireData: any): string | null {
  try {
    return wireData?._?.["#"] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Create timestamp metadata for persistence
 * Used to track the most recent network timestamps
 */
export interface TimestampMetadata {
  value: number;
  reliable: boolean;
  updatedAt: number;
}

/**
 * Update timestamp metadata with smart validation
 * 
 * @param current - Current timestamp metadata (if any)
 * @param newTimestamp - New timestamp from network
 * @returns Updated metadata or null if update should be rejected
 */
export function updateTimestampMetadata(
  current: TimestampMetadata | null,
  newTimestamp: number | null
): TimestampMetadata | null {
  if (newTimestamp === null) {
    return current;
  }

  const isReliable = isReliableTimestamp(newTimestamp);

  // If no current metadata, accept the new timestamp
  if (!current) {
    return {
      value: newTimestamp,
      reliable: isReliable,
      updatedAt: Date.now(),
    };
  }

  // If new timestamp is not reliable, keep current if it's reliable
  if (!isReliable && current.reliable) {
    return current;
  }

  // If new timestamp is newer, update
  if (newTimestamp > current.value) {
    return {
      value: newTimestamp,
      reliable: isReliable,
      updatedAt: Date.now(),
    };
  }

  return current;
}

