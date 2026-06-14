/**
 * Metrics calculation utilities for Activity Journal
 * Provides functions to calculate aggregated statistics about activities
 */

import type { Activity, DayMetrics, ChartMetrics } from '../types';

/**
 * Calculates metrics for a single day
 * 
 * @param activities - Array of all activities to search through
 * @param date - Target date in ISO 8601 format (YYYY-MM-DD)
 * @returns DayMetrics object with activity statistics for the day
 * 
 * @validates Requirements 9.1, 9.2, 9.3
 */
export function calculateDayMetrics(activities: Activity[], date: string): DayMetrics {
  // Parse the date string
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = dateObj.getDay();
  
  // Filter activities for this specific date
  const dayActivities = activities.filter((activity) => activity.date === date);
  
  // Count total activities
  const activityCount = dayActivities.length;
  
  // Check if today
  const today = new Date();
  const isToday =
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate();
  
  // Check if empty
  const isEmpty = activityCount === 0;
  
  return {
    date,
    dayOfWeek,
    activityCount,
    isToday,
    isEmpty,
  };
}

/**
 * Calculates daily metrics for all days in a month
 * 
 * Iterates through each day in the specified month and calculates
 * metrics for that day, returning an array of ChartMetrics for chart display.
 * 
 * @param activities - Array of all activities
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Array of ChartMetrics, one per day in the month
 * 
 * @validates Requirements 9.1-9.7
 */
export function calculateDailyMetrics(
  activities: Activity[],
  year: number,
  month: number
): ChartMetrics[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const metrics: ChartMetrics[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Format date as ISO string
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Get day of week for formatting (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get activities for this day
    const dayActivities = activities.filter((activity) => activity.date === dateStr);
    
    // Calculate metrics
    const activityCount = dayActivities.length;
    const uniqueActivities = new Set(dayActivities.map((a) => a.name)).size;
    
    // Completion rate: assume max 10 activities per day for reference
    const maxPossibleActivities = 10;
    const completionRate = Math.min((activityCount / maxPossibleActivities) * 100, 100);
    
    // Average per day (just the count for daily view)
    const averagePerDay = activityCount;
    
    // Format period as "Mon 12/18"
    const period = `${dayNames[dayOfWeek]} ${month}/${day}`;
    
    metrics.push({
      period,
      activityCount,
      uniqueActivities,
      completionRate,
      averagePerDay,
    });
  }
  
  return metrics;
}

/**
 * Calculates weekly metrics for all weeks in a month
 * 
 * Groups activities by week and calculates aggregated metrics for each week.
 * 
 * @param activities - Array of all activities
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Array of ChartMetrics, one per week in the month
 */
export function calculateWeeklyMetrics(
  activities: Activity[],
  year: number,
  month: number
): ChartMetrics[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const metrics: ChartMetrics[] = [];
  const weeks = new Map<number, Activity[]>();
  
  // Group activities by week number
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    
    // Calculate week number
    const firstDay = new Date(year, month - 1, 1);
    const weekOfMonth = Math.floor((dateObj.getDate() + firstDay.getDay() - 1) / 7) + 1;
    
    if (!weeks.has(weekOfMonth)) {
      weeks.set(weekOfMonth, []);
    }
    
    const dayActivities = activities.filter((activity) => activity.date === dateStr);
    weeks.get(weekOfMonth)!.push(...dayActivities);
  }
  
  // Calculate metrics for each week
  weeks.forEach((weekActivities, weekNumber) => {
    const activityCount = weekActivities.length;
    const uniqueActivities = new Set(weekActivities.map((a) => a.name)).size;
    const completionRate = Math.min((activityCount / 70) * 100, 100); // 70 = 10 per day × 7 days
    const averagePerDay = weekActivities.length / 7;
    
    metrics.push({
      period: `Week ${weekNumber}`,
      activityCount,
      uniqueActivities,
      completionRate,
      averagePerDay,
    });
  });
  
  return metrics;
}

/**
 * Calculates monthly metrics for all months in a year
 * 
 * @param activities - Array of all activities
 * @param year - The year
 * @returns Array of ChartMetrics, one per month in the year
 */
export function calculateMonthlyMetrics(activities: Activity[], year: number): ChartMetrics[] {
  const metrics: ChartMetrics[] = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  
  for (let month = 1; month <= 12; month++) {
    const monthActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === year && activityDate.getMonth() === month - 1;
    });
    
    const activityCount = monthActivities.length;
    const uniqueActivities = new Set(monthActivities.map((a) => a.name)).size;
    const daysInMonth = new Date(year, month, 0).getDate();
    const completionRate = Math.min((activityCount / (10 * daysInMonth)) * 100, 100);
    const averagePerDay = activityCount / daysInMonth;
    
    metrics.push({
      period: monthNames[month - 1],
      activityCount,
      uniqueActivities,
      completionRate,
      averagePerDay,
    });
  }
  
  return metrics;
}

/**
 * Calculates yearly metrics for multiple years
 * 
 * @param activities - Array of all activities
 * @param startYear - Starting year (inclusive)
 * @param endYear - Ending year (inclusive)
 * @returns Array of ChartMetrics, one per year
 */
export function calculateYearlyMetrics(
  activities: Activity[],
  startYear: number,
  endYear: number
): ChartMetrics[] {
  const metrics: ChartMetrics[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const yearActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === year;
    });
    
    const activityCount = yearActivities.length;
    const uniqueActivities = new Set(yearActivities.map((a) => a.name)).size;
    const daysInYear = new Date(year, 11, 31).getDate() === 31 && new Date(year, 1, 29).getDate() === 29 ? 366 : 365;
    const completionRate = Math.min((activityCount / (10 * daysInYear)) * 100, 100);
    const averagePerDay = activityCount / daysInYear;
    
    metrics.push({
      period: String(year),
      activityCount,
      uniqueActivities,
      completionRate,
      averagePerDay,
    });
  }
  
  return metrics;
}
