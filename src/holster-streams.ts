/**
 * Holster Stream Management
 * Reactive subscription system for real-time RDX data
 */

import {
  getHolsterTimestamp,
  compareTimestamps,
  isReliableTimestamp,
  type TimestampMetadata,
  updateTimestampMetadata,
} from "./holster-timestamps.js";

/**
 * Holster subscription stream using ReadableStream for proper lifecycle management
 */
export class HolsterSubscriptionStream<T> {
  private reader: any = null; // ReadableStreamDefaultReader<T>
  private stream: ReadableStream<T> | null = null;
  private isActive = false;
  private holsterRef: any;
  private streamId: string;

  constructor(
    private holsterPath: () => any,
    private streamType: string,
    private onData: (data: T) => void,
    private onError?: (error: any) => void
  ) {
    this.streamId = `${streamType}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start the subscription stream
   */
  async start(): Promise<void> {
    if (this.isActive) {
      console.warn(`[STREAM] ${this.streamType} stream already active`);
      return;
    }

    try {
      this.isActive = true;
      console.log(
        `[STREAM] Starting ${this.streamType} stream ${this.streamId}`
      );

      this.stream = new ReadableStream<T>({
        start: (controller) => {
          try {
            // Get the Holster reference
            this.holsterRef = this.holsterPath();

            if (!this.holsterRef) {
              console.warn(
                `[STREAM] No Holster reference for ${this.streamType} stream ${this.streamId}`
              );
              return;
            }

            // Set up the Holster subscription using .on()
            this.holsterRef.on((data: T) => {
              if (this.isActive) {
                if (data !== null && data !== undefined) {
                  controller.enqueue(data);
                }
              }
            });

            console.log(
              `[STREAM] ${this.streamType} stream ${this.streamId} started successfully`
            );
          } catch (error) {
            console.error(
              `[STREAM] Error starting ${this.streamType} stream:`,
              error
            );
            controller.error(error);
            this.onError?.(error);
          }
        },
        cancel: () => {
          console.log(
            `[STREAM] Cancelling ${this.streamType} stream ${this.streamId}`
          );
          this.cleanup();
        },
      });

      // Get the reader and start processing
      this.reader = this.stream.getReader();
      this.processStream();
    } catch (error) {
      console.error(
        `[STREAM] Failed to start ${this.streamType} stream:`,
        error
      );
      this.cleanup();
      this.onError?.(error);
    }
  }

  /**
   * Process the stream data
   */
  private async processStream(): Promise<void> {
    if (!this.reader) return;

    try {
      while (this.isActive) {
        const { value, done } = await this.reader.read();

        if (done) {
          console.log(
            `[STREAM] ${this.streamType} stream ${this.streamId} completed`
          );
          break;
        }

        if (value && this.isActive) {
          this.onData(value);
        }
      }
    } catch (error) {
      if (this.isActive) {
        console.error(`[STREAM] Error in ${this.streamType} stream:`, error);
        this.onError?.(error);
      }
    } finally {
      if (!this.isActive) {
        this.cleanup();
      }
    }
  }

  /**
   * Stop the subscription stream
   */
  stop(): void {
    if (!this.isActive) return;

    console.log(`[STREAM] Stopping ${this.streamType} stream ${this.streamId}`);
    this.isActive = false;
    this.cleanup();
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.isActive = false;

    try {
      // Cancel the reader
      if (this.reader) {
        this.reader.cancel();
        this.reader = null;
      }

      // Clean up Holster subscription
      if (this.holsterRef && typeof this.holsterRef.off === "function") {
        this.holsterRef.off();
        this.holsterRef = null;
      }

      this.stream = null;
      console.log(
        `[STREAM] Cleaned up ${this.streamType} stream ${this.streamId}`
      );
    } catch (error) {
      console.error(
        `[STREAM] Error during cleanup of ${this.streamType} stream:`,
        error
      );
    }
  }

  /**
   * Check if stream is active
   */
  get active(): boolean {
    return this.isActive;
  }
}

/**
 * Stream subscription manager with memoization and delta-based updates
 */
export class StreamSubscriptionManager {
  private activeStreams = new Map<string, HolsterSubscriptionStream<any>>();
  private subscriptionType: string;
  private lastContributorsList: string[] = [];
  private isUpdating = false;

  constructor(subscriptionType: string) {
    this.subscriptionType = subscriptionType;
  }

  /**
   * Create a new subscription stream only if it doesn't already exist
   */
  async createStream<T>(
    contributorId: string,
    holsterPath: () => any,
    streamType: string,
    onData: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    const streamKey = `${contributorId}_${streamType}`;

    // Check if stream already exists and is active
    const existingStream = this.activeStreams.get(streamKey);
    if (existingStream && existingStream.active) {
      return;
    }

    // Stop inactive stream if it exists
    if (existingStream) {
      existingStream.stop();
      this.activeStreams.delete(streamKey);
    }

    // Create new stream
    const stream = new HolsterSubscriptionStream(
      holsterPath,
      `${this.subscriptionType}_${streamType}`,
      onData,
      onError
    );

    this.activeStreams.set(streamKey, stream);

    try {
      await stream.start();
    } catch (error) {
      this.activeStreams.delete(streamKey);
      throw error;
    }
  }

  /**
   * Stop a specific stream
   */
  stopStream(contributorId: string, streamType: string): void {
    const streamKey = `${contributorId}_${streamType}`;
    const stream = this.activeStreams.get(streamKey);

    if (stream) {
      stream.stop();
      this.activeStreams.delete(streamKey);
    }
  }

  /**
   * Stop all streams for a contributor
   */
  stopContributorStreams(contributorId: string): void {
    const keysToRemove: string[] = [];

    for (const [streamKey, stream] of this.activeStreams.entries()) {
      if (streamKey.startsWith(`${contributorId}_`)) {
        stream.stop();
        keysToRemove.push(streamKey);
      }
    }

    keysToRemove.forEach((key) => this.activeStreams.delete(key));
  }

  /**
   * Stop all streams
   */
  stopAllStreams(): void {
    console.log(
      `[STREAM-MANAGER] Stopping all ${this.subscriptionType} streams`
    );

    for (const [_streamKey, stream] of this.activeStreams.entries()) {
      stream.stop();
    }

    this.activeStreams.clear();
    this.lastContributorsList = [];
  }

  /**
   * Check if contributor lists are equal
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, i) => val === sortedB[i]);
  }

  /**
   * Update subscriptions using delta-based approach with memoization
   */
  async updateSubscriptions(
    newContributors: string[],
    createStreamFn: (contributorId: string) => Promise<void>
  ): Promise<void> {
    // Prevent concurrent updates
    if (this.isUpdating) {
      return;
    }

    // Check if contributors list has actually changed
    if (this.arraysEqual(newContributors, this.lastContributorsList)) {
      return;
    }

    this.isUpdating = true;

    try {
      if (!newContributors.length) {
        this.stopAllStreams();
        return;
      }

      console.log(
        `[STREAM-MANAGER] Updating ${this.subscriptionType} subscriptions for ${newContributors.length} contributors`
      );

      // Calculate current contributors from active streams
      const currentContributors = new Set<string>();
      for (const streamKey of this.activeStreams.keys()) {
        const contributorId = streamKey.split("_")[0];
        currentContributors.add(contributorId);
      }

      const newContributorSet = new Set(newContributors);
      const toAdd = newContributors.filter(
        (id) => !currentContributors.has(id)
      );
      const toRemove = Array.from(currentContributors).filter(
        (id) => !newContributorSet.has(id)
      );

      // Remove old streams
      for (const contributorId of toRemove) {
        this.stopContributorStreams(contributorId);
      }

      // Add new streams
      for (const contributorId of toAdd) {
        try {
          await createStreamFn(contributorId);
        } catch (error) {
          console.error(
            `[STREAM-MANAGER] Failed to create streams for contributor ${contributorId}:`,
            error
          );
        }
      }

      // Update last contributors list
      this.lastContributorsList = [...newContributors];

      console.log(
        `[STREAM-MANAGER] ${this.subscriptionType} streams: +${toAdd.length} -${toRemove.length} (total: ${this.activeStreams.size})`
      );
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get stream count for debugging
   */
  get streamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get active stream keys for debugging
   */
  get activeStreamKeys(): string[] {
    return Array.from(this.activeStreams.keys());
  }
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
export function createDataProcessor<T>(config: DataProcessorConfig<T>) {
  let lastTimestamp: TimestampMetadata | null = null;

  return (rawData: any) => {
    const {
      dataType,
      validator,
      getCurrentData,
      updateStore,
      onUpdate,
      enableTimestampComparison,
      timestampField,
    } = config;

    if (!rawData) {
      console.log(`[PROCESSOR] No ${dataType} data found`);
      return;
    }

    try {
      // Apply validator
      let processedData = rawData;
      if (validator) {
        processedData = validator(rawData);
        if (!processedData) {
          console.error(`[PROCESSOR] Failed to validate ${dataType} data`);
          return;
        }
      }

      // Get current data for comparison
      const currentData = getCurrentData();

      // Timestamp-based freshness check
      if (enableTimestampComparison) {
        try {
          const field = timestampField || "_";
          const incomingTimestamp = getHolsterTimestamp(rawData, field);

          if (incomingTimestamp !== null) {
            const newMetadata = updateTimestampMetadata(
              lastTimestamp,
              incomingTimestamp
            );

            if (newMetadata && newMetadata !== lastTimestamp) {
              const comparison = compareTimestamps(
                incomingTimestamp,
                lastTimestamp?.value || null
              );

              if (comparison <= 0 && isReliableTimestamp(incomingTimestamp)) {
                console.log(
                  `[PROCESSOR] Incoming ${dataType} is older/same, ignoring update`
                );
                return;
              }

              if (isReliableTimestamp(incomingTimestamp)) {
                console.log(
                  `[PROCESSOR] Incoming ${dataType} is newer, accepting update`
                );
                lastTimestamp = newMetadata;
              }
            }
          }
        } catch (timestampError) {
          console.warn(
            `[PROCESSOR] Error extracting timestamps for ${dataType}:`,
            timestampError
          );
        }
      }

      // Fallback: JSON-based change detection
      if (
        currentData &&
        JSON.stringify(currentData) === JSON.stringify(processedData)
      ) {
        return;
      }

      console.log(`[PROCESSOR] ${dataType} data changed, updating store`);
      if (processedData && typeof processedData === "object") {
        updateStore(processedData as T);
        onUpdate?.();
      }
    } catch (error) {
      console.error(`[PROCESSOR] Error processing ${dataType}:`, error);
    }
  };
}
