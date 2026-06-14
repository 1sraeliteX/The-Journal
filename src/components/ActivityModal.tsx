/**
 * ActivityModal Component
 * 
 * Modal dialog for creating and editing activities with:
 * - Activity name input with validation
 * - Emoji picker
 * - Save/Cancel/Delete buttons
 * - Form validation and error display
 */

import React, { useState, useEffect } from 'react';
import { useActivities } from '../context/ActivityContext';
import { createActivity, updateActivity } from '../services/activities';
import { findActivityById } from '../utils/activities';
import './ActivityModal.css';

const EMOJI_OPTIONS = [
  '🏃', '🧘', '💪', '🚴', '🏊', '⛹️', '🤸', '🧗',
  '📚', '🎵', '🎨', '✍️', '🎮', '🧩', '📺', '🎬',
  '🍎', '🥗', '🚶', '😴', '💼', '🧑‍💻', '📞', '🎓',
  '💰', '🛒', '🧹', '🍳', '🚗', '✈️', '🏡', '🎁',
];

const ActivityModal: React.FC = () => {
  const {
    activities,
    modalState,
    closeModal,
    addActivity,
    updateActivity: updateActivityInContext,
    deleteActivity,
  } = useActivities();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load activity data if in edit mode
  useEffect(() => {
    if (modalState.mode === 'edit' && modalState.activityId) {
      const activity = findActivityById(activities, modalState.activityId);
      if (activity) {
        setName(activity.name);
        setEmoji(activity.emoji);
      }
    } else {
      setName('');
      setEmoji('🎯');
    }
    setErrors({});
  }, [modalState, activities]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Activity name cannot be empty';
    } else if (trimmedName.length < 1) {
      newErrors.name = 'Activity name must be at least 1 character';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Activity name cannot exceed 100 characters';
    }

    // Validate emoji
    if (!emoji || emoji.length === 0) {
      newErrors.emoji = 'Please select an emoji';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      if (modalState.mode === 'create') {
        const newActivity = createActivity(
          name.trim(),
          emoji,
          modalState.date
        );
        addActivity(newActivity);
      } else if (modalState.mode === 'edit' && modalState.activityId) {
        const existingActivity = findActivityById(activities, modalState.activityId);
        if (existingActivity) {
          const updated = updateActivity(existingActivity, {
            name: name.trim(),
            emoji,
          });
          updateActivityInContext(updated);
        }
      }

      closeModal();
    } catch (error) {
      console.error('Failed to save activity:', error);
      setErrors({ general: 'Failed to save activity. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (modalState.mode === 'edit' && modalState.activityId) {
      if (confirm('Are you sure you want to delete this activity?')) {
        deleteActivity(modalState.activityId);
        closeModal();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const isFormValid = name.trim().length > 0 && emoji;

  return (
    <>
      {/* Modal backdrop */}
      <div className="modal-backdrop" onClick={closeModal} />

      {/* Modal dialog */}
      <div className="activity-modal" onKeyDown={handleKeyDown} role="dialog">
        <div className="modal-header">
          <h2>
            {modalState.mode === 'create' ? 'New Activity' : 'Edit Activity'}
          </h2>
          <button
            className="modal-close"
            onClick={closeModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <strong>Date:</strong> {modalState.date}
          </div>

          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          {/* Activity name input */}
          <div className="form-group">
            <label htmlFor="activity-name">Activity Name</label>
            <input
              id="activity-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter activity name (1-100 characters)"
              className={errors.name ? 'input-error' : ''}
              maxLength={100}
            />
            {errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
            <span className="char-count">
              {name.length}/100
            </span>
          </div>

          {/* Emoji picker */}
          <div className="form-group">
            <label htmlFor="emoji-picker">Select Emoji</label>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`emoji-option ${emoji === opt ? 'selected' : ''}`}
                  onClick={() => setEmoji(opt)}
                  title={opt}
                >
                  {opt}
                </button>
              ))}
            </div>
            {emoji && (
              <div className="selected-emoji">
                <span>Selected:</span>
                <span className="emoji-display">{emoji}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={closeModal}
            disabled={isSaving}
          >
            Cancel
          </button>

          {modalState.mode === 'edit' && (
            <button
              className="btn-danger"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Delete
            </button>
          )}

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivityModal;
