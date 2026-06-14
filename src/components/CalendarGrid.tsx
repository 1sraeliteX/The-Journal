/**
 * CalendarGrid Component
 * 
 * Renders a 6x7 calendar grid with:
 * - Day headers (Sun-Sat)
 * - DayCell components for each day
 * - Filtering of activities per day
 */

import React from 'react';
import { useActivities } from '../context/ActivityContext';
import { generateCalendarGrid } from '../utils/calendar';
import { getActivitiesForDate } from '../utils/activities';
import DayCell from './DayCell';
import './CalendarGrid.css';

const CalendarGrid: React.FC = () => {
  const { activities, selectedMonth, selectedYear } = useActivities();

  // Generate calendar grid for the selected month
  const calendarDays = generateCalendarGrid(selectedYear, selectedMonth);

  // Day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      {/* Day headers */}
      <div className="calendar-headers">
        {dayHeaders.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="calendar-cells">
        {calendarDays.map((day) => {
          const dayActivities = getActivitiesForDate(activities, day.date);
          const isCurrentMonth = day.isCurrentMonth;

          return (
            <DayCell
              key={day.date}
              date={day.date}
              dayOfMonth={day.dayOfMonth}
              isCurrentMonth={isCurrentMonth}
              displayedActivities={dayActivities.displayed}
              overflow={dayActivities.overflow}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
