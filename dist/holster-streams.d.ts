/**
 * Holster Stream Management
 * Reactive subscription system for real-time RDX data
 */
/**
 * Holster subscription stream using ReadableStream for proper lifecycle management
 */
export declare class HolsterSubscriptionStream<T> {
    private holsterPath;
    private streamType;
    private onData;
    private onError?;
    private reader;
    private stream;
    private isActive;
    private holsterRef;
    private streamId;
    constructor(holsterPath: () => any, streamType: string, onData: (data: T) => void, onError?: ((error: any) => void) | undefined);
    /**
     * Start the subscription stream
     */
    start(): Promise<void>;
    /**
     * Process the stream data
     */
    private processStream;
    /**
     * Stop the subscription stream
     */
    stop(): void;
    /**
     * Clean up resources
     */
    private cleanup;
    /**
     * Check if stream is active
     */
    get active(): boolean;
}
/**
 * Stream subscription manager with memoization and delta-based updates
 */
export declare class StreamSubscriptionManager {
    private activeStreams;
    private subscriptionType;
    private lastContributorsList;
    private isUpdating;
    constructor(subscriptionType: string);
    /**
     * Create a new subscription stream only if it doesn't already exist
     */
    createStream<T>(contributorId: string, holsterPath: () => any, streamType: string, onData: (data: T) => void, onError?: (error: any) => void): Promise<void>;
    /**
     * Stop a specific stream
     */
    stopStream(contributorId: string, streamType: string): void;
    /**
     * Stop all streams for a contributor
     */
    stopContributorStreams(contributorId: string): void;
    /**
     * Stop all streams
     */
    stopAllStreams(): void;
    /**
     * Check if contributor lists are equal
     */
    private arraysEqual;
    /**
     * Update subscriptions using delta-based approach with memoization
     */
    updateSubscriptions(newContributors: string[], createStreamFn: (contributorId: string) => Promise<void>): Promise<void>;
    /**
     * Get stream count for debugging
     */
    get streamCount(): number;
    /**
     * Get active stream keys for debugging
     */
    get activeStreamKeys(): string[];
}
/**
 * Data processor with timestamp-based freshness checking
 */
export interface DataProcessorConfig<T> {
    dataType: string;
    validator?: (data: any) => T | null;
    getCurrentData: () => T | null;
    updateStore: (data: T) => void;
    onUpdate?: () => void;
    enableTimestampComparison?: boolean;
    timestampField?: string;
}
/**
 * Create a data processor with smart timestamp handling
 */
export declare function createDataProcessor<T>(config: DataProcessorConfig<T>): (rawData: any) => void;
//# sourceMappingURL=holster-streams.d.ts.map