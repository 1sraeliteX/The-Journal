/**
 * AnalyticsSection Component
 * 
 * Container for:
 * - View mode selector (daily, weekly, monthly, yearly)
 * - LineChart displaying metrics
 */

import React, { useState } from 'react';
import LineChart from './LineChart';
import './AnalyticsSection.css';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AnalyticsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2>Activity Analytics</h2>

        <div className="view-mode-selector">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <LineChart viewMode={viewMode} />
      </div>
    </div>
  );
};

export default AnalyticsSection;
