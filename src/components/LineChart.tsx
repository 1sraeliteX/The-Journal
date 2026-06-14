/**
 * LineChart Component
 * 
 * Displays activity metrics using Recharts library
 * Supports daily, weekly, monthly, and yearly views
 */

import React, { useMemo } from 'react';
import { useActivities } from '../context/ActivityContext';
import {
  calculateDailyMetrics,
  calculateWeeklyMetrics,
  calculateMonthlyMetrics,
  calculateYearlyMetrics,
} from '../utils/metrics';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './LineChart.css';

interface LineChartProps {
  viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const LineChart: React.FC<LineChartProps> = ({ viewMode }) => {
  const { activities, selectedYear, selectedMonth } = useActivities();

  // Calculate metrics based on view mode
  const chartData = useMemo(() => {
    switch (viewMode) {
      case 'daily':
        return calculateDailyMetrics(activities, selectedYear, selectedMonth);
      case 'weekly':
        return calculateWeeklyMetrics(activities, selectedYear, selectedMonth);
      case 'monthly':
        return calculateMonthlyMetrics(activities, selectedYear);
      case 'yearly':
        return calculateYearlyMetrics(activities, selectedYear - 5, selectedYear + 5);
      default:
        return [];
    }
  }, [activities, selectedYear, selectedMonth, viewMode]);

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No activities recorded for this period</p>
      </div>
    );
  }

  return (
    <div className="line-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            angle={viewMode === 'daily' ? -45 : 0}
            textAnchor={viewMode === 'daily' ? 'end' : 'middle'}
            height={viewMode === 'daily' ? 80 : 40}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="activityCount"
            stroke="#8884d8"
            dot={false}
            name="Activity Count"
          />
          <Line
            type="monotone"
            dataKey="uniqueActivities"
            stroke="#82ca9d"
            dot={false}
            name="Unique Activities"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
