# Type Definition Hierarchy and Relationships

## Overview
This document describes the type hierarchy and relationships between the core TypeScript types used throughout the Activity Journal application.

---

## Type Structure

### Core Data Models

#### Activity (`activity.ts`)
```
Activity (interface)
├── id: string (UUID)
├── date: string (ISO 8601: YYYY-MM-DD)
├── name: string (1-100 chars)
├── emoji: string (single Unicode emoji)
├── createdAt: number (milliseconds since epoch)
└── updatedAt: number (milliseconds since epoch)
```

**Constraints:**
- `id` must be globally unique and non-empty
- `date` must be valid ISO 8601 format
- `name` must be non-empty with 1-100 characters
- `emoji` must be a single valid Unicode emoji
- `createdAt` and `updatedAt` must be positive integers
- `updatedAt >= createdAt` (temporal ordering)

**Derived Types:**
- `ActivityInput` = `Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>` (for form submissions)

#### ChartMetrics (`metrics.ts`)
```
ChartMetrics (interface)
├── period: string (formatted label based on view mode)
├── activityCount: number (total activities)
├── uniqueActivities: number (unique activity names)
├── completionRate: number (0-100%)
└── averagePerDay: number (non-negative)
```

**Format Examples:**
- Daily: "Mon 12/18"
- Weekly: "Week 50"
- Monthly: "December"
- Yearly: "2024"

#### DayMetrics (`metrics.ts`)
```
DayMetrics (interface)
├── date: string (ISO 8601: YYYY-MM-DD)
├── dayOfWeek: number (0-6, Sunday-Saturday)
├── activityCount: number
├── isToday: boolean
└── isEmpty: boolean
```

---

### Component Prop Interfaces

#### Container Components

**ActivityJournalProps** (root component)
- No required props; manages state internally

**CalendarSectionProps**
```
├── activities: Activity[]
├── selectedYear: number
├── selectedMonth: number (1-12)
├── onYearChange: (year: number) => void
├── onMonthChange: (month: number) => void
├── onDaySelect: (date: string) => void
└── onAddActivity: (date: string) => void
```

**AnalyticsSectionProps**
```
├── activities: Activity[]
├── selectedYear: number
└── selectedMonth: number (1-12)
```

#### Presentational Components

**DayCellProps**
```
├── date: string (YYYY-MM-DD)
├── activities: Activity[]
├── isCurrentMonth: boolean
├── dayOfMonth: number (1-31)
├── onActivityClick: (activity: Activity) => void
├── onShowMore: (date: string) => void
└── onAddActivity: (date: string) => void
```

**LineChartProps**
```
├── data: ChartDataPoint[]
├── title: string
├── xAxisLabel: string
├── yAxisLabel: string
└── viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly'
```

**ActivityModalProps**
```
├── isOpen: boolean
├── selectedDate: string (YYYY-MM-DD)
├── editingActivity: Activity | null
├── onClose: () => void
├── onSave: (activity: Activity) => void
└── onDelete: (activityId: string) => void
```

**MonthSelectorProps**
```
├── currentYear: number
├── currentMonth: number (1-12)
├── onYearChange: (year: number) => void
└── onMonthChange: (month: number) => void
```

---

### Supporting Interfaces

#### ChartDataPoint (`components.ts`)
```
ChartDataPoint (interface)
├── label: string
├── value: number
└── timestamp: number
```
Used to structure data for line chart rendering.

#### CalendarDay (`components.ts`)
```
CalendarDay (interface)
├── date: string (ISO 8601: YYYY-MM-DD)
├── isCurrentMonth: boolean
├── dayOfMonth: number
└── dayOfWeek: number (0-6)
```
Represents a single day in the calendar grid (always exactly 42 days: 6 weeks × 7 days).

#### Validation Type (`activity.ts`)
```
ValidationResult (interface)
├── valid: boolean
└── error?: string
```
Used for validation function return values.

---

### Internal Component State Interfaces

**ActivityModalState**
```
├── activityName: string
├── selectedEmoji: string
├── isLoading: boolean
└── error: string | null
```

**DayCellState**
```
├── displayedActivities: Activity[]
├── hasOverflow: boolean
└── overflowCount: number
```

**AnalyticsSectionState**
```
├── viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly'
└── metrics: ChartMetrics[]
```

---

## Data Flow Relationships

### Activity Creation Flow
```
ActivityInput (user form data)
    ↓
Activity (with generated id, timestamps)
    ↓
Storage (LocalStorage/IndexedDB)
```

### Activity Display Flow
```
Activity[] (from storage)
    ↓
CalendarSection (organizes by date)
    ↓
DayCell[] (displays activities per day)
    ↓
DayCell renders Activity with emoji + name
```

