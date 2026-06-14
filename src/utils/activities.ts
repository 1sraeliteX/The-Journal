/**
 * Activity filtering and sorting utilities
 * Provides functions to query and manipulate activity collections
 */

import type { Activity } from '../types';

/**
 * Gets all activities for a specific day, sorted by creation date (oldest first)
 * 
 * @param activities - Array of all activities to search through
 * @param date - Target date in ISO 8601 format (YYYY-MM-DD)
 * @returns Array of activities for the specified day, sorted by createdAt ascending
 * 
 * @validates Requirements 5.2, 5.3, 5.6, 28.1, 28.4, 29.5
 */
export function getActivitiesForDay(activities: Activity[], date: string): Activity[] {
  return activities
    .filter((activity) => activity.date === date)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Gets activities for a specific day with optional limit, including overflow count
 * 
 * Limits displayed activities to a maximum of 5 per day.
 * Returns the displayed activities and the count of overflow activities.
 * 
 * @param activities - Array of all activities to search through
 * @param date - Target date in ISO 8601 format (YYYY-MM-DD)
 * @param limit - Maximum activities to display (default: 5)
 * @returns Object with displayed activities and overflow count
 * 
 * @validates Requirements 5.2, 5.3, 28.1, 28.4
 */
export function getActivitiesForDate(
  activities: Activity[],
  date: string,
  limit: number = 5
): {
  displayed: Activity[];
  overflow: number;
} {
  const dayActivities = getActivitiesForDay(activities, date);
  
  return {
    displayed: dayActivities.slice(0, limit),
    overflow: Math.max(0, dayActivities.length - limit),
  };
}

/**
 * Gets activities for a specific month
 * 
 * @param activities - Array of all activities
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Array of activities in the specified month, sorted by createdAt descending
 */
export function getActivitiesForMonth(
  activities: Activity[],
  year: number,
  month: number
): Activity[] {
  return activities
    .filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === year &&
        activityDate.getMonth() === month - 1
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Gets activities for a specific year
 * 
 * @param activities - Array of all activities
 * @param year - The year
 * @returns Array of activities in the specified year, sorted by createdAt descending
 */
export function getActivitiesForYear(
  activities: Activity[],
  year: number
): Activity[] {
  return activities
    .filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === year;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Gets activities by emoji
 * 
 * @param activities - Array of all activities
 * @param emoji - The emoji to filter by
 * @returns Array of activities with the specified emoji, sorted by createdAt descending
 */
export function getActivitiesByEmoji(
  activities: Activity[],
  emoji: string
): Activity[] {
  return activities
    .filter((activity) => activity.emoji === emoji)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Gets unique emojis used in activities
 * 
 * @param activities - Array of all activities
 * @returns Array of unique emoji strings used across all activities
 */
export function getUniqueEmojis(activities: Activity[]): string[] {
  const emojis = new Set<string>();
  activities.forEach((activity) => {
    emojis.add(activity.emoji);
  });
  return Array.from(emojis);
}

/**
 * Gets unique activity names
 * 
 * @param activities - Array of all activities
 * @returns Array of unique activity names
 */
export function getUniqueNames(activities: Activity[]): string[] {
  const names = new Set<string>();
  activities.forEach((activity) => {
    names.add(activity.name);
  });
  return Array.from(names);
}

/**
 * Finds an activity by ID
 * 
 * @param activities - Array of all activities
 * @param id - The activity ID to search for
 * @returns The activity if found, undefined otherwise
 */
export function findActivityById(
  activities: Activity[],
  id: string
): Activity | undefined {
  return activities.find((activity) => activity.id === id);
}

/**
 * Gets the most recent activity
 * 
 * @param activities - Array of all activities
 * @returns The most recently created activity, or undefined if no activities
 */
export function getMostRecentActivity(
  activities: Activity[]
): Activity | undefined {
  if (activities.length === 0) return undefined;
  return activities.reduce((latest, current) =>
    current.createdAt > latest.createdAt ? current : latest
  );
}

/**
 * Gets activities created within a date range
 * 
 * @param activities - Array of all activities
 * @param startDate - Start date in ISO 8601 format (inclusive)
 * @param endDate - End date in ISO 8601 format (inclusive)
 * @returns Array of activities within the date range, sorted by createdAt descending
 */
export function getActivitiesInDateRange(
  activities: Activity[],
  startDate: string,
  endDate: string
): Activity[] {
  return activities
    .filter((activity) => {
      const date = activity.date;
      return date >= startDate && date <= endDate;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}


/**
 * Copies activities from one date to another
 * 
 * @param activities - Array of all activities
 * @param fromDate - Source date in ISO 8601 format (YYYY-MM-DD)
 * @param toDate - Target date in ISO 8601 format (YYYY-MM-DD)
 * @returns Array of newly created activities for the target date
 */
export function copyActivitiesToDate(
  activities: Activity[],
  fromDate: string,
  toDate: string
): Activity[] {
  const sourceActivities = getActivitiesForDay(activities, fromDate);
  
  // Create new activities with the same properties but different date and ID
  return sourceActivities.map((activity) => ({
    ...activity,
    id: `${activity.id}-copy-${Date.now()}`,
    date: toDate,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
}
