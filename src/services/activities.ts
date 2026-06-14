/**
 * Activity CRUD Service
 * Provides core operations for creating, updating, and deleting activities
 * Ensures immutability of ID and date fields
 */

import type { Activity, ActivityInput } from '../types';

/**
 * Generates a unique identifier (UUID v4 format)
 * 
 * @returns A UUID string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a new activity with default timestamps
 * 
 * The created activity will have:
 * - A unique UUID
 * - Current timestamp for createdAt and updatedAt
 * - Immutable date and ID fields
 * 
 * @param name - Activity name (1-100 characters)
 * @param emoji - Single emoji character
 * @param date - Activity date in ISO 8601 format (YYYY-MM-DD)
 * @returns New Activity object with generated ID and timestamps
 * 
 * @validates Requirements 1.1, 1.2, 1.3, 1.4
 */
export function createActivity(name: string, emoji: string, date: string): Activity {
  const now = Date.now();
  
  return {
    id: generateUUID(),
    name,
    emoji,
    date,
    createdAt: now,
    updatedAt: now,
    completed: false,
  };
}

/**
 * Updates an activity with new values
 * 
 * Ensures that:
 * - ID remains immutable (cannot be changed)
 * - Date remains immutable (cannot be changed)
 * - updatedAt is set to current timestamp
 * - createdAt is preserved from the original activity
 * - All other fields can be updated
 * 
 * @param activity - The original activity to update
 * @param updates - Partial activity data with fields to update
 * @returns New Activity object with updates applied
 * 
 * @validates Requirements 2.1, 2.2, 2.3, 2.4
 */
export function updateActivity(
  activity: Activity,
  updates: Partial<Omit<Activity, 'id' | 'date' | 'createdAt'>>
): Activity {
  const now = Date.now();
  
  return {
    ...activity,
    ...updates,
    // Enforce immutable fields
    id: activity.id,
    date: activity.date,
    createdAt: activity.createdAt,
    updatedAt: now,
  };
}

/**
 * Marks an activity as deleted by returning undefined
 * 
 * In this implementation, deletion is handled by filtering activities
 * from the parent collection rather than modifying the activity itself.
 * This function serves as a marker for deletion operations.
 * 
 * @param _activity - The activity to delete (not modified)
 * @returns void
 * 
 * @validates Requirements 3.1, 3.2
 */
export function deleteActivity(_activity: Activity): void {
  // Activity deletion is handled at the collection level
  // This function serves as a contract for the deletion operation
  // The actual removal occurs in the parent collection/state management
}

/**
 * Creates an activity from input data
 * 
 * Helper function that creates a new activity from ActivityInput type
 * which excludes the auto-generated fields.
 * 
 * @param input - Activity input data
 * @returns New Activity object
 */
export function activityFromInput(input: ActivityInput): Activity {
  return createActivity(input.name, input.emoji, input.date);
}

/**
 * Converts an activity to input format
 * 
 * Removes auto-generated fields (id, createdAt, updatedAt) to create
 * an ActivityInput object suitable for form submission or updates.
 * 
 * @param activity - The activity to convert
 * @returns ActivityInput object without auto-generated fields
 */
export function activityToInput(activity: Activity): ActivityInput {
  return {
    name: activity.name,
    emoji: activity.emoji,
    date: activity.date,
    completed: activity.completed,
  };
}

/**
 * Validates that an activity ID is immutable
 * 
 * Helper function to ensure ID doesn't change during updates
 * 
 * @param originalId - The original activity ID
 * @param newId - The new ID (should be identical)
 * @returns true if IDs match, false otherwise
 */
export function isIDImmutable(originalId: string, newId: string): boolean {
  return originalId === newId;
}

/**
 * Validates that an activity date is immutable
 * 
 * Helper function to ensure date doesn't change during updates
 * 
 * @param originalDate - The original activity date
 * @param newDate - The new date (should be identical)
 * @returns true if dates match, false otherwise
 */
export function isDateImmutable(originalDate: string, newDate: string): boolean {
  return originalDate === newDate;
}
