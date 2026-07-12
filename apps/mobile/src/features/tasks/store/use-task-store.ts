import { create } from 'zustand';
import { TaskModel } from '../models/task.model';

interface TaskState {
  selectedTaskId: string | null;
  setSelectedTask: (task: TaskModel | null) => void;
}

export const useTaskStore = create<TaskState>(set => ({
  selectedTaskId: null,
  setSelectedTask: task => set({ selectedTaskId: task?.id ?? null }),
}));
