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

interface CalendarSectionProps {
  openDayModal: (date: string) => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ openDayModal }) => {
  const { selectedMonth, selectedYear } = useActivities();

  return (
    <div className="calendar-section">
      <MonthSelector />
      <CalendarGrid key={`${selectedYear}-${selectedMonth}`} openDayModal={openDayModal} />
    </div>
  );
};

export default CalendarSection;
