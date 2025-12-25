"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { tasksApi } from "@/lib/api";
import TaskList from "@/components/TaskList";
import DraggableTaskList from "@/components/DraggableTaskList";
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import { Task, TaskStatus } from '@/types/task';
import TaskStatistics from '@/components/TaskStatistics';
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAddTaskCard, setShowAddTaskCard] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<string>("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { userId, userEmail, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    filterOptions,
    setFilterOptions,
    filteredAndSortedTasks,
    sortTasks,
    currentSort
  } = useTaskFiltering(tasks);

  // Ensure the button functionality works even if there are auth issues
  const isUserReady = isAuthenticated && userId && token;

  // Update task order after drag and drop
  const handleTaskReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function fetchTasks() {
      if (isAuthenticated && userId && token) {
        setLoadingTasks(true);
        setError(null);
        try {
          const fetchedTasks = await tasksApi.getTasks(userId, token);
          setTasks(fetchedTasks);
        } catch (err: any) {
          setError(err.message || "Failed to fetch tasks. You can still create tasks, but some data might not be loaded.");
          // If 403 or 401, token might be invalid, force logout
          if (err.message.includes("401") || err.message.includes("403")) {
            logout();
          } else {
            // For other errors (like database errors), don't force logout
            console.error("Tasks fetch error:", err);
          }
        } finally {
          setLoadingTasks(false);
        }
      }
    }
    fetchTasks();
  }, [isAuthenticated, userId, token, logout]);

  const handleCreateTask = async (title: string, description: string) => {
    if (!userId || !token) return;
    try {
      const newTask = await tasksApi.createTask(userId, token, { title, description });
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (err: any) {
      setError(err.message || "Failed to create task.");
    }
  };

  const handleCreateNewTask = async () => {
    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }
    if (!userId || !token) {
      setError("You must be logged in to create tasks");
      return;
    }

    try {
      setLoadingTasks(true);
      setError(null); // Clear any previous errors

      const taskData: any = {
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,  // Send null if no date is set
        category: newTaskCategory || null  // Send null if no category is selected
      };

      const newTask = await tasksApi.createTask(userId, token, taskData);
      setTasks((prevTasks) => [...prevTasks, newTask]);

      // Reset form and hide card
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      setShowAddTaskCard(false);
    } catch (err: any) {
      setError(err.message || "Failed to create task. Please try again later.");
      console.error("Task creation error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Function to handle the add task button click with proper authentication check
  const handleAddTaskClick = () => {
    console.log("Add Task button clicked");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("userId:", userId);
    console.log("token exists:", !!token);
    console.log("Current showAddTaskCard:", showAddTaskCard);

    // Check if user is properly authenticated
    if (!isAuthenticated || !userId || !token) {
      setError("You must be logged in to add tasks. Please log in.");
      // Optionally redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // If authenticated, show the task creation card
    setShowAddTaskCard(true);
    // Clear any previous errors when opening the form
    setError(null);
    console.log("Set showAddTaskCard to true");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  // Helper function to safely create a Date object from a potentially null due_date
  const safeDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-8">  {/* Increased top padding to account for fixed navbar */}
        {/* Dashboard-specific content section with Export button */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your tasks and productivity</p>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Welcome back, {userEmail || 'User'}!</p>
                <p className="text-xs text-gray-500">Manage your daily tasks efficiently</p>
              </div>

              <button
                onClick={() => {
                  // Export tasks functionality
                  const dataStr = JSON.stringify(filteredAndSortedTasks, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                  const exportFileDefaultName = `todoapp-tasks-${new Date().toISOString().slice(0, 10)}.json`;

                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Tasks
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white to-indigo-25 rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Your Tasks</h2>
                  <div className="flex flex-wrap gap-6 mt-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                      <span className="text-indigo-600 font-medium">
                        {tasks.filter(t => !t.completed).length} pending
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-green-600 font-medium">
                        {tasks.filter(t => t.completed).length} completed
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium">
                        Total: {tasks.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={filterOptions.searchTerm}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full px-5 py-3 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                      aria-label="Search tasks"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterOptions(prev => ({ ...prev, status: "all" }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                        filterOptions.status === "all"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg"
                      }`}
                      aria-pressed={filterOptions.status === "all"}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterOptions(prev => ({ ...prev, status: "active" }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                        filterOptions.status === "active"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg"
                      }`}
                      aria-pressed={filterOptions.status === "active"}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterOptions(prev => ({ ...prev, status: "completed" }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                        filterOptions.status === "completed"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg"
                      }`}
                      aria-pressed={filterOptions.status === "completed"}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filterOptions.priority}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'all' }))}
                      className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date Range</label>
                    <select
                      value={filterOptions.dueDateRange}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, dueDateRange: e.target.value as 'all' | 'overdue' | 'thisWeek' | 'thisMonth' }))}
                      className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="all">All Dates</option>
                      <option value="overdue">Overdue</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={currentSort}
                      onChange={(e) => sortTasks(e.target.value as 'date' | 'priority' | 'title' | 'due_date')}
                      className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="date">Date Added</option>
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                      <option value="due_date">Due Date</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 mr-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-gray-800">{tasks.filter(t => t.completed).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 mr-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-amber-700 font-medium">Pending</p>
                      <p className="text-2xl font-bold text-gray-800">{tasks.filter(t => !t.completed).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mr-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Productivity</p>
                      <p className="text-2xl font-bold text-gray-800">{tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productivity Overview */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
                  <span className="text-sm font-bold text-indigo-600">{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-sm">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-md"
                    style={{
                      width: tasks.length > 0 ? `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` : '0%',
                      minWidth: '2%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick Task Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-2xl border border-red-200/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-red-500/10 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-red-700/80 font-medium">Top Priority Tasks</p>
                      <p className="text-xl font-bold text-gray-800">
                        {tasks.filter(t => t.priority === 'high').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform cursor-default group">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-3-3.464-3S7.267 2.667 6.5 4L3.732 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-amber-700/80 font-medium">Overdue Tasks</p>
                      <p className="text-xl font-bold text-gray-800">
                        {tasks.filter(t => {
                        const dueDate = safeDate(t.due_date);
                        return dueDate && dueDate < new Date() && !t.completed;
                      }).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-800 rounded-2xl flex items-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {loadingTasks ? (
              <div className="py-20">
                <div className="flex justify-center mb-8">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-ping opacity-20"></div>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-2xl h-20 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!showAddTaskCard && filteredAndSortedTasks.length === 0 && (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 mb-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-3.134-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM34 56c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm37 11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-7 30c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%2391a0ef\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-20"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    {filterOptions.searchTerm ? (
                      <>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">No matching tasks</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">No tasks match "{filterOptions.searchTerm}". Try different keywords.</p>
                      </>
                    ) : filterOptions.status !== "all" ? (
                      <>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">No {filterOptions.status} tasks</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">You have no {filterOptions.status} tasks. Create one now!</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">No tasks yet</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">Get started by adding your first task and boost your productivity!</p>
                      </>
                    )}
                    <button
                      onClick={handleAddTaskClick}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Your First Task
                      </span>
                    </button>
                  </div>
                )}
                {!showAddTaskCard && filteredAndSortedTasks.length > 0 && (
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={handleAddTaskClick}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center transform hover:scale-105 hover:-translate-y-1 cursor-pointer border border-indigo-500/30 hover:border-indigo-500/50 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Task
                    </button>
                  </div>
                )}
                {showAddTaskCard && (
                  <div className="bg-white/95 backdrop-blur-sm bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100/50 transform transition-all duration-300 animate-fadeIn z-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create New Task
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddTaskCard(false);
                          setNewTaskTitle("");
                          setNewTaskDescription("");
                          setNewTaskPriority("medium");
                          setNewTaskDueDate("");
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Close form"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Task title *"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-full px-4 py-3 text-base bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all shadow-sm"
                          disabled={loadingTasks}
                          autoFocus
                        />
                        {newTaskTitle && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                      </div>

                      <div className="relative">
                        <textarea
                          placeholder="Description (optional)"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all shadow-sm resize-none"
                          rows={2}
                          disabled={loadingTasks}
                        />
                        {newTaskDescription && (
                          <div className="absolute right-3 top-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-500 transition-all appearance-none text-sm"
                            disabled={loadingTasks}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-500 transition-all text-sm"
                            disabled={loadingTasks}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={newTaskCategory}
                            onChange={(e) => setNewTaskCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-500 transition-all appearance-none text-sm"
                            disabled={loadingTasks}
                          >
                            <option value="">None</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Health">Health</option>
                            <option value="Shopping">Shopping</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowAddTaskCard(false);
                          setNewTaskTitle("");
                          setNewTaskDescription("");
                          setNewTaskPriority("medium");
                          setNewTaskDueDate("");
                          setNewTaskCategory("");
                        }}
                        className="px-4 py-2 text-sm text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-medium shadow-sm"
                        disabled={loadingTasks}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateNewTask}
                        disabled={loadingTasks || !newTaskTitle.trim()}
                        className={`px-4 py-2 text-sm text-white rounded-lg transition-all duration-300 shadow-md flex items-center ${
                          loadingTasks || !newTaskTitle.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                      >
                        {loadingTasks ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Task
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {!showAddTaskCard && filteredAndSortedTasks.length > 0 && (
                  <div className="space-y-4">
                    <DraggableTaskList
                      tasks={filteredAndSortedTasks}
                      onTaskUpdate={handleUpdateTask}
                      onTaskDelete={handleDeleteTask}
                      onTaskReorder={handleTaskReorder}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 border border-gray-100/50">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h3>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task, index) => (
                    <div key={task.id} className={`p-4 rounded-lg border-l-4 ${
                      task.completed
                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{task.description || 'No description'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.completed
                            ? 'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200'
                            : task.due_date && (() => {
                              const dueDate = safeDate(task.due_date);
                              return dueDate && dueDate < new Date() && !task.completed;
                            })()
                              ? 'bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200'
                              : 'bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {safeDate(task.due_date)?.toLocaleDateString() || 'No due date'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity yet. Add your first task!</p>
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 border border-gray-100/50">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming Tasks
              </h3>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks
                    .filter(task => {
                      const dueDate = safeDate(task.due_date);
                      return !task.completed && dueDate && dueDate.getTime() > new Date().getTime();
                    })
                    .sort((a, b) => {
                      const dateA = safeDate(a.due_date);
                      const dateB = safeDate(b.due_date);
                      if (!dateA || !dateB) return 0;
                      return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 3)
                    .map((task, index) => (
                    <div key={task.id} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{task.description || 'No description'}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {safeDate(task.due_date)?.toLocaleDateString() || 'No due date'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(task => !task.completed && task.due_date).length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No upcoming tasks scheduled</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming tasks yet. Add your first task!</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Statistics Visualization */}
          <div className="mt-12">
            <TaskStatistics tasks={tasks} />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-700">&copy; {new Date().getFullYear()} TodoApp. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 transform hover:scale-110 hover:-translate-y-1" onClick={(e) => { e.preventDefault(); setShowAbout(true); }}>
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 transform hover:scale-110 hover:-translate-y-1" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>
                Privacy
              </a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 transform hover:scale-110 hover:-translate-y-1" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                Terms
              </a>
            </div>
            <div className="flex space-x-6 text-gray-500">
              <a href="https://github.com/MuhammadUsmanGM" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/muhammad-usman-ai-dev" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="mailto:mu.ai.dev@gmail.com" className="hover:text-indigo-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Stunning Modals */}
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 min-h-screen overflow-hidden">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200/50 relative transform transition-all duration-300 scale-95 animate-fadeIn hide-scrollbar">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">About TodoApp</h3>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-500 hover:text-indigo-600 text-2xl w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-100 transition-all duration-300 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
              <div className="text-gray-700 space-y-5">
                <p className="leading-relaxed">
                  <span className="font-bold text-indigo-600">TodoApp</span> is a powerful task management application designed to help you organize your life and boost productivity.
                  Our mission is to simplify task management with an intuitive and user-friendly interface.
                </p>
                <p className="leading-relaxed">
                  Whether you're managing personal tasks, work projects, or team collaborations, TodoApp provides the tools you need
                  to stay organized and on track. Our platform is built with the latest technology to ensure a seamless experience
                  across all devices.
                </p>
                <p className="leading-relaxed">
                  We believe in helping people achieve their goals one task at a time, and our platform is designed with that
                  philosophy at its core. Join thousands of users who have transformed their productivity with TodoApp.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Secure & Reliable</h4>
                      <p className="text-sm text-gray-600">Your data is protected with industry-standard security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 min-h-screen overflow-hidden">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200/50 relative transform transition-all duration-300 scale-95 animate-fadeIn hide-scrollbar">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-gray-500 hover:text-indigo-600 text-2xl w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-100 transition-all duration-300 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
              <div className="text-gray-700 space-y-5">
                <p className="leading-relaxed">
                  At <span className="font-bold text-indigo-600">TodoApp</span>, we are committed to protecting your privacy and personal information.
                  This Privacy Policy outlines how we collect, use, and protect your data when you use our services.
                </p>

                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Information We Collect
                    </h4>
                    <p className="mt-2">
                      We only collect the information necessary for you to use our services, including your email address
                      and any tasks or personal information you choose to store in your TodoApp account.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      How We Use Your Information
                    </h4>
                    <p className="mt-2">
                      Your information is used solely to provide and improve our services, including personalizing your
                      task management experience and communicating with you about your account.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Data Security
                    </h4>
                    <p className="mt-2">
                      We implement appropriate security measures to protect your personal information against
                      unauthorized access, alteration, disclosure, or destruction.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" />
                      </svg>
                      Third-Party Services
                    </h4>
                    <p className="mt-2">
                      We do not share your personal information with third parties except as required by law
                      or to provide our services (e.g., cloud hosting providers).
                    </p>
                  </div>
                </div>

                <p className="mt-6 pt-4 border-t border-gray-200">
                  For any questions about this Privacy Policy, please contact us through our Contact page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 min-h-screen overflow-hidden">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200/50 relative transform transition-all duration-300 scale-95 animate-fadeIn hide-scrollbar">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Terms of Service</h3>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-500 hover:text-indigo-600 text-2xl w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-100 transition-all duration-300 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
              <div className="text-gray-700 space-y-5">
                <p className="leading-relaxed">
                  Welcome to <span className="font-bold text-indigo-600">TodoApp</span>. These Terms of Service govern your use of our platform and
                  constitute an agreement between you and TodoApp.
                </p>

                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Acceptance of Terms
                    </h4>
                    <p className="mt-2">
                      By creating an account and using TodoApp, you agree to be bound by these Terms and
                      all applicable laws and regulations.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      User Responsibilities
                    </h4>
                    <p className="mt-2">
                      You are responsible for maintaining the security of your account and for any
                      activities that occur under your account.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Registration
                    </h4>
                    <p className="mt-2">
                      You must provide accurate and complete information when registering for TodoApp.
                      You are responsible for keeping your account information up-to-date.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Acceptable Use
                    </h4>
                    <p className="mt-2">
                      You agree not to use TodoApp for any unlawful purposes or in any way that
                      could damage or impair our services.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Data and Content
                    </h4>
                    <p className="mt-2">
                      You retain ownership of any content you store in your TodoApp account.
                      By using our services, you grant us a limited license to access and use your
                      content solely to provide the TodoApp services.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Limitation of Liability
                    </h4>
                    <p className="mt-2">
                      TodoApp shall not be liable for any indirect, incidental, or consequential
                      damages arising from your use of our services.
                    </p>
                  </div>
                </div>

                <p className="mt-6 pt-4 border-t border-gray-200">
                  We reserve the right to modify these terms at any time. Continued use of
                  TodoApp after such modifications constitutes your acceptance of the updated terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
