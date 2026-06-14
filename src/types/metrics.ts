/**
 * Metrics Type Definitions
 * Data structures for aggregated statistics about activities
 */

/**
 * ChartMetrics interface represents aggregated activity statistics
 * for a specific time period (day, week, month, or year)
 */
export interface ChartMetrics {
  /** 
   * Period label formatted based on view mode:
   * - Daily: "Mon 12/18" (day name + date)
   * - Weekly: "Week 50"
   * - Monthly: "December"
   * - Yearly: "2024"
   */
  period: string;
  
  /** Total number of activities in this period */
  activityCount: number;
  
  /** Count of unique activity types (by name) in this period */
  uniqueActivities: number;
  
  /** 
   * Completion rate as percentage (0-100)
   * Calculated as: (activityCount / maxPossibleActivities) * 100, capped at 100%
   */
  completionRate: number;
  
  /** Average activities per day in this period (non-negative number) */
  averagePerDay: number;
}

/**
 * DayMetrics interface represents activity statistics for a single day
 * Provides detailed metrics specific to daily view and calendar display
 */
export interface DayMetrics {
  /** Day date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  
  /** Day of week (0-6, where 0 = Sunday, 6 = Saturday) */
  dayOfWeek: number;
  
  /** Total number of activities for this day */
  activityCount: number;
  
  /** Whether this day is today */
  isToday: boolean;
  
  /** Whether this day has no activities */
  isEmpty: boolean;
}

/**
 * Type guard function to validate ChartMetrics at runtime
 * @param value - Value to validate
 * @returns true if value is a valid ChartMetrics object, false otherwise
 */
export function isChartMetrics(value: unknown): value is ChartMetrics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.period === 'string' &&
    typeof obj.activityCount === 'number' &&
    obj.activityCount >= 0 &&
    Number.isInteger(obj.activityCount) &&
    typeof obj.uniqueActivities === 'number' &&
    obj.uniqueActivities >= 0 &&
    Number.isInteger(obj.uniqueActivities) &&
    typeof obj.completionRate === 'number' &&
    obj.completionRate >= 0 &&
    obj.completionRate <= 100 &&
    typeof obj.averagePerDay === 'number' &&
    obj.averagePerDay >= 0
  );
}

/**
 * Type guard function to validate DayMetrics at runtime
 * @param value - Value to validate
 * @returns true if value is a valid DayMetrics object, false otherwise
 */
export function isDayMetrics(value: unknown): value is DayMetrics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate ISO 8601 date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isValidDate =
    typeof obj.date === 'string' && dateRegex.test(obj.date);

  return (
    isValidDate &&
    typeof obj.dayOfWeek === 'number' &&
    obj.dayOfWeek >= 0 &&
    obj.dayOfWeek <= 6 &&
    Number.isInteger(obj.dayOfWeek) &&
    typeof obj.activityCount === 'number' &&
    obj.activityCount >= 0 &&
    Number.isInteger(obj.activityCount) &&
    typeof obj.isToday === 'boolean' &&
    typeof obj.isEmpty === 'boolean'
  );
}
