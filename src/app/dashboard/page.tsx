'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'chart.js/auto';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore, Task } from '@/store/taskStore';
import {
  LogOut,
  LayoutDashboard,
  KanbanSquare,
  Users,
  Settings,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Database,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuthStore();
  const {
    tasks,
    loading: tasksLoading,
    storageMode,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask
  } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'team' | 'settings'>('dashboard');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const handleCreateTask = async (data: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    setActionLoading(true);
    await addTask(data, user.uid);
    setActionLoading(false);
  };

  const handleUpdateTask = async (data: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!selectedTask) return;
    setActionLoading(true);
    await updateTask(selectedTask.id, data, user.uid);
    setActionLoading(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    await deleteTask(selectedTask.id, user.uid);
    setActionLoading(false);
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todoList = tasks.filter((t) => t.status === 'todo');
  const inProgressList = tasks.filter((t) => t.status === 'in_progress');
  const completedList = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 z-10">
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">TaskMatrix</span>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-200 ${
                    activeTab === tab.id
                      ? 'bg-violet-600/10 text-violet-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-red-950/20 hover:border-red-900/50 hover:text-red-400 text-slate-300 font-medium transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 relative">
        <header className="h-16 border-b border-slate-850 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-white capitalize">
              {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'kanban' ? 'Sprint Kanban Board' : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              storageMode === 'supabase'
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-400'
            }`}>
              <Database className="h-3.5 w-3.5" />
              <span>Storage: {storageMode === 'supabase' ? 'Supabase' : 'Local Storage Fallback'}</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Env: {isConfigured ? 'Production' : 'Mock Local'}
            </span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto animate-in fade-in duration-350">
          {!isConfigured && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-900/35 text-amber-300">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Running with Mock Authentication</h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Supabase connection keys are absent. Account operations are simulated locally.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Tracked Tasks', val: totalTasks, icon: FolderKanban, color: 'text-violet-400', bg: 'bg-violet-600/10', isRate: false },
                  { label: 'Completed Sprints', val: completedTasks, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-600/10', isRate: false },
                  { label: 'Active In Progress', val: inProgressTasks, icon: Clock, color: 'text-violet-400', bg: 'bg-violet-600/10', isRate: false },
                  { label: 'Task Completion Rate', val: `${completionRate}%`, icon: FolderKanban, color: 'text-indigo-400', bg: '', isRate: true },
                ].map((card, i) => {
                  const IconComponent = card.icon;
                  return (
                    <div key={i} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between hover:border-slate-800 transition duration-200">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                        <p className={`text-2xl font-bold text-white ${card.color}`}>{card.val}</p>
                      </div>
                      {card.isRate ? (
                        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center font-bold text-indigo-400 text-sm">
                          {card.val}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {tasksLoading ? (
                <div className="h-48 bg-slate-900/30 border border-slate-850 rounded-2xl flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : (
                <TaskCharts tasks={tasks} />
              )}

              <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Recent Work Activity</h3>
                    <p className="text-xs text-slate-400 mt-1">Overview of latest sprint tasks in your timeline</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition duration-200"
                  >
                    View Board &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-850">
                  {tasksLoading ? (
                    <div className="py-8 text-center text-slate-500 text-sm">Loading activity logs...</div>
                  ) : tasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      No tasks found. Get started by adding a task in the Kanban Board tab!
                    </div>
                  ) : (
                    tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-800 rounded-md">
                              {task.id.slice(0, 8)}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white mt-1.5">{task.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {task.due_date}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            task.status === 'completed'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                              : task.status === 'in_progress'
                              ? 'bg-violet-950/40 text-violet-400 border border-violet-900/40'
                              : 'bg-slate-850 text-slate-400'
                          }`}>
                            {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 p-4 border border-slate-850 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white text-md">Sprint Workspace</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop simulated. Open actions menu to change status, edit, or delete items.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setDefaultStatus('todo');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition duration-200 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              {tasksLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {[
                    { id: 'todo', label: 'To Do', border: 'bg-slate-400', list: todoList },
                    { id: 'in_progress', label: 'In Progress', border: 'bg-violet-500', list: inProgressList },
                    { id: 'completed', label: 'Completed', border: 'bg-emerald-500', list: completedList },
                  ].map((col) => (
                    <div key={col.id} className="bg-slate-900/20 border border-slate-850 rounded-2xl p-4 flex flex-col min-h-[500px]">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.border}`}></span>
                          <h4 className="font-bold text-sm text-slate-200">{col.label}</h4>
                          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                            {col.list.length}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTask(null);
                            setDefaultStatus(col.id as any);
                            setIsCreateOpen(true);
                          }}
                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3 flex-1">
                        {col.list.length === 0 ? (
                          <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 text-center px-4">
                            No tasks
                          </div>
                        ) : (
                          col.list.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={(t) => {
                                setSelectedTask(t);
                                setIsEditOpen(true);
                              }}
                              onDelete={(t) => {
                                setSelectedTask(t);
                                setIsDeleteOpen(true);
                              }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Sprint Team Members</h3>
                <p className="text-sm text-slate-400 mt-1">Assignees and stakeholders configured for the project workspace</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Gaurav Papnai', role: 'Lead Developer (You)', email: user.email, initials: 'GP' },
                  { name: 'Sarah Jenkins', role: 'Product Owner', email: 'sarah.j@taskmatrix.io', initials: 'SJ' },
                  { name: 'Marcus Chen', role: 'QA Automation Lead', email: 'marcus.c@taskmatrix.io', initials: 'MC' }
                ].map((member, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white">Workspace Preferences</h3>
                <p className="text-sm text-slate-400 mt-1">Configure workspace integrations, cloud synchronization, and defaults</p>
              </div>
              
              <div className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Synchronization Engine</label>
                  <select 
                    className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-200 text-sm focus:outline-none"
                    defaultValue={storageMode}
                    disabled
                  >
                    <option value="supabase">Supabase BaaS Cloud (Detected)</option>
                    <option value="local">Local Storage Fallback DB (Active)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Automatically switched depending on database configuration availability.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-semibold text-slate-300">Workspace Tenant ID</label>
                  <input
                    type="text"
                    className="block w-full rounded-xl border border-slate-850 bg-slate-950/60 py-2.5 px-3 text-slate-400 font-mono text-xs focus:outline-none"
                    value={user.uid}
                    readOnly
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About TaskMatrix</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    TaskMatrix is an enterprise sprint backlog tool. It utilizes Zustand state management and matches database entries strictly to the user payloads, securing and routing workspace assets effectively.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        defaultStatus={defaultStatus}
      />

      <TaskModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        task={selectedTask}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
        title="Destroy Backlog Item?"
        message={`You are about to permanently delete the sprint task: "${selectedTask?.title}". This action is destructive and cannot be undone.`}
        loading={actionLoading}
      />

    </div>
  );
}

interface TaskChartsProps {
  tasks: Task[];
}

function TaskCharts({ tasks }: TaskChartsProps) {
  const statusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const priorityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const statusChartRef = useRef<Chart | null>(null);
  const priorityChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!statusCanvasRef.current || !priorityCanvasRef.current) return;

    if (statusChartRef.current) {
      statusChartRef.current.destroy();
      statusChartRef.current = null;
    }
    if (priorityChartRef.current) {
      priorityChartRef.current.destroy();
      priorityChartRef.current = null;
    }

    const statusCounts = tasks.reduce(
      (acc, task) => {
        const s = task.status || 'todo';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { todo: 0, in_progress: 0, completed: 0 } as Record<string, number>
    );

    const priorityCounts = tasks.reduce(
      (acc, task) => {
        const p = task.priority || 'low';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<string, number>
    );

    statusChartRef.current = new Chart(statusCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Completed'],
        datasets: [
          {
            data: [statusCounts.todo, statusCounts.in_progress, statusCounts.completed],
            backgroundColor: [
              'rgba(148, 163, 184, 0.25)',
              'rgba(124, 58, 237, 0.75)',
              'rgba(16, 185, 129, 0.75)',
            ],
            borderColor: [
              'rgba(148, 163, 184, 0.5)',
              'rgba(124, 58, 237, 1)',
              'rgba(16, 185, 129, 1)',
            ],
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: 'var(--font-geist-sans)' },
            },
          },
        },
      },
    });

    priorityChartRef.current = new Chart(priorityCanvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
          {
            label: 'Task Count',
            data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
            backgroundColor: [
              'rgba(59, 130, 246, 0.65)',
              'rgba(245, 158, 11, 0.65)',
              'rgba(239, 68, 68, 0.65)',
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 1.5,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: '#94a3b8',
              stepSize: 1,
            },
          },
        },
      },
    });

    return () => {
      if (statusChartRef.current) {
        statusChartRef.current.destroy();
        statusChartRef.current = null;
      }
      if (priorityChartRef.current) {
        priorityChartRef.current.destroy();
        priorityChartRef.current = null;
      }
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between h-[340px]">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white tracking-wide">Tasks by Status</h4>
          <p className="text-xs text-slate-400">Current progress metrics</p>
        </div>
        <div className="relative flex-1 h-[200px]">
          <canvas ref={statusCanvasRef} />
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between h-[340px]">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white tracking-wide">Tasks by Priority</h4>
          <p className="text-xs text-slate-400">Urgency classification breakdown</p>
        </div>
        <div className="relative flex-1 h-[200px]">
          <canvas ref={priorityCanvasRef} />
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl hover:border-slate-700 hover:shadow-lg transition duration-200 group flex flex-col justify-between min-h-[130px]">
      <div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
            task.priority === 'high'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : task.priority === 'medium'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {task.priority} Priority
          </span>
          <span className="text-[10px] font-mono text-slate-500 select-all">
            #{task.id.slice(0, 8)}
          </span>
        </div>
        <h5 className="font-bold text-sm text-slate-100 mt-2 line-clamp-1">{task.title}</h5>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-850/50 mt-4 shrink-0 font-medium">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          {task.due_date}
        </span>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-150">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string;
  }) => Promise<void>;
  task?: Task | null;
  defaultStatus?: 'todo' | 'in_progress' | 'completed';
}

function TaskModal({ isOpen, onClose, onSubmit, task, defaultStatus }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.due_date);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus || 'todo');
        setPriority('medium');
        setDueDate(new Date().toISOString().split('T')[0]);
      }
      setError(null);
    }
  }, [task, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (err) {
      setError('Failed to process task operations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">{task ? 'Modify Sprint Task' : 'Create Sprint Task'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/40 p-3 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Task Title</label>
            <input
              type="text"
              placeholder="Describe the action item"
              className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-100 text-sm focus:border-violet-500 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Description</label>
            <textarea
              placeholder="Provide sub-tasks, instructions or notes..."
              className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-100 text-sm focus:border-violet-500 focus:outline-none min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Status</label>
              <select
                className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-100 text-sm focus:border-violet-500 focus:outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Priority</label>
              <select
                className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-100 text-sm focus:border-violet-500 focus:outline-none"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Due Date</label>
            <input
              type="date"
              className="block w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-slate-100 text-sm focus:border-violet-500 focus:outline-none"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
              disabled={loading}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  loading?: boolean;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-800/30 text-red-500 flex items-center justify-center mx-auto mb-4 font-bold shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <h3 className="text-center font-bold text-white text-lg">{title}</h3>
          <p className="text-center text-xs text-slate-400 leading-relaxed">{message}</p>

          <div className="pt-4 border-t border-slate-850 flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
              disabled={loading}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
