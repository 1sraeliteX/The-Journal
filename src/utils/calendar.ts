/**
 * Calendar utilities for Activity Journal
 * Provides calendar generation and date manipulation functions
 */

import type { CalendarDay } from '../types';

/**
 * Determines if a year is a leap year
 * 
 * Leap year rules:
 * - Divisible by 4: leap year
 * - Divisible by 100: not a leap year
 * - Divisible by 400: leap year
 * 
 * @param year - The year to check
 * @returns true if leap year, false otherwise
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Gets the number of days in a month
 * 
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  // Account for leap year February
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysPerMonth[month - 1];
}

/**
 * Gets the day of week for the first day of a month
 * 
 * Uses JavaScript's Date object to determine the day of week
 * Returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
 * 
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Day of week (0-6, where 0 = Sunday)
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  // JavaScript's Date months are 0-indexed
  const date = new Date(year, month - 1, 1);
  return date.getDay();
}

/**
 * Formats a Date object as ISO 8601 date string (YYYY-MM-DD)
 * 
 * @param date - The date to format
 * @returns ISO 8601 formatted date string
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a calendar grid for a given month
 * 
 * Returns exactly 42 calendar cells (6 weeks × 7 days) for any month.
 * Includes padding days from the previous month (if the month doesn't start on Sunday)
 * and from the next month (to complete the final week).
 * 
 * Algorithm:
 * 1. Determine the first day of the month and how many days it has
 * 2. Add padding days from the previous month to fill the first week
 * 3. Add all days of the current month
 * 4. Add padding days from the next month to complete 42 cells
 * 
 * Preconditions:
 * - year must be a valid year (1900-2100)
 * - month must be between 1 and 12
 * 
 * Postconditions:
 * - Returns exactly 42 elements
 * - Array starts on a Sunday (index 0)
 * - Array ends on a Saturday (index 41)
 * - All dates are valid, consecutive, and in ISO 8601 format
 * - Current month days have isCurrentMonth=true
 * - Padding days have isCurrentMonth=false
 * - dayOfWeek values are correct (0=Sunday, 6=Saturday)
 * 
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Array of 42 CalendarDay objects representing the calendar grid
 * 
 * @validates Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
export function generateCalendarGrid(year: number, month: number): CalendarDay[] {
  const calendarDays: CalendarDay[] = [];
  
  // Validate input
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  // Get information about the month
  const firstDayOfMonth = getFirstDayOfWeek(year, month);
  const daysInCurrentMonth = getDaysInMonth(year, month);
  
  // Get the last date of the previous month
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const previousMonthDays = getDaysInMonth(previousYear, previousMonth);
  
  // Add padding days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayOfMonth = previousMonthDays - i;
    
    // Create a date for this day
    const date = new Date(previousYear, previousMonth - 1, dayOfMonth);
    
    calendarDays.push({
      date: formatDateISO(date),
      isCurrentMonth: false,
      dayOfMonth: dayOfMonth,
      dayOfWeek: date.getDay(),
    });
  }
  
  // Add days of current month
  for (let dayOfMonth = 1; dayOfMonth <= daysInCurrentMonth; dayOfMonth++) {
    const date = new Date(year, month - 1, dayOfMonth);
    
    calendarDays.push({
      date: formatDateISO(date),
      isCurrentMonth: true,
      dayOfMonth: dayOfMonth,
      dayOfWeek: date.getDay(),
    });
  }
  
  // Add padding days from next month to complete the grid (42 cells total)
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  let nextDayOfMonth = 1;
  
  while (calendarDays.length < 42) {
    const date = new Date(nextYear, nextMonth - 1, nextDayOfMonth);
    
    calendarDays.push({
      date: formatDateISO(date),
      isCurrentMonth: false,
      dayOfMonth: nextDayOfMonth,
      dayOfWeek: date.getDay(),
    });
    
    nextDayOfMonth++;
  }
  
  // ASSERTION: calendarDays.length === 42
  if (calendarDays.length !== 42) {
    throw new Error(`Calendar grid must have exactly 42 cells, but got ${calendarDays.length}`);
  }
  
  // ASSERTION: First day is Sunday (dayOfWeek = 0)
  if (calendarDays[0].dayOfWeek !== 0) {
    throw new Error(`First day of calendar grid must be Sunday, but got day ${calendarDays[0].dayOfWeek}`);
  }
  
  // ASSERTION: Last day is Saturday (dayOfWeek = 6)
  if (calendarDays[41].dayOfWeek !== 6) {
    throw new Error(`Last day of calendar grid must be Saturday, but got day ${calendarDays[41].dayOfWeek}`);
  }
  
  return calendarDays;
}
