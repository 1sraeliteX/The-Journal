/**
 * CalendarSection Component
 * 
 * Container for:
 * - MonthSelector for date navigation
 * - CalendarGrid for calendar display
 */

import React from 'react';
import { useActivities } from '../context/ActivityContext';
import MonthSelector from './MonthSelector';
import CalendarGrid from './CalendarGrid';
import './CalendarSection.css';

const CalendarSection: React.FC = () => {
  const { selectedMonth, selectedYear } = useActivities();

  return (
    <div className="calendar-section">
      <MonthSelector />
      <CalendarGrid key={`${selectedYear}-${selectedMonth}`} />
    </div>
  );
};

export default CalendarSection;
