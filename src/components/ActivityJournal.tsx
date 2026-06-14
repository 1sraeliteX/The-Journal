/**
 * ActivityJournal Root Component
 * 
 * Main container coordinating:
 * - ThemeToggle for dark/light mode switching
 * - CalendarSection for calendar display
 * - AnalyticsSection for metrics visualization
 * - ActivityModal for activity management
 * - DayActivitiesModal for viewing/managing all activities in a day
 */

import React, { useState } from 'react';
import { useActivities } from '../context/ActivityContext';
import CalendarSection from './CalendarSection';
import AnalyticsSection from './AnalyticsSection';
import ActivityModal from './ActivityModal';
import ThemeToggle from './ThemeToggle';
import DayActivitiesModal from './DayActivitiesModal';
import './ActivityJournal.css';

const ActivityJournal: React.FC = () => {
  const { modalState } = useActivities();
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const openDayActivitiesModal = (date: string) => {
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  const closeDayActivitiesModal = () => {
    setDayModalOpen(false);
    setSelectedDate('');
  };

  return (
    <div className="activity-journal">
      <header className="activity-journal-header">
        <h1>Activity Journal</h1>
        <ThemeToggle />
      </header>

      <main className="activity-journal-main">
        <div className="journal-content">
          <section className="calendar-container">
            <CalendarSection openDayModal={openDayActivitiesModal} />
          </section>

          <section className="analytics-container">
            <AnalyticsSection />
          </section>
        </div>
      </main>

      {modalState.isOpen && <ActivityModal />}
      <DayActivitiesModal
        isOpen={dayModalOpen}
        date={selectedDate}
        onClose={closeDayActivitiesModal}
      />
    </div>
  );
};

export default ActivityJournal;
