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
export declare function getHolsterTimestamp(wireData: any, fieldName: string): number | null;
/**
 * Compare two timestamps to determine which is newer
 *
 * @param timestamp1 - First timestamp (milliseconds)
 * @param timestamp2 - Second timestamp (milliseconds)
 * @returns Positive if timestamp1 is newer, negative if timestamp2 is newer, 0 if equal
 */
export declare function compareTimestamps(timestamp1: number | null, timestamp2: number | null): number;
/**
 * Check if data is newer than a reference timestamp
 *
 * @param wireData - The Holster wire data object
 * @param fieldName - The field name to check
 * @param referenceTimestamp - The timestamp to compare against (milliseconds)
 * @returns true if data is newer, false otherwise
 */
export declare function isDataNewer(wireData: any, fieldName: string, referenceTimestamp: number | null): boolean;
/**
 * Extract the most recent timestamp from wire data by checking all fields
 *
 * @param wireData - The Holster wire data object
 * @returns The most recent timestamp found, or null if none available
 */
export declare function getMostRecentTimestamp(wireData: any): number | null;
/**
 * Check if a timestamp is considered "reliable"
 * Gun/Holster may use epoch time (0 or very low values) as placeholder
 *
 * @param timestamp - Timestamp to check (milliseconds)
 * @returns true if timestamp appears to be a real value
 */
export declare function isReliableTimestamp(timestamp: number | null): boolean;
/**
 * Format a timestamp for display
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO string format, or 'Unknown' if null/invalid
 */
export declare function formatTimestamp(timestamp: number | null): string;
/**
 * Extract node ID from wire data
 *
 * @param wireData - The Holster wire data object
 * @returns Node ID or null if unavailable
 */
export declare function getNodeId(wireData: any): string | null;
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
export declare function updateTimestampMetadata(current: TimestampMetadata | null, newTimestamp: number | null): TimestampMetadata | null;
//# sourceMappingURL=holster-timestamps.d.ts.map