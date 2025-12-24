import { useState, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus, DueDateRange } from '@/types/task';

interface FilterOptions {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string | 'all';
  dueDateRange: DueDateRange;
  searchTerm: string;
}

interface UseTaskFilteringResult {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  filteredAndSortedTasks: Task[];
  sortTasks: (sortBy: 'date' | 'priority' | 'title' | 'due_date') => void;
  currentSort: 'date' | 'priority' | 'title' | 'due_date';
}

export const useTaskFiltering = (tasks: Task[]): UseTaskFilteringResult => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    category: 'all',
    dueDateRange: 'all',
    searchTerm: ''
  });

  const [currentSort, setCurrentSort] = useState<'date' | 'priority' | 'title' | 'due_date'>('date');

  const sortTasks = (sortBy: 'date' | 'priority' | 'title' | 'due_date') => {
    setCurrentSort(sortBy);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply status filter
    if (filterOptions.status !== 'all') {
      if (filterOptions.status === 'active') {
        result = result.filter(task => !task.completed);
      } else if (filterOptions.status === 'completed') {
        result = result.filter(task => task.completed);
      }
    }

    // Apply priority filter
    if (filterOptions.priority !== 'all') {
      result = result.filter(task => task.priority === filterOptions.priority);
    }

    // Apply category filter
    if (filterOptions.category !== 'all') {
      result = result.filter(task => task.category === filterOptions.category);
    }

    // Apply due date range filter
    if (filterOptions.dueDateRange !== 'all') {
      const now = new Date();
      result = result.filter(task => {
        if (!task.due_date) return false; // Tasks without due dates don't fall into date ranges
        const dueDate = new Date(task.due_date);

        switch (filterOptions.dueDateRange) {
          case 'overdue':
            return dueDate && dueDate < now && !task.completed;
          case 'thisWeek':
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            return dueDate && dueDate >= now && dueDate <= oneWeekFromNow;
          case 'thisMonth':
            const oneMonthFromNow = new Date(now);
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            return dueDate && dueDate >= now && dueDate <= oneMonthFromNow;
          default:
            return true;
        }
      });
    }

    // Apply search term filter
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(term) || 
        (task.description && task.description.toLowerCase().includes(term)) ||
        (task.category && task.category.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (currentSort) {
        case 'priority':
          const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          const dateA = new Date(a.due_date!);
          const dateB = new Date(b.due_date!);
          return dateA.getTime() - dateB.getTime();
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [tasks, filterOptions, currentSort]);

  return {
    filterOptions,
    setFilterOptions,
    filteredAndSortedTasks,
    sortTasks,
    currentSort
  };
};