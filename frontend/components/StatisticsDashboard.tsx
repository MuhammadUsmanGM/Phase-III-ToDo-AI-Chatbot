'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import TaskStatistics from './TaskStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  PieChart
} from 'lucide-react';

interface StatisticsDashboardProps {
  tasks: Task[];
}

export default function StatisticsDashboard({ tasks }: StatisticsDashboardProps) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    tasksThisWeek: 0,
    tasksThisMonth: 0,
  });

  useEffect(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate overdue tasks
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

    // Calculate tasks created in the last week/month
    const tasksThisWeek = tasks.filter(task => 
      new Date(task.created_at) >= oneWeekAgo
    ).length;

    const tasksThisMonth = tasks.filter(task => 
      new Date(task.created_at) >= oneMonthAgo
    ).length;

    // Calculate average completion time
    let totalCompletionDays = 0;
    let completedCount = 0;
    tasks.forEach(task => {
      if (task.completed && task.updated_at) {
        const creationDate = new Date(task.created_at);
        const completionDate = new Date(task.updated_at);
        const diffMs = completionDate.getTime() - creationDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        totalCompletionDays += diffDays;
        completedCount++;
      }
    });
    const avgCompletionTime = completedCount > 0 ? totalCompletionDays / completedCount : 0;

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      avgCompletionTime,
      tasksThisWeek,
      tasksThisMonth,
    });
  }, [tasks]);

  // Prepare data for productivity trend visualization
  const productivityTrend = [
    { day: 'Mon', completed: 2, total: 5 },
    { day: 'Tue', completed: 4, total: 5 },
    { day: 'Wed', completed: 1, total: 3 },
    { day: 'Thu', completed: 5, total: 6 },
    { day: 'Fri', completed: 3, total: 4 },
    { day: 'Sat', completed: 2, total: 2 },
    { day: 'Sun', completed: 1, total: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Main chart visualization */}
      <TaskStatistics tasks={tasks} />
    </div>
  );
}