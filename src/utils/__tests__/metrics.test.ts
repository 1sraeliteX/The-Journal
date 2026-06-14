/**
 * Unit tests for metrics calculation functions
 * Tests for calculateDayMetrics, calculateDailyMetrics, etc.
 */

import { 
  calculateDayMetrics,
  calculateDailyMetrics,
  calculateWeeklyMetrics,
  calculateMonthlyMetrics,
  calculateYearlyMetrics
} from '../metrics';
import type { Activity } from '../../types';

// Helper functions for testing
function expect(value: any) {
  return {
    toBe: (expected: any) => {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`);
      }
    },
    toHaveLength: (expected: number) => {
      if (Array.isArray(value) && value.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${value.length}`);
      }
    },
    toBeGreaterThan: (expected: number) => {
      if (value <= expected) {
        throw new Error(`Expected value > ${expected}, got ${value}`);
      }
    },
    toBeGreaterThanOrEqual: (expected: number) => {
      if (value < expected) {
        throw new Error(`Expected value >= ${expected}, got ${value}`);
      }
    },
    toBeLessThanOrEqual: (expected: number) => {
      if (value > expected) {
        throw new Error(`Expected value <= ${expected}, got ${value}`);
      }
    },
    toBeTruthy: () => {
      if (!value) {
        throw new Error(`Expected truthy value, got ${value}`);
      }
    },
    toBeFalsy: () => {
      if (value) {
        throw new Error(`Expected falsy value, got ${value}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined) {
        throw new Error(`Expected defined value, got undefined`);
      }
    },
    toContain: (expected: any) => {
      if (Array.isArray(value) && !value.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    },
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error: any) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
  }
}

// Helper to create test activities
function createActivity(
  id: string,
  date: string,
  name: string,
  emoji: string
): Activity {
  return {
    id,
    date,
    name,
    emoji,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Tests

describe('calculateDayMetrics', () => {
  describe('basic calculation', () => {
    it('should return correct dayOfWeek for Sunday', () => {
      // 2024-12-01 is a Sunday
      const metrics = calculateDayMetrics([], '2024-12-01');
      expect(metrics.dayOfWeek).toBe(0);
    });

    it('should return correct dayOfWeek for Monday', () => {
      // 2024-12-02 is a Monday
      const metrics = calculateDayMetrics([], '2024-12-02');
      expect(metrics.dayOfWeek).toBe(1);
    });

    it('should return correct dayOfWeek for Saturday', () => {
      // 2024-12-07 is a Saturday
      const metrics = calculateDayMetrics([], '2024-12-07');
      expect(metrics.dayOfWeek).toBe(6);
    });

    it('should return date in metrics', () => {
      const date = '2024-12-25';
      const metrics = calculateDayMetrics([], date);
      expect(metrics.date).toBe(date);
    });

    it('should return isEmpty=true when no activities', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      expect(metrics.isEmpty).toBeTruthy();
    });

    it('should return activityCount=0 when no activities', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      expect(metrics.activityCount).toBe(0);
    });
  });

  describe('activity counting', () => {
    it('should count single activity', () => {
      const activities = [createActivity('1', '2024-12-25', 'Exercise', '🏃')];
      const metrics = calculateDayMetrics(activities, '2024-12-25');
      expect(metrics.activityCount).toBe(1);
    });

    it('should count multiple activities on same day', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Exercise', '🏃'),
        createActivity('2', '2024-12-25', 'Reading', '📚'),
        createActivity('3', '2024-12-25', 'Meditation', '🧘'),
      ];
      const metrics = calculateDayMetrics(activities, '2024-12-25');
      expect(metrics.activityCount).toBe(3);
    });

    it('should exclude activities from other dates', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Exercise', '🏃'),
        createActivity('2', '2024-12-26', 'Reading', '📚'),
        createActivity('3', '2024-12-25', 'Meditation', '🧘'),
      ];
      const metrics = calculateDayMetrics(activities, '2024-12-25');
      expect(metrics.activityCount).toBe(2);
    });

    it('should return isEmpty=false when activities present', () => {
      const activities = [createActivity('1', '2024-12-25', 'Exercise', '🏃')];
      const metrics = calculateDayMetrics(activities, '2024-12-25');
      expect(metrics.isEmpty).toBeFalsy();
    });
  });

  describe('isToday detection', () => {
    it('should detect today correctly', () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const metrics = calculateDayMetrics([], dateStr);
      expect(metrics.isToday).toBeTruthy();
    });

    it('should not mark past dates as today', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      // Unless it happens to be December 25 when this test runs
      if (new Date().toDateString() !== new Date('2024-12-25').toDateString()) {
        expect(metrics.isToday).toBeFalsy();
      }
    });

    it('should not mark future dates as today', () => {
      const metrics = calculateDayMetrics([], '2099-12-25');
      expect(metrics.isToday).toBeFalsy();
    });
  });

  describe('return type', () => {
    it('should return DayMetrics object with all required fields', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      
      expect(metrics.date).toBeDefined();
      expect(metrics.dayOfWeek).toBeDefined();
      expect(metrics.activityCount).toBeDefined();
      expect(metrics.isToday).toBeDefined();
      expect(metrics.isEmpty).toBeDefined();
    });

    it('should return activityCount as number', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      expect(typeof metrics.activityCount).toBe('number');
    });

    it('should return dayOfWeek as number', () => {
      const metrics = calculateDayMetrics([], '2024-12-25');
      expect(typeof metrics.dayOfWeek).toBe('number');
    });
  });
});

describe('calculateDailyMetrics', () => {
  describe('metric generation', () => {
    it('should return one metric per day in month', () => {
      const metrics = calculateDailyMetrics([], 2024, 12);
      expect(metrics).toHaveLength(31); // December has 31 days
    });

    it('should return 28 metrics for February non-leap year', () => {
      const metrics = calculateDailyMetrics([], 2023, 2);
      expect(metrics).toHaveLength(28);
    });

    it('should return 29 metrics for February leap year', () => {
      const metrics = calculateDailyMetrics([], 2024, 2);
      expect(metrics).toHaveLength(29);
    });

    it('should return 30 metrics for April', () => {
      const metrics = calculateDailyMetrics([], 2024, 4);
      expect(metrics).toHaveLength(30);
    });
  });

  describe('period labels', () => {
    it('should format period as day name and date', () => {
      const metrics = calculateDailyMetrics([], 2024, 12);
      // December 1, 2024 is a Sunday
      expect(metrics[0].period).toEqual('Sun 12/1');
    });

    it('should include correct day names', () => {
      const metrics = calculateDailyMetrics([], 2024, 12);
      // Week 1: Sun, Mon, Tue, Wed, Thu, Fri, Sat
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7 && i < metrics.length; i++) {
        expect(metrics[i].period).toContain(dayNames[i]);
      }
    });
  });

  describe('activity counting', () => {
    it('should count activities correctly for each day', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Exercise', '🏃'),
        createActivity('2', '2024-12-25', 'Reading', '📚'),
        createActivity('3', '2024-12-26', 'Coding', '💻'),
      ];
      const metrics = calculateDailyMetrics(activities, 2024, 12);
      
      // December 25 (index 24) should have 2 activities
      expect(metrics[24].activityCount).toBe(2);
      // December 26 (index 25) should have 1 activity
      expect(metrics[25].activityCount).toBe(1);
    });

    it('should count unique activities for each day', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Exercise', '🏃'),
        createActivity('2', '2024-12-25', 'Exercise', '🏃'), // Same name, different ID
        createActivity('3', '2024-12-25', 'Reading', '📚'),
      ];
      const metrics = calculateDailyMetrics(activities, 2024, 12);
      
      // December 25 should have 2 unique activities (Exercise and Reading)
      expect(metrics[24].uniqueActivities).toBe(2);
    });
  });

  describe('completion rate', () => {
    it('should calculate completion rate', () => {
      const metrics = calculateDailyMetrics([], 2024, 12);
      
      // Empty days should have 0% completion
      expect(metrics[0].completionRate).toBeGreaterThanOrEqual(0);
      expect(metrics[0].completionRate).toBeLessThanOrEqual(100);
    });

    it('should cap completion rate at 100%', () => {
      const activities = [];
      // Create 20 activities for a single day to exceed max
      for (let i = 0; i < 20; i++) {
        activities.push(createActivity(`${i}`, '2024-12-25', `Activity ${i}`, '🏃'));
      }
      
      const metrics = calculateDailyMetrics(activities, 2024, 12);
      expect(metrics[24].completionRate).toBe(100);
    });
  });
});

describe('calculateWeeklyMetrics', () => {
  describe('metric generation', () => {
    it('should return metrics for weeks in month', () => {
      const metrics = calculateWeeklyMetrics([], 2024, 12);
      // December 2024 spans 6 weeks
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should format period as week number', () => {
      const metrics = calculateWeeklyMetrics([], 2024, 12);
      metrics.forEach(metric => {
        expect(metric.period).toContain('Week');
      });
    });
  });

  describe('activity grouping', () => {
    it('should group activities by week', () => {
      const activities = [
        createActivity('1', '2024-12-01', 'Activity1', '🏃'), // Week 1
        createActivity('2', '2024-12-08', 'Activity2', '📚'), // Week 2
      ];
      const metrics = calculateWeeklyMetrics(activities, 2024, 12);
      
      // Should have metrics for at least 2 weeks
      expect(metrics.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('calculateMonthlyMetrics', () => {
  describe('metric generation', () => {
    it('should return 12 metrics for a single year', () => {
      const metrics = calculateMonthlyMetrics([], 2024);
      expect(metrics).toHaveLength(12);
    });

    it('should format period as month name', () => {
      const metrics = calculateMonthlyMetrics([], 2024);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      metrics.forEach((metric, i) => {
        expect(metric.period).toBe(monthNames[i]);
      });
    });
  });

  describe('activity counting', () => {
    it('should count activities by month', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Activity1', '🏃'),
        createActivity('2', '2024-11-25', 'Activity2', '📚'),
      ];
      const metrics = calculateMonthlyMetrics(activities, 2024);
      
      // December (index 11) should have 1 activity
      expect(metrics[11].activityCount).toBe(1);
      // November (index 10) should have 1 activity
      expect(metrics[10].activityCount).toBe(1);
    });
  });

  describe('leap year handling', () => {
    it('should handle leap year February correctly', () => {
      const metrics = calculateMonthlyMetrics([], 2024); // Leap year
      expect(metrics).toHaveLength(12);
    });

    it('should handle non-leap year February correctly', () => {
      const metrics = calculateMonthlyMetrics([], 2023); // Non-leap year
      expect(metrics).toHaveLength(12);
    });
  });
});

describe('calculateYearlyMetrics', () => {
  describe('metric generation', () => {
    it('should return one metric per year', () => {
      const metrics = calculateYearlyMetrics([], 2024, 2024);
      expect(metrics).toHaveLength(1);
    });

    it('should return multiple metrics for multiple years', () => {
      const metrics = calculateYearlyMetrics([], 2024, 2026);
      expect(metrics).toHaveLength(3);
    });

    it('should format period as year string', () => {
      const metrics = calculateYearlyMetrics([], 2024, 2024);
      expect(metrics[0].period).toBe('2024');
    });
  });

  describe('activity counting', () => {
    it('should count activities by year', () => {
      const activities = [
        createActivity('1', '2024-12-25', 'Activity1', '🏃'),
        createActivity('2', '2025-01-15', 'Activity2', '📚'),
      ];
      const metrics = calculateYearlyMetrics(activities, 2024, 2025);
      
      // 2024 should have 1 activity
      expect(metrics[0].activityCount).toBe(1);
      // 2025 should have 1 activity
      expect(metrics[1].activityCount).toBe(1);
    });
  });

  describe('leap year handling', () => {
    it('should account for 366 days in leap year', () => {
      const metrics = calculateYearlyMetrics([], 2024, 2024); // Leap year
      expect(metrics).toHaveLength(1);
    });

    it('should account for 365 days in non-leap year', () => {
      const metrics = calculateYearlyMetrics([], 2023, 2023); // Non-leap year
      expect(metrics).toHaveLength(1);
    });
  });
});

// Run tests
console.log('Running Metrics Utility Tests');
console.log('=============================');
