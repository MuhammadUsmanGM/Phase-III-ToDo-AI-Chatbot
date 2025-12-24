'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface TaskStatisticsProps {
  tasks: Task[];
}

export default function TaskStatistics({ tasks }: TaskStatisticsProps) {
  // Prepare data for charts
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.filter(task => !task.completed).length;
  
  // Priority distribution
  const priorityCounts = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };
  
  // Calculate completion rate percentage
  const completionRate = tasks.length > 0 
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Data for completion pie chart
  const completionData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        label: 'Task Completion',
        data: [completedCount, pendingCount],
        backgroundColor: [
          'rgba(72, 187, 120, 0.7)', // green for completed
          'rgba(109, 40, 217, 0.7)', // purple for pending
        ],
        borderColor: [
          'rgba(72, 187, 120, 1)',
          'rgba(109, 40, 217, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for priority bar chart
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)', // red for high priority
          'rgba(245, 158, 11, 0.7)', // amber for medium priority
          'rgba(16, 185, 129, 0.7)', // emerald for low priority
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Task Statistics',
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Completion Status Chart */}
      <Card className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Task Completion</CardTitle>
        </CardHeader>
        <CardContent className="!p-4">
          <div className="flex flex-col items-center">
            <div className="w-full h-48">
              <Pie data={completionData} options={{...chartOptions, maintainAspectRatio: false}} />
            </div>
            <div className="mt-2 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {completionRate}%
              </p>
              <p className="text-xs text-gray-600">
                of tasks completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution Chart */}
      <Card className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="!p-4">
          <div className="w-full h-48">
            <Bar
              data={priorityData}
              options={{
                ...chartOptions,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0, // Show whole numbers only
                      maxTicksLimit: 5 // Limit number of tick marks to save space
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}