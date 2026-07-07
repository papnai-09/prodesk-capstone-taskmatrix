import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  user_id: string;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  storageMode: 'supabase' | 'local';
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>, userId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>, userId: string) => Promise<void>;
  deleteTask: (taskId: string, userId: string) => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'taskmatrix_tasks';

const getLocalTasks = (userId: string): Task[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
  if (data) {
    try {
      return JSON.parse(data) as Task[];
    } catch {
      return [];
    }
  }

  const defaultTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Scaffold Next.js & Tailwind setup',
      description: 'Set up initial directory structure, layout template, and design tokens.',
      status: 'completed',
      priority: 'high',
      due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Implement Next.js middleware and auth guards',
      description: 'Secure dashboard routes and handle redirect flows based on session tokens.',
      status: 'completed',
      priority: 'high',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Design system mapping & globals integration',
      description: 'Map Tailwind v4 configuration and implement global theme properties.',
      status: 'completed',
      priority: 'medium',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Implement CRUD state mutation actions',
      description: 'Build Zustand actions for task creation, update, and confirmation deletion.',
      status: 'in_progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Integrate dynamic analytical visualizations',
      description: 'Write JavaScript mapping functions and mount Chart.js for metric aggregation.',
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Verify responsiveness and cross-browser layouts',
      description: 'Confirm the dashboard layout adapts properly to tablet and mobile screens.',
      status: 'todo',
      priority: 'low',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user_id: userId,
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(defaultTasks));
  return defaultTasks;
};

const saveLocalTasks = (userId: string, tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(tasks));
};

const dbHelper = {
  async getTasks(userId: string): Promise<{ data: Task[]; mode: 'supabase' | 'local' }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return { data: data as Task[], mode: 'supabase' };
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return { data: getLocalTasks(userId), mode: 'local' };
  },

  async createTask(task: Task): Promise<'supabase' | 'local'> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('tasks').insert([task]);
        if (!error) return 'supabase';
      } catch (err) {
        console.warn(err);
      }
    }
    const tasks = getLocalTasks(task.user_id);
    saveLocalTasks(task.user_id, [task, ...tasks]);
    return 'local';
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<'supabase' | 'local'> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', taskId);
        if (!error) return 'supabase';
      } catch (err) {
        console.warn(err);
      }
    }
    const tasks = getLocalTasks(userId);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    saveLocalTasks(userId, updated);
    return 'local';
  },

  async deleteTask(userId: string, taskId: string): Promise<'supabase' | 'local'> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        if (!error) return 'supabase';
      } catch (err) {
        console.warn(err);
      }
    }
    const tasks = getLocalTasks(userId);
    const filtered = tasks.filter((t) => t.id !== taskId);
    saveLocalTasks(userId, filtered);
    return 'local';
  }
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  storageMode: 'local',

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    const { data, mode } = await dbHelper.getTasks(userId);
    set({ tasks: data, storageMode: mode, loading: false });
  },

  addTask: async (taskData, userId) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    const mode = await dbHelper.createTask(newTask);
    set((state) => ({
      tasks: [newTask, ...state.tasks],
      storageMode: mode,
    }));
  },

  updateTask: async (taskId, updates, userId) => {
    const mode = await dbHelper.updateTask(userId, taskId, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      storageMode: mode,
    }));
  },

  deleteTask: async (taskId, userId) => {
    const mode = await dbHelper.deleteTask(userId, taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      storageMode: mode,
    }));
  },
}));
