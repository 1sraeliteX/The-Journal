/**
 * Component Prop Interfaces
 * Type definitions for all React components in the Activity Journal
 */

import type { Activity } from './activity';
import type { ChartMetrics } from './metrics';

/**
 * Props for the ActivityJournal main container component
 * This is the root component that orchestrates the entire application
 */
export interface ActivityJournalProps {
  // No required props - state is managed internally
}

/**
 * Props for the CalendarSection component
 * Displays month-view calendar with navigation and activity indicators
 */
export interface CalendarSectionProps {
  /** Array of all activities to display */
  activities: Activity[];
  
  /** Currently selected year */
  selectedYear: number;
  
  /** Currently selected month (1-12) */
  selectedMonth: number;
  
  /** Callback when user selects a year */
  onYearChange: (year: number) => void;
  
  /** Callback when user selects a month */
  onMonthChange: (month: number) => void;
  
  /** Callback when user clicks on a day cell */
  onDaySelect: (date: string) => void;
  
  /** Callback to open modal for adding activity to a specific date */
  onAddActivity: (date: string) => void;
}

/**
 * Props for the DayCell component
 * Renders a single day in the calendar grid with activities
 */
export interface DayCellProps {
  /** Date string for this day (YYYY-MM-DD) */
  date: string;
  
  /** Activities to display for this day */
  activities: Activity[];
  
  /** Whether this day is in the current month */
  isCurrentMonth: boolean;
  
  /** Day of month (1-31) */
  dayOfMonth: number;
  
  /** Callback when activity is clicked (open in edit mode) */
  onActivityClick: (activity: Activity) => void;
  
  /** Callback when "Show More" button is clicked */
  onShowMore: (date: string) => void;
  
  /** Callback to add new activity for this day */
  onAddActivity: (date: string) => void;
}

/**
 * Props for the AnalyticsSection component
 * Displays metrics and charts for activity analytics
 */
export interface AnalyticsSectionProps {
  /** Array of all activities for metrics calculation */
  activities: Activity[];
  
  /** Currently selected year */
  selectedYear: number;
  
  /** Currently selected month (1-12) */
  selectedMonth: number;
}

/**
 * Props for the LineChart component
 * Renders interactive line chart showing activity metrics
 */
export interface LineChartProps {
  /** Array of data points to display in chart */
  data: ChartDataPoint[];
  
  /** Chart title */
  title: string;
  
  /** Label for X-axis */
  xAxisLabel: string;
  
  /** Label for Y-axis */
  yAxisLabel: string;
  
  /** Current view mode determining how data is displayed */
  viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Data point structure for line chart visualization
 */
export interface ChartDataPoint {
  /** Display label for this data point */
  label: string;
  
  /** Numeric value (activity count or metric) */
  value: number;
  
  /** Unix timestamp for this data point */
  timestamp: number;
}

/**
 * Props for the ActivityModal component
 * Modal dialog for creating, editing, or deleting activities
 */
export interface ActivityModalProps {
  /** Whether modal is open and visible */
  isOpen: boolean;
  
  /** Date pre-filled for new activities (YYYY-MM-DD) */
  selectedDate: string;
  
  /** Activity being edited, or null for create mode */
  editingActivity: Activity | null;
  
  /** Callback when modal is closed */
  onClose: () => void;
  
  /** Callback when activity is saved */
  onSave: (activity: Activity) => void;
  
  /** Callback when activity is deleted (only in edit mode) */
  onDelete: (activityId: string) => void;
}

/**
 * Props for the MonthSelector component
 * Provides dropdown controls for month and year navigation
 */
export interface MonthSelectorProps {
  /** Current year selection */
  currentYear: number;
  
  /** Current month selection (1-12) */
  currentMonth: number;
  
  /** Callback when year is changed */
  onYearChange: (year: number) => void;
  
  /** Callback when month is changed */
  onMonthChange: (month: number) => void;
}

/**
 * CalendarDay interface represents a single day in the calendar grid
 * Used for calendar grid generation and display
 */
export interface CalendarDay {
  /** Date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  
  /** Whether this day is in the currently displayed month */
  isCurrentMonth: boolean;
  
  /** Day of month (1-31 or relevant number for padding days) */
  dayOfMonth: number;
  
  /** Day of week (0-6, where 0 = Sunday) */
  dayOfWeek: number;
}

/**
 * Internal state for ActivityModal component
 */
export interface ActivityModalState {
  /** Current activity name input value */
  activityName: string;
  
  /** Currently selected emoji */
  selectedEmoji: string;
  
  /** Whether form is being submitted */
  isLoading: boolean;
  
  /** Error message to display, if any */
  error: string | null;
}

/**
 * Internal state for DayCell component
 */
export interface DayCellState {
  /** Activities to display (limited to 5 for standard view) */
  displayedActivities: Activity[];
  
  /** Whether there are more activities than displayed */
  hasOverflow: boolean;
  
  /** Count of activities not displayed */
  overflowCount: number;
}

/**
 * Internal state for AnalyticsSection component
 */
export interface AnalyticsSectionState {
  /** Current view mode selection */
  viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  /** Calculated metrics for current view mode */
  metrics: ChartMetrics[];
}

/**
 * Props for the CalendarGrid component
 * Renders the 6-week × 7-day calendar grid
 */
export interface CalendarGridProps {
  /** Array of calendar days to display (exactly 42 elements) */
  days: CalendarDay[];
  
  /** All activities to display in grid cells */
  activities: Activity[];
  
  /** Callback when activity is clicked */
  onActivityClick: (activity: Activity) => void;
  
  /** Callback when "Show More" button is clicked for a day */
  onShowMore: (date: string) => void;
  
  /** Callback to add new activity for a day */
  onAddActivity: (date: string) => void;
}

/**
 * Props for the ChartContainer component
 * Container for analytics section with view mode selector
 */
export interface ChartContainerProps {
  /** Current view mode */
  viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  /** Callback when view mode is changed */
  onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  
  /** Callback to calculate metrics for given parameters */
  onCalculateMetrics: (viewMode: string) => ChartMetrics[];
}
