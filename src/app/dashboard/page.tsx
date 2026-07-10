'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'chart.js/auto';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore, Task } from '@/store/taskStore';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  StatCardSkeletons,
  ChartSkeletons,
  ActivityRowSkeletons,
  KanbanColumnSkeleton,
} from '@/components/SkeletonLoader';
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
  Loader2,
  Menu,
  Wand2,
  ClipboardList,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   Root export — wraps everything in ToastProvider
   ═══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════════════════════ */
function DashboardInner() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuthStore();
  const { tasks, loading: tasksLoading, storageMode, fetchTasks, addTask, updateTask, deleteTask } =
    useTaskStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'team' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [actionLoading, setActionLoading] = useState(false);

  /* ── Auth guard ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  useEffect(() => {
    if (user) fetchTasks(user.uid);
  }, [user, fetchTasks]);

  if (!user) return null;

  /* ── CRUD handlers with toasts ──────────────────────────────────── */
  const handleCreateTask = async (data: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    setActionLoading(true);
    try {
      await addTask(data, user.uid);
      toast('✅ Task created successfully!', 'success');
      setIsCreateOpen(false);
    } catch {
      toast('Failed to create task. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTask = async (data: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      await updateTask(selectedTask.id, data, user.uid);
      toast('✏️ Task updated successfully!', 'success');
      setIsEditOpen(false);
      setSelectedTask(null);
    } catch {
      toast('Failed to update task. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      await deleteTask(selectedTask.id, user.uid);
      toast('🗑️ Task deleted.', 'info');
      setIsDeleteOpen(false);
      setSelectedTask(null);
    } catch {
      toast('Failed to delete task. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  /* ── Computed metrics ───────────────────────────────────────────── */
  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todoList       = tasks.filter(t => t.status === 'todo');
  const inProgressList = tasks.filter(t => t.status === 'in_progress');
  const completedList  = tasks.filter(t => t.status === 'completed');

  /* ── Nav items ──────────────────────────────────────────────────── */
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'kanban',    label: 'Kanban Board', icon: KanbanSquare    },
    { id: 'team',      label: 'Team',         icon: Users           },
    { id: 'settings',  label: 'Settings',     icon: Settings        },
  ] as const;

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  /* ── Sidebar content (shared between desktop + mobile) ─────────── */
  const SidebarContent = () => (
    <>
      <div>
        {/* Logo */}
        <div className="h-20 md:h-24 flex items-center gap-3 px-6 border-b border-purple-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-wide">TaskMatrix</span>
        </div>

        {/* Nav */}
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => handleNavClick(tab.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-violet-50 text-violet-600 shadow-sm border border-violet-100/50'
                    : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="p-4 border-t border-purple-100 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 font-medium transition duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-purple-50 text-slate-900 overflow-hidden font-sans">

      {/* ── Desktop Sidebar (hidden on mobile) ─────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-purple-100 flex-col justify-between shrink-0 z-10 shadow-sm">
        {SidebarContent()}
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Off-canvas panel */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-purple-100 flex flex-col justify-between z-50 md:hidden sidebar-open shadow-xl">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-purple-50 rounded-lg transition"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent()}
          </aside>
        </>
      )}

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-purple-50 relative min-w-0">

        {/* ── Sticky Header ─────────────────────────────────────────── */}
        <header className="h-20 md:h-24 border-b border-purple-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20 gap-3 shadow-sm">
          {/* Hamburger (mobile only) */}
          <button
            id="btn-hamburger"
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-purple-50 rounded-xl transition shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize truncate">
            {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'kanban' ? 'Sprint Kanban Board' : activeTab}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              storageMode === 'supabase'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <Database className="h-3.5 w-3.5" />
              <span>{storageMode === 'supabase' ? 'Supabase' : 'Local Fallback'}</span>
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────────────── */}
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl w-full mx-auto animate-fade-in">

          {/* Mock-auth banner */}
          {!isConfigured && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-amber-950/20 border border-amber-900/35 text-amber-300">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Running with Mock Authentication</h4>
                  <p className="text-xs text-amber-300/80 mt-1">Supabase keys absent — operations are simulated locally.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── DASHBOARD TAB ──────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-8">

              {/* Stat cards */}
              {tasksLoading ? (
                <StatCardSkeletons />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'Total Tracked Tasks',  val: totalTasks,      icon: FolderKanban, color: 'text-violet-600',  bg: 'bg-violet-50'  },
                    { label: 'Completed Sprints',     val: completedTasks,  icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Active In Progress',    val: inProgressTasks, icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50'   },
                    { label: 'Completion Rate',       val: `${completionRate}%`, icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50'  },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="bg-white border border-slate-200 p-5 md:p-6 rounded-2xl flex items-center justify-between hover:border-slate-300 hover:shadow-md transition duration-200 shadow-sm">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs text-slate-500 font-medium truncate">{card.label}</p>
                          <p className={`text-2xl font-bold ${card.color}`}>{card.val}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color} shrink-0 ml-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Charts */}
              {tasksLoading ? <ChartSkeletons /> : <TaskCharts tasks={tasks} />}

              {/* Recent Activity */}
              <div className="bg-white border border-purple-100/80 rounded-2xl p-5 md:p-6 shadow-sm shadow-purple-100/20">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-slate-800">Recent Work Activity</h3>
                    <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Overview of latest sprint tasks in your timeline</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition duration-200 shrink-0 whitespace-nowrap"
                  >
                    View Board →
                  </button>
                </div>

                {tasksLoading ? (
                  <ActivityRowSkeletons />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No activity yet"
                    description="Your sprint board is empty. Create your first task to get started!"
                    actionLabel="Go to Kanban Board"
                    onAction={() => setActiveTab('kanban')}
                  />
                ) : (
                  <div className="divide-y divide-purple-50/50">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="py-3 md:py-4 flex items-start md:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-purple-750 uppercase tracking-wider px-2 py-0.5 bg-purple-50 rounded-md shrink-0">
                              {task.id.slice(0, 8)}
                            </span>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                          <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {task.due_date}
                          </span>
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── KANBAN TAB ─────────────────────────────────────────── */}
          {activeTab === 'kanban' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-purple-100/80 rounded-2xl shadow-sm shadow-purple-100/20">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800">Sprint Workspace</h3>
                  <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Open the actions menu on any card to edit, change status, or delete items.</p>
                </div>
                <button
                  id="btn-create-task"
                  onClick={() => { setSelectedTask(null); setDefaultStatus('todo'); setIsCreateOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition duration-200 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              {tasksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => <KanbanColumnSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
                  {[
                    { id: 'todo',        label: 'To Do',       dot: 'bg-slate-400',   list: todoList       },
                    { id: 'in_progress', label: 'In Progress', dot: 'bg-violet-500',  list: inProgressList },
                    { id: 'completed',   label: 'Completed',   dot: 'bg-emerald-500', list: completedList  },
                  ].map(col => (
                    <div key={col.id} className="bg-purple-50/50 border border-purple-100/80 rounded-2xl p-4 flex flex-col min-h-[400px] md:min-h-[500px] shadow-sm">
                      <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                          <h4 className="font-bold text-sm text-slate-800">{col.label}</h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{col.list.length}</span>
                        </div>
                        <button
                          onClick={() => { setSelectedTask(null); setDefaultStatus(col.id as any); setIsCreateOpen(true); }}
                          className="p-1 hover:bg-purple-100 rounded-lg text-purple-500 hover:text-purple-800 transition"
                          aria-label={`Add task to ${col.label}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3 flex-1">
                        {col.list.length === 0 ? (
                          <KanbanEmptyState
                            label={col.label}
                            onAdd={() => { setSelectedTask(null); setDefaultStatus(col.id as any); setIsCreateOpen(true); }}
                          />
                        ) : (
                          col.list.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={t => { setSelectedTask(t); setIsEditOpen(true); }}
                              onDelete={t => { setSelectedTask(t); setIsDeleteOpen(true); }}
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

          {/* ─── TEAM TAB ───────────────────────────────────────────── */}
          {activeTab === 'team' && (
            <div className="bg-white border border-purple-100 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm shadow-purple-100/20 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Sprint Team Members</h3>
                <p className="text-sm text-slate-500 mt-1">Assignees and stakeholders configured for the project workspace</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { name: 'Gaurav Papnai',  role: 'Lead Developer (You)',  email: user.email,                   initials: 'GP' },
                  { name: 'Sarah Jenkins',  role: 'Product Owner',          email: 'sarah.j@taskmatrix.io',      initials: 'SJ' },
                  { name: 'Marcus Chen',    role: 'QA Automation Lead',     email: 'marcus.c@taskmatrix.io',     initials: 'MC' },
                ].map((member, i) => (
                  <div key={i} className="bg-purple-50/40 border border-purple-100 p-5 rounded-2xl flex items-center gap-4 hover:border-purple-250 transition duration-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-violet-100">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
                      <p className="text-[10px] text-slate-550 font-mono mt-1 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ───────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-purple-100 p-6 md:p-8 rounded-3xl space-y-8 shadow-sm shadow-purple-100/20 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Workspace Preferences</h3>
                <p className="text-sm text-slate-500 mt-1">Configure integrations, synchronization, and defaults</p>
              </div>

              <div className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-650">Synchronization Engine</label>
                  <select
                    className="block w-full rounded-xl border border-purple-100 bg-purple-50/40 py-2.5 px-3 text-slate-800 text-sm focus:outline-none"
                    defaultValue={storageMode}
                    disabled
                  >
                    <option value="supabase">Supabase BaaS Cloud (Detected)</option>
                    <option value="local">Local Storage Fallback DB (Active)</option>
                  </select>
                  <p className="text-[11px] text-slate-550">Automatically switched depending on database configuration.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-650">Workspace Tenant ID</label>
                  <input
                    type="text"
                    className="block w-full rounded-xl border border-purple-100 bg-purple-50/20 py-2.5 px-3 text-slate-600 font-mono text-xs focus:outline-none"
                    value={user.uid}
                    readOnly
                  />
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-650 uppercase tracking-wider">AI Integration</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    TaskMatrix uses Google Gemini (gemini-2.0-flash) to auto-generate task sub-steps.
                    Set <code className="text-violet-650 bg-purple-100/50 px-1 rounded">GEMINI_API_KEY</code> in{' '}
                    <code className="text-violet-650 bg-purple-100/50 px-1 rounded">.env.local</code> to enable this feature.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-650 uppercase tracking-wider">About TaskMatrix</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    TaskMatrix is an enterprise sprint backlog tool. Zustand state management, Supabase cloud persistence, and AI-powered sub-step generation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <TaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateTask}
          defaultStatus={defaultStatus}
          loading={actionLoading}
        />
      )}

      {isEditOpen && (
        <TaskModal
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setSelectedTask(null); }}
          onSubmit={handleUpdateTask}
          task={selectedTask}
          loading={actionLoading}
        />
      )}

      {isDeleteOpen && (
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => { setIsDeleteOpen(false); setSelectedTask(null); }}
          onConfirm={handleDeleteTask}
          title="Destroy Backlog Item?"
          message={`Permanently delete "${selectedTask?.title}"? This cannot be undone.`}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Helper Badge Components
   ═══════════════════════════════════════════════════════════════════════ */
function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const map = {
    high:   'bg-red-500/10 text-red-400 border border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    low:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${map[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: Task['status'] }) {
  const map = {
    completed:   'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
    in_progress: 'bg-violet-950/40  text-violet-400  border border-violet-900/40',
    todo:        'bg-slate-800      text-slate-400',
  };
  const label = { completed: 'Completed', in_progress: 'In Progress', todo: 'To Do' };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap ${map[status]}`}>
      {label[status]}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EmptyState
   ═══════════════════════════════════════════════════════════════════════ */
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-500">
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 px-4 py-2 text-xs font-semibold bg-violet-600/20 text-violet-400 border border-violet-600/30 rounded-xl hover:bg-violet-600/30 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── Kanban column empty state ───────────────────────────────────────── */
function KanbanEmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="h-32 border-2 border-dashed border-slate-800/70 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-violet-800/40 transition cursor-pointer" onClick={onAdd}>
      <Plus className="h-5 w-5 text-slate-600 group-hover:text-violet-500 transition" />
      <p className="text-xs text-slate-600 group-hover:text-slate-400 transition">No {label} tasks — add one</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TaskCharts
   ═══════════════════════════════════════════════════════════════════════ */
interface TaskChartsProps { tasks: Task[] }

function TaskCharts({ tasks }: TaskChartsProps) {
  const statusCanvasRef   = useRef<HTMLCanvasElement | null>(null);
  const priorityCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusChartRef    = useRef<Chart | null>(null);
  const priorityChartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!statusCanvasRef.current || !priorityCanvasRef.current) return;

    statusChartRef.current?.destroy();
    priorityChartRef.current?.destroy();

    const statusCounts = tasks.reduce(
      (acc, t) => { acc[t.status || 'todo']++; return acc; },
      { todo: 0, in_progress: 0, completed: 0 } as Record<string, number>
    );
    const priorityCounts = tasks.reduce(
      (acc, t) => { acc[t.priority || 'low']++; return acc; },
      { low: 0, medium: 0, high: 0 } as Record<string, number>
    );

    statusChartRef.current = new Chart(statusCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Completed'],
        datasets: [{
          data: [statusCounts.todo, statusCounts.in_progress, statusCounts.completed],
          backgroundColor: ['rgba(148,163,184,0.25)', 'rgba(124,58,237,0.75)', 'rgba(16,185,129,0.75)'],
          borderColor:     ['rgba(148,163,184,0.5)',  'rgba(124,58,237,1)',    'rgba(16,185,129,1)'   ],
          borderWidth: 1.5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { family: 'var(--font-geist-sans)' } } } },
      },
    });

    priorityChartRef.current = new Chart(priorityCanvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          label: 'Task Count',
          data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
          backgroundColor: ['rgba(59,130,246,0.65)', 'rgba(245,158,11,0.65)', 'rgba(239,68,68,0.65)'],
          borderColor:     ['rgba(59,130,246,1)',     'rgba(245,158,11,1)',    'rgba(239,68,68,1)'   ],
          borderWidth: 1.5, borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b', stepSize: 1 } },
        },
      },
    });

    return () => {
      statusChartRef.current?.destroy();
      priorityChartRef.current?.destroy();
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {[
        { ref: statusCanvasRef,   title: 'Tasks by Status',   sub: 'Current progress metrics'         },
        { ref: priorityCanvasRef, title: 'Tasks by Priority', sub: 'Urgency classification breakdown' },
      ].map((chart, i) => (
        <div key={i} className="bg-white border border-slate-200 p-5 md:p-6 rounded-2xl flex flex-col h-[300px] md:h-[340px] shadow-sm">
          <div className="mb-3">
            <h4 className="text-sm font-bold text-slate-800 tracking-wide">{chart.title}</h4>
            <p className="text-xs text-slate-500">{chart.sub}</p>
          </div>
          <div className="relative flex-1">
            <canvas ref={chart.ref} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TaskCard
   ═══════════════════════════════════════════════════════════════════════ */
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-slate-350 hover:shadow-lg hover:shadow-slate-100 transition duration-200 group flex flex-col justify-between min-h-[120px]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />
          <span className="text-[10px] font-mono text-slate-400 select-all shrink-0">#{task.id.slice(0, 8)}</span>
        </div>
        <h5 className="font-bold text-sm text-slate-800 mt-2 line-clamp-1">{task.title}</h5>
        {task.description && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 shrink-0">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {task.due_date}
        </span>
        {/* Actions — always visible on touch, hover-only on desktop */}
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
          <button
            id={`btn-edit-${task.id.slice(0, 8)}`}
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
            aria-label="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            id={`btn-delete-${task.id.slice(0, 8)}`}
            onClick={() => onDelete(task)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition"
            aria-label="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TaskModal  (Create / Edit) — with AI sub-steps
   ═══════════════════════════════════════════════════════════════════════ */
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string; description: string;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string;
  }) => Promise<void>;
  task?: Task | null;
  defaultStatus?: 'todo' | 'in_progress' | 'completed';
  loading?: boolean;
}

function TaskModal({ isOpen, onClose, onSubmit, task, defaultStatus, loading }: TaskModalProps) {
  const { toast } = useToast();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [status,      setStatus]      = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [priority,    setPriority]    = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate,     setDueDate]     = useState('');
  const [error,       setError]       = useState<string | null>(null);
  const [aiLoading,   setAiLoading]   = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setTitle(task.title); setDescription(task.description);
      setStatus(task.status); setPriority(task.priority); setDueDate(task.due_date);
    } else {
      setTitle(''); setDescription('');
      setStatus(defaultStatus || 'todo'); setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [task, defaultStatus, isOpen]);

  /* ── AI sub-steps generation ────────────────────────────────────── */
  const handleGenerateSubsteps = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first so AI can generate relevant sub-steps.');
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/substeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      const bullets = (data.substeps as string[]).map((s, i) => `${i + 1}. ${s}`).join('\n');
      setDescription(bullets);
      toast('✨ Sub-steps generated by Gemini AI!', 'success');
    } catch (err: any) {
      const msg = err.message || 'AI generation failed.';
      toast(msg, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Task title is required.'); return; }
    try {
      await onSubmit({
        title: title.trim(), description: description.trim(),
        status, priority,
        due_date: dueDate || new Date().toISOString().split('T')[0],
      });
    } catch {
      setError('Failed to save task. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">{task ? 'Modify Sprint Task' : 'Create Sprint Task'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500">Task Title</label>
            <input
              id="input-task-title"
              type="text"
              placeholder="Describe the action item"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 text-sm focus:border-violet-500 focus:outline-none transition"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description + AI button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-500">Description / Sub-steps</label>
              <button
                type="button"
                id="btn-ai-substeps"
                onClick={handleGenerateSubsteps}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-violet-50 border border-violet-100 text-violet-600 hover:bg-violet-100/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 pulse-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 pulse-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 pulse-dot-3" />
                    </span>
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3" />
                    <span>✨ AI Sub-steps</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="input-task-description"
              placeholder="Provide sub-tasks, instructions or notes… (or use ✨ AI Sub-steps above)"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 text-sm focus:border-violet-500 focus:outline-none min-h-[100px] resize-y transition"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Status</label>
              <select
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 text-sm focus:border-violet-500 focus:outline-none"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Priority</label>
              <select
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 text-sm focus:border-violet-500 focus:outline-none"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500">Due Date</label>
            <input
              type="date"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 text-sm focus:border-violet-500 focus:outline-none"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-500 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-60"
              disabled={loading || aiLoading}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>{task ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ConfirmModal
   ═══════════════════════════════════════════════════════════════════════ */
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
    <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <Trash2 className="h-6 w-6" />
          </div>
          <h3 className="text-center font-bold text-slate-800 text-lg">{title}</h3>
          <p className="text-center text-xs text-slate-500 leading-relaxed">{message}</p>

          <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-500 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-60"
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


