'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import TaskStatistics from './TaskStatistics';

// Define the stats interface to hold our calculated statistics
interface Stats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in days
  tasksPerDay: { date: string; count: number }[];
  priorityDistribution: { priority: string; count: number }[];
  overdueTasks: number;
}

export default function DetailedStatistics({ tasks }: { tasks: Task[] }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    // Calculate statistics based on tasks
    if (!tasks) return;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate average completion time (simplified calculation)
    let totalTime = 0;
    let completedCount = 0;
    
    tasks.forEach(task => {
      if (task.completed && task.updated_at && task.created_at) {
        const createdAt = new Date(task.created_at);
        const updatedAt = new Date(task.updated_at);
        const diffDays = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        totalTime += diffDays;
        completedCount++;
      }
    });
    
    const averageCompletionTime = completedCount > 0 ? totalTime / completedCount : 0;

    // Calculate tasks per day (last 7 days)
    const tasksPerDayMap: { [date: string]: number } = {};
    const endDate = new Date();
    const startDate = new Date();
    
    // Set date range depending on selection
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    tasks.forEach(task => {
      const taskDate = new Date(task.created_at);
      if (taskDate >= startDate && taskDate <= endDate) {
        const dateStr = taskDate.toISOString().split('T')[0];
        tasksPerDayMap[dateStr] = (tasksPerDayMap[dateStr] || 0) + 1;
      }
    });

    // Convert to array format for charting
    const tasksPerDay = Object.entries(tasksPerDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Priority distribution
    const priorityCounts: { [key: string]: number } = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });
    
    const priorityDistribution = Object.entries(priorityCounts)
      .map(([priority, count]) => ({ priority, count }));

    // Count overdue tasks
    const today = new Date();
    const overdueTasks = tasks.filter(task =>
      task.due_date &&
      !task.completed &&
      (() => {
        try {
          const dueDate = new Date(task.due_date);
          return dueDate < today;
        } catch {
          return false;
        }
      })()
    ).length;

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      averageCompletionTime,
      tasksPerDay,
      priorityDistribution,
      overdueTasks
    });
  }, [tasks, timeRange]);

  if (!stats) return <div>Loading statistics...</div>;

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Task Statistics
        </h2>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'week'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'month'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-4 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Warning */}
      {stats.overdueTasks > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-200">You have {stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}</h3>
            <p className="text-sm text-red-600 dark:text-red-300">Consider updating these tasks to stay on track.</p>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <TaskStatistics tasks={tasks} />
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Productivity Insight</h3>
          {stats.averageCompletionTime > 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              On average, you complete tasks in <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.averageCompletionTime.toFixed(1)} days</span>.
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Complete some tasks to see your average completion time.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Priority Breakdown</h3>
          <div className="space-y-2">
            {stats.priorityDistribution.map(({ priority, count }) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="capitalize text-gray-600 dark:text-gray-300">{priority} priority:</span>
                <span className="font-bold text-gray-800 dark:text-white">{count} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}