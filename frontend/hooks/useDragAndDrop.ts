import { useState } from 'react';
import { Task } from '@/types/task';

interface DragAndDropResult {
  draggedTask: Task | null;
  handleDragStart: (task: Task) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (targetTask: Task, tasks: Task[], updateTaskOrder: (tasks: Task[]) => void) => void;
  handleDragEnd: () => void;
}

export const useDragAndDrop = (): DragAndDropResult => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (targetTask: Task, tasks: Task[], updateTaskOrder: (tasks: Task[]) => void) => {
    if (!draggedTask) return;

    // Create a new order of tasks based on the drag and drop
    const newTasks = [...tasks];
    const draggedIndex = newTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = newTasks.findIndex(t => t.id === targetTask.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove the dragged task
      const [dragged] = newTasks.splice(draggedIndex, 1);
      
      // Insert it at the new position
      newTasks.splice(targetIndex, 0, dragged);

      // Update the order in the parent component
      updateTaskOrder(newTasks);
    }

    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return {
    draggedTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};