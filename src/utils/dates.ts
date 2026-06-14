/**
 * Date utilities for Activity Journal
 * Provides helper functions for date manipulation and formatting
 * These utilities are exported from calendar.ts to avoid duplication
 */

export { isLeapYear, getDaysInMonth, getFirstDayOfWeek, formatDateISO } from './calendar';

/**
 * Gets the start of a date range for the current month
 * 
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Date object representing the first day of the month
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * Gets the end of a date range for the current month
 * 
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Date object representing the last day of the month
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month, 0);
}

/**
 * Gets the current date in ISO 8601 format
 * 
 * @returns Current date as YYYY-MM-DD string
 */
export function getTodayISO(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Parses an ISO 8601 date string to a Date object
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object (note: timezone is interpreted as UTC)
 */
export function parseISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Adds days to a date and returns as ISO string
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @returns New date as YYYY-MM-DD string
 */
export function addDaysISO(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Checks if two date strings represent the same date
 * 
 * @param date1 - First date in YYYY-MM-DD format
 * @param date2 - Second date in YYYY-MM-DD format
 * @returns true if dates are the same, false otherwise
 */
export function isSameDate(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Checks if a date is today
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if the date is today, false otherwise
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}

/**
 * Compares two dates
 * 
 * @param date1 - First date in YYYY-MM-DD format
 * @param date2 - Second date in YYYY-MM-DD format
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: string, date2: string): number {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}
