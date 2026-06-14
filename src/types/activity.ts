/**
 * Activity Type Definitions and Validation Types
 * Core data structures for activity tracking in the Activity Journal
 */

/**
 * Activity interface represents a single user-created entry
 * with a name, emoji, date, and timestamps for tracking when
 * the activity was created and last updated.
 */
export interface Activity {
  /** Unique identifier for the activity (UUID format) */
  id: string;

  /** Activity date in ISO 8601 format (YYYY-MM-DD) */
  date: string;

  /** Activity name (1-100 characters, non-empty) */
  name: string;

  /** Single Unicode emoji character representing the activity */
  emoji: string;

  /** Timestamp when activity was created (milliseconds since epoch) */
  createdAt: number;

  /** Timestamp when activity was last updated (milliseconds since epoch) */
  updatedAt: number;

  /** Whether this activity has been completed/checked off */
  completed: boolean;
}

/**
 * ActivityInput type represents form submission data
 * Excludes auto-generated fields (id, createdAt, updatedAt)
 * Used when creating or editing activities through the UI
 */
export type ActivityInput = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * ValidationResult type represents the outcome of validation operations
 * Provides success status and optional error message for display
 */
export interface ValidationResult {
  /** Whether the validation passed (true) or failed (false) */
  valid: boolean;

  /** Error message if validation failed, undefined if valid */
  error?: string;
}