### Analytics Flow
```
Activity[] (all stored activities)
    ↓
Metrics Calculator (groups by time period)
    ↓
ChartMetrics[] (aggregated statistics)
    ↓
LineChart (visualizes ChartMetrics)
```

---

## Type Export Structure

### File Organization
```
src/types/
├── activity.ts         → Activity, ActivityInput, ValidationResult
├── metrics.ts          → ChartMetrics, DayMetrics
├── components.ts       → All component prop interfaces + supporting types
└── index.ts            → Central export point for all types
```

### Central Export (`index.ts`)
All types are re-exported from a central `index.ts` file, enabling:
```typescript
import type { Activity, ChartMetrics, LineChartProps } from '@/types'
```

---

## Type Constraints and Invariants

### Temporal Invariants
- `activity.updatedAt >= activity.createdAt` (always maintained)
- All timestamps are positive integers (milliseconds since epoch)

### Calendar Invariants
- Calendar grid always has exactly 42 days (6 weeks × 7 days)
- First day of grid is always a Sunday (day 0)
- Last day of grid is always a Saturday (day 6)
- All dates are consecutive and valid ISO 8601 strings

### Activity Invariants
- Activity IDs are globally unique
- Activity dates are immutable (cannot change after creation)
- Activity names are 1-100 characters (trimmed)
- Activity emoji is exactly one Unicode character

### Metrics Invariants
- No activity is counted twice across periods
- Sum of activityCount across all metrics = total activities in range
- Metrics are ordered chronologically (earliest to latest)
- Completion rate is always 0-100% (capped)

---

## Validation Rules by Type

### Activity Validation
| Field | Rules | Example |
|-------|-------|---------|
| `id` | Non-empty UUID string | "550e8400-e29b-41d4-a716-446655440000" |
| `date` | ISO 8601 (YYYY-MM-DD) | "2024-12-18" |
| `name` | 1-100 chars, trimmed | "Morning Jog" |
| `emoji` | Single Unicode emoji | "🏃" |
| `createdAt` | Positive integer, ms | 1702915200000 |
| `updatedAt` | >= createdAt, ms | 1702915200000 |

### Component Props Validation
- Year: current year through +5 years
- Month: 1-12
- ViewMode: 'daily' | 'weekly' | 'monthly' | 'yearly'
- Activity array: may be empty (empty state handling required)

---

## Type Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Core Domain Models                                          │
├─────────────────────────────────────────────────────────────┤
│  Activity ─── ActivityInput (for forms)                     │
│      │                                                      │
│      └──→ ChartMetrics (aggregated per time period)        │
│            └──→ LineChart visualization                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Component Interfaces                                        │
├─────────────────────────────────────────────────────────────┤
│  ActivityJournal (root)                                     │
│      ├── CalendarSection                                    │
│      │    ├── MonthSelector                                │
│      │    └── CalendarGrid                                 │
│      │         └── DayCell (displays Activity[])           │
│      │              └── ActivityModal                       │
│      └── AnalyticsSection                                   │
│           └── LineChart (displays ChartMetrics[])          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Supporting Types                                            │
├─────────────────────────────────────────────────────────────┤
│  CalendarDay (42 per month)                                 │
│  ChartDataPoint (for chart rendering)                       │
│  ValidationResult (for validation functions)                │
│  Internal state interfaces (Modal, DayCell, Analytics)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Type Safety Guarantees

1. **Compile-time type checking** ensures type correctness
2. **Activity immutability** for date and ID fields
3. **Timestamp ordering** (`updatedAt >= createdAt`)
4. **Calendar consistency** (always 42-day grid)
5. **Metrics completeness** (no duplicate counting)
6. **Component prop validation** via TypeScript interfaces

---

## Usage Examples

### Importing Types
```typescript
// From central export
import type { Activity, ChartMetrics, LineChartProps } from '@/types';

// Or from specific files
import type { Activity, ActivityInput } from '@/types/activity';
import type { ChartMetrics } from '@/types/metrics';
import type { DayCellProps } from '@/types/components';
```

### Creating an Activity
```typescript
const newActivity: Activity = {
  id: generateUUID(),
  date: '2024-12-18',
  name: 'Morning Jog',
  emoji: '🏃',
  createdAt: Date.now(),
  updatedAt: Date.now()
};
```

### Component Props
```typescript
<DayCell
  date="2024-12-18"
  activities={[...]} // Activity[]
  isCurrentMonth={true}
  dayOfMonth={18}
  onActivityClick={(activity) => { /* ... */ }}
  onShowMore={(date) => { /* ... */ }}
  onAddActivity={(date) => { /* ... */ }}
/>
```

### Metrics Aggregation
```typescript
const dailyMetrics: ChartMetrics[] = calculateDailyMetrics(
  activities,
  2024,
  12
);

// Result contains metrics for each day:
// { period: "Mon 12/18", activityCount: 3, uniqueActivities: 2, ... }
```
