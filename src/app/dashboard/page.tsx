'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  LogOut, 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  Settings, 
  AlertTriangle,
  FolderKanban, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (!user) {
    return null; // Let middleware or useEffect redirect
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">TaskMatrix</span>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600/10 text-violet-400 font-medium transition duration-200">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium transition duration-200">
              <KanbanSquare className="h-5 w-5" />
              <span>Kanban Board</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium transition duration-200">
              <Users className="h-5 w-5" />
              <span>Team</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium transition duration-200">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-850 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
          </div>
          <div>
            <span className="text-xs text-slate-400">Environment: {isConfigured ? 'Production (Supabase)' : 'Local (Mock Auth)'}</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Env Warning Banner if running locally with Mock Auth */}
          {!isConfigured && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-950/30 border border-amber-900/40 text-amber-300">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Running in Local Mock Auth Mode</h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Supabase configuration was not found in environment variables. Signups and signins are mocked in localStorage.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <code className="text-xs bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono select-all">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between hover:border-slate-800 transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="p-3 bg-violet-600/10 rounded-xl text-violet-400">
                <FolderKanban className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between hover:border-slate-800 transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">48</p>
              </div>
              <div className="p-3 bg-green-600/10 rounded-xl text-green-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between hover:border-slate-800 transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="p-3 bg-amber-600/10 rounded-xl text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between hover:border-slate-800 transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Sprint Velocity</p>
                <p className="text-2xl font-bold text-white">+24%</p>
              </div>
              <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* User Payload Profile Section (Walking Skeleton Requirement) */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Authenticated Session Payload</h3>
              <p className="text-xs text-slate-400 mt-1">Serialized payload retrieved from the Zustand global store</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID (UID)</p>
                <p className="text-sm font-mono text-violet-400 truncate mt-1 select-all">{user.uid}</p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-slate-200 mt-1">{user.name || 'N/A'}</p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Mock Sprint Tasks */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sprint Backlog Mockup</h3>
            <div className="divide-y divide-slate-850">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider px-2 py-0.5 bg-violet-600/10 rounded-md">TM-101</span>
                  <p className="text-sm font-semibold text-white mt-1">Implement secure route guard middleware</p>
                </div>
                <span className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-600/10 rounded-lg">In Progress</span>
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 bg-blue-600/10 rounded-md">TM-102</span>
                  <p className="text-sm font-semibold text-white mt-1">Zustand global auth state serialization</p>
                </div>
                <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-600/10 rounded-lg">Completed</span>
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-600/10 rounded-md">TM-103</span>
                  <p className="text-sm font-semibold text-white mt-1">Design system mapping with Tailwind & Shadcn</p>
                </div>
                <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-800 rounded-lg">To Do</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
