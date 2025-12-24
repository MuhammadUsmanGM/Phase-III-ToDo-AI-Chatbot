export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  owner_id: number;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null; // ISO date string or null
  category?: string;
}

export interface NewTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  category?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  category?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'all' | 'active' | 'completed';
export type DueDateRange = 'all' | 'overdue' | 'thisWeek' | 'thisMonth';