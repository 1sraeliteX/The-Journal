/**
 * DayActivitiesModal Component
 * 
 * Modal to view all activities for a day with options to:
 * - See complete list of all activities
 * - Copy all activities to another date
 * - Edit individual activities
 * - Delete individual activities
 */

import React, { useState } from 'react';
import { useActivities } from '../context/ActivityContext';
import { getActivitiesForDay, copyActivitiesToDate } from '../utils/activities';
import type { Activity } from '../types';
import './DayActivitiesModal.css';

interface DayActivitiesModalProps {
  isOpen: boolean;
  date: string;
  onClose: () => void;
}

const DayActivitiesModal: React.FC<DayActivitiesModalProps> = ({
  isOpen,
  date,
  onClose,
}) => {
  const { activities, addActivity, deleteActivity, openEditModal } = useActivities();
  const [copyTargetDate, setCopyTargetDate] = useState('');
  const [showCopyForm, setShowCopyForm] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const dayActivities = getActivitiesForDay(activities, date);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleCopyActivities = () => {
    if (!copyTargetDate) {
      setCopyMessage('Please select a date');
      return;
    }

    if (copyTargetDate === date) {
      setCopyMessage('Please select a different date');
      return;
    }

    const newActivities = copyActivitiesToDate(activities, date, copyTargetDate);
    newActivities.forEach(activity => addActivity(activity));

    setCopyMessage(`✓ Copied ${newActivities.length} activities to ${formatDate(copyTargetDate)}`);
    setCopyTargetDate('');
    
    setTimeout(() => {
      setShowCopyForm(false);
      setCopyMessage('');
    }, 2000);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Delete this activity?')) {
      deleteActivity(activityId);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    onClose();
    openEditModal(date, activity.id);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal dialog */}
      <div className="day-activities-modal" role="dialog">
        <div className="modal-header">
          <h2>Activities for {formatDate(date)}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {dayActivities.length === 0 ? (
            <div className="empty-state">
              <p>No activities for this day</p>
            </div>
          ) : (
            <div className="activities-container">
              {dayActivities.map((activity) => (
                <div key={activity.id} className="activity-row">
                  <div className="activity-info">
                    <span className="activity-emoji">{activity.emoji}</span>
                    <div className="activity-details">
                      <span className="activity-name">{activity.name}</span>
                      {activity.completed && (
                        <span className="completed-badge">✓ Completed</span>
                      )}
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditActivity(activity)}
                      title="Edit activity"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteActivity(activity.id)}
                      title="Delete activity"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dayActivities.length > 0 && (
            <div className="copy-section">
              {!showCopyForm ? (
                <button
                  className="btn-copy-all"
                  onClick={() => setShowCopyForm(true)}
                >
                  📋 Copy all to another date
                </button>
              ) : (
                <div className="copy-form">
                  <label htmlFor="copy-date">Select target date:</label>
                  <input
                    id="copy-date"
                    type="date"
                    value={copyTargetDate}
                    onChange={(e) => setCopyTargetDate(e.target.value)}
                  />
                  <div className="copy-actions">
                    <button
                      className="btn-copy"
                      onClick={handleCopyActivities}
                    >
                      Copy
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setShowCopyForm(false);
                        setCopyTargetDate('');
                        setCopyMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {copyMessage && (
                    <div className={`copy-message ${copyMessage.includes('✓') ? 'success' : 'error'}`}>
                      {copyMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DayActivitiesModal;
