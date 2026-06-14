/**
 * Central export point for all type definitions
 * Enables convenient importing: import type { Activity } from '@/types'
 */

export type { Activity, ActivityInput, ValidationResult } from './activity';
export type { ChartMetrics, DayMetrics } from './metrics';
export { isChartMetrics, isDayMetrics } from './metrics';
export type { StorageMetadata } from './storage';
export type {
  ActivityJournalProps,
  CalendarSectionProps,
  DayCellProps,
  AnalyticsSectionProps,
  LineChartProps,
  ActivityModalProps,
  MonthSelectorProps,
  ChartDataPoint,
  CalendarDay,
  ActivityModalState,
  DayCellState,
  AnalyticsSectionState,
  CalendarGridProps,
  ChartContainerProps,
} from './components';
