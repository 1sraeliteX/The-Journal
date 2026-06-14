/**
 * Activity Context and Provider
 * Manages global state for activities, calendar selection, and modal state
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Activity } from '../types';
import { SmartStorageAdapter } from '../services/storage';

/**
 * Modal state interface
 */
export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  date: string;
  activityId?: string;
}

/**
 * Activity context type
 */
export interface ActivityContextType {
  // State
  activities: Activity[];
  selectedMonth: number;
  selectedYear: number;
  modalState: ModalState;

  // Actions
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  setActivities: (activities: Activity[]) => void;

  // Calendar navigation
  setMonth: (month: number) => void;
  setYear: (year: number) => void;

  // Modal management
  openCreateModal: (date: string) => void;
  openEditModal: (date: string, activityId: string) => void;
  closeModal: () => void;
}

/**
 * Action types for the reducer
 */
type ActionType =
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_MONTH'; payload: number }
  | { type: 'SET_YEAR'; payload: number }
  | { type: 'OPEN_CREATE_MODAL'; payload: string }
  | { type: 'OPEN_EDIT_MODAL'; payload: { date: string; activityId: string } }
  | { type: 'CLOSE_MODAL' };

/**
 * Initial state
 */
const initialState: {
  activities: Activity[];
  selectedMonth: number;
  selectedYear: number;
  modalState: ModalState;
} = {
  activities: [],
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  modalState: {
    isOpen: false,
    mode: 'create',
    date: new Date().toISOString().split('T')[0],
  },
};

/**
 * Reducer function for activity state management
 */
function activityReducer(
  state: typeof initialState,
  action: ActionType
): typeof initialState {
  switch (action.type) {
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
      };

    case 'ADD_ACTIVITY': {
      // Ensure no duplicate IDs
      const filtered = state.activities.filter((a) => a.id !== action.payload.id);
      return {
        ...state,
        activities: [...filtered, action.payload],
      };
    }

    case 'UPDATE_ACTIVITY': {
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id ? action.payload : activity
        ),
      };
    }

    case 'DELETE_ACTIVITY': {
      return {
        ...state,
        activities: state.activities.filter((activity) => activity.id !== action.payload),
      };
    }

    case 'SET_MONTH':
      return {
        ...state,
        selectedMonth: action.payload,
      };

    case 'SET_YEAR':
      return {
        ...state,
        selectedYear: action.payload,
      };

    case 'OPEN_CREATE_MODAL':
      return {
        ...state,
        modalState: {
          isOpen: true,
          mode: 'create',
          date: action.payload,
        },
      };

    case 'OPEN_EDIT_MODAL':
      return {
        ...state,
        modalState: {
          isOpen: true,
          mode: 'edit',
          date: action.payload.date,
          activityId: action.payload.activityId,
        },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modalState: {
          isOpen: false,
          mode: 'create',
          date: new Date().toISOString().split('T')[0],
        },
      };

    default:
      return state;
  }
}

/**
 * Activity context
 */
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

/**
 * Activity provider component
 */
export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);
  const storageAdapter = React.useRef(new SmartStorageAdapter());

  // Load activities from storage on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await storageAdapter.current.read();
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
      } catch (error) {
        console.error('Failed to load activities from storage:', error);
      }
    };

    loadActivities();
  }, []);

  // Persist activities whenever they change
  useEffect(() => {
    const saveActivities = async () => {
      try {
        await storageAdapter.current.write(state.activities);
      } catch (error) {
        console.error('Failed to save activities to storage:', error);
      }
    };

    // Debounce saves to avoid excessive writes
    const timer = setTimeout(saveActivities, 300);
    return () => clearTimeout(timer);
  }, [state.activities]);

  const value: ActivityContextType = {
    // State
    activities: state.activities,
    selectedMonth: state.selectedMonth,
    selectedYear: state.selectedYear,
    modalState: state.modalState,

    // Actions
    addActivity: useCallback((activity: Activity) => {
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    }, []),

    updateActivity: useCallback((activity: Activity) => {
      dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
    }, []),

    deleteActivity: useCallback((id: string) => {
      dispatch({ type: 'DELETE_ACTIVITY', payload: id });
    }, []),

    setActivities: useCallback((activities: Activity[]) => {
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    }, []),

    // Calendar navigation
    setMonth: useCallback((month: number) => {
      dispatch({ type: 'SET_MONTH', payload: month });
    }, []),

    setYear: useCallback((year: number) => {
      dispatch({ type: 'SET_YEAR', payload: year });
    }, []),

    // Modal management
    openCreateModal: useCallback((date: string) => {
      dispatch({ type: 'OPEN_CREATE_MODAL', payload: date });
    }, []),

    openEditModal: useCallback((date: string, activityId: string) => {
      dispatch({
        type: 'OPEN_EDIT_MODAL',
        payload: { date, activityId },
      });
    }, []),

    closeModal: useCallback(() => {
      dispatch({ type: 'CLOSE_MODAL' });
    }, []),
  };

  return (
    <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
  );
};

/**
 * Hook to use the activity context
 * 
 * Throws an error if used outside of ActivityProvider
 * 
 * @returns The activity context value
 */
export const useActivities = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};
