/**
 * MonthSelector Component
 * 
 * Provides dropdown selectors for:
 * - Month (January-December)
 * - Year (current year to +5 years)
 */

import React from 'react';
import { useActivities } from '../context/ActivityContext';
import './MonthSelector.css';

const MonthSelector: React.FC = () => {
  const { selectedMonth, selectedYear, setMonth, setYear } = useActivities();

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="month-selector">
      <select
        value={selectedMonth}
        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
        className="month-dropdown"
      >
        {months.map((month, index) => (
          <option key={month} value={index + 1}>
            {month}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setYear(parseInt(e.target.value, 10))}
        className="year-dropdown"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
