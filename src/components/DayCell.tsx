/**
 * DayCell Component
 * 
 * Renders a single day in the calendar with:
 * - Day number
 * - Up to 5 activities with emoji, name, and checkbox to mark as completed
 * - "Show More" button if overflow
 * - "Add Activity" button
 * - "Copy Activities" button (if activities exist on this day)
 */

import React, { useState } from 'react';
import { useActivities } from '../context/ActivityContext';
import { getActivitiesForDay, copyActivitiesToDate } from '../utils/activities';
import type { Activity } from '../types';
import './DayCell.css';

interface DayCellProps {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  displayedActivities: Activity[];
  overflow: number;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  dayOfMonth,
  isCurrentMonth,
  displayedActivities,
  overflow,
}) => {
  const { openCreateModal, openEditModal, updateActivity, activities, addActivity } = useActivities();
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleAddActivity = () => {
    openCreateModal(date);
  };

  const handleActivityClick = (activity: Activity) => {
    openEditModal(date, activity.id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, activity: Activity) => {
    e.stopPropagation();
    updateActivity({
      ...activity,
      completed: e.target.checked,
      updatedAt: Date.now(),
    });
  };

  const handleCopyActivities = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const dayActivities = getActivitiesForDay(activities, date);
    
    if (dayActivities.length === 0) {
      alert('No activities to copy from this day');
      return;
    }

    // Copy to today
    const newActivities = copyActivitiesToDate(activities, date, todayDate);
    newActivities.forEach(activity => addActivity(activity));
    
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const dayActivities = getActivitiesForDay(activities, date);
  const canCopy = dayActivities.length > 0;

  return (
    <div
      className={`day-cell ${isCurrentMonth ? 'current-month' : 'padding-month'}`}
    >
      <div className="day-number">{dayOfMonth}</div>

      <div className="activities-list">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item ${activity.completed ? 'completed' : ''}`}
            onClick={() => handleActivityClick(activity)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleActivityClick(activity);
              }
            }}
          >
            <input
              type="checkbox"
              className="activity-checkbox"
              checked={activity.completed || false}
              onChange={(e) => handleCheckboxChange(e, activity)}
              onClick={(e) => e.stopPropagation()}
              title="Mark activity as completed"
            />
            <span className="activity-emoji">{activity.emoji}</span>
            <span className="activity-name">{activity.name}</span>
          </div>
        ))}
      </div>

      {overflow > 0 && (
        <div className="overflow-indicator">
          +{overflow} more
        </div>
      )}

      <div className="day-cell-buttons">
        {canCopy && (
          <button
            className="copy-activities-btn"
            onClick={handleCopyActivities}
            title="Copy all activities from this day to today"
          >
            📋
          </button>
        )}
        <button
          className="add-activity-btn"
          onClick={handleAddActivity}
          title="Add activity for this day"
        >
          +
        </button>
      </div>

      {showCopyToast && (
        <div className="copy-toast">
          ✓ Copied to today
        </div>
      )}
    </div>
  );
};

export default DayCell;
