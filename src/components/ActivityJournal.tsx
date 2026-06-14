/**
 * ActivityJournal Root Component
 * 
 * Main container coordinating:
 * - ThemeToggle for dark/light mode switching
 * - CalendarSection for calendar display
 * - AnalyticsSection for metrics visualization
 * - ActivityModal for activity management
 */

import React from 'react';
import { useActivities } from '../context/ActivityContext';
import CalendarSection from './CalendarSection';
import AnalyticsSection from './AnalyticsSection';
import ActivityModal from './ActivityModal';
import ThemeToggle from './ThemeToggle';
import './ActivityJournal.css';

const ActivityJournal: React.FC = () => {
  const { modalState } = useActivities();

  return (
    <div className="activity-journal">
      <header className="activity-journal-header">
        <h1>Activity Journal</h1>
        <ThemeToggle />
      </header>

      <main className="activity-journal-main">
        <div className="journal-content">
          <section className="calendar-container">
            <CalendarSection />
          </section>

          <section className="analytics-container">
            <AnalyticsSection />
          </section>
        </div>
      </main>

      {modalState.isOpen && <ActivityModal />}
    </div>
  );
};

export default ActivityJournal;
