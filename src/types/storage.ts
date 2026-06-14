/**
 * Storage Type Definitions
 * Types for managing storage metadata and persistence
 */

/**
 * StorageMetadata interface represents metadata about stored activities
 * Includes version tracking, update timestamps, and activity counts
 * for maintaining data integrity and enabling migrations
 */
export interface StorageMetadata {
  /** Storage schema version for migration tracking */
  version: number;

  /** Timestamp of the last storage update (milliseconds since epoch) */
  lastUpdated: number;

  /** Total count of activities in storage */
  totalActivityCount: number;
}
