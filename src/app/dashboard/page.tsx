'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  LogOut, 
  LayoutDashboard, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Users,
  Search,
  Bell,
  Settings,
  AlertTriangle,
  Calendar,
  BarChart3,
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
    return null;
  }

  return (
    <div className="flex h-screen bg-[#edf2f5] text-slate-800 overflow-hidden">
      <aside className="w-[260px] bg-[#233a46] flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-[#2d4957]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide uppercase">TaskMATRIX</span>
          </div>

          <div className="px-4 mt-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full rounded-lg bg-[#2d4957] border-0 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="Search..."
              />
            </div>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600/10 text-violet-400 font-medium transition duration-200">
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span className="text-sm">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <FolderKanban className="h-4.5 w-4.5" />
              <span className="text-sm">Projects</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span className="text-sm">Tasks</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <Users className="h-4.5 w-4.5" />
              <span className="text-sm">Team</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <Calendar className="h-4.5 w-4.5" />
              <span className="text-sm">Calendar</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <BarChart3 className="h-4.5 w-4.5" />
              <span className="text-sm">Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#2d4957] hover:text-white font-medium transition duration-200">
              <Settings className="h-4.5 w-4.5" />
              <span className="text-sm">Setting</span>
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-[#2d4957] space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-300 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#2d4957] hover:bg-red-950/20 hover:border-red-900/50 hover:text-red-400 text-slate-200 font-medium text-sm transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-[#145d70]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-[#145d70] hover:bg-slate-100 rounded-lg transition duration-200">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-[#145d70] hover:bg-slate-100 rounded-lg transition duration-200">
              <Settings className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#145d70] flex items-center justify-center text-white font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {!isConfigured && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Running in Local Mock Auth Mode</h4>
                  <p className="text-xs text-amber-800/80 mt-1">
                    Supabase credentials are not set in your environment variables. Signups and signins are mocked locally.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <code className="text-xs bg-amber-100/60 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 font-mono select-all">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:shadow-md transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Projects</p>
                <p className="text-3xl font-extrabold text-slate-800">12</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl text-violet-500">
                <FolderKanban className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:shadow-md transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Tasks</p>
                <p className="text-3xl font-extrabold text-slate-800">12</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:shadow-md transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Task</p>
                <p className="text-3xl font-extrabold text-slate-800">12</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:shadow-md transition duration-200">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Team Members</p>
                <p className="text-3xl font-extrabold text-slate-800">12</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-[#145d70]">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Task Progress chart</h3>
            <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-end relative">
              <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-slate-200/60 h-0"></div>
                <div className="w-full border-t border-slate-200/60 h-0"></div>
                <div className="w-full border-t border-slate-200/60 h-0"></div>
                <div className="w-full border-t border-slate-200/60 h-0"></div>
                <div className="w-full border-t border-slate-200/60 h-0"></div>
              </div>

              <svg className="w-full h-[90%] overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 5,80 Q 20,40 35,55 T 65,30 T 95,45"
                  fill="none"
                  stroke="#145d70"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="drop-shadow-md"
                />
                <circle cx="5" cy="80" r="1.5" fill="#145d70" />
                <circle cx="20" cy="46.5" r="1.5" fill="#145d70" />
                <circle cx="35" cy="55" r="1.5" fill="#145d70" />
                <circle cx="50" cy="42.5" r="1.5" fill="#145d70" />
                <circle cx="65" cy="30" r="1.5" fill="#145d70" />
                <circle cx="80" cy="37.5" r="1.5" fill="#145d70" />
                <circle cx="95" cy="45" r="1.5" fill="#145d70" />
              </svg>

              <div className="absolute bottom-2 left-0 right-0 px-8 flex justify-between text-[10px] font-bold text-slate-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Project structure initialized</p>
                    <p className="text-xs text-slate-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-[#145d70]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Zustand global store connected</p>
                    <p className="text-xs text-slate-400">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Upcoming deadlines</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Sprint 1 Review</p>
                    <p className="text-xs text-slate-400">Tomorrow, 5:00 PM</p>
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">Urgent</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Database mapping setup</p>
                    <p className="text-xs text-slate-400">In 3 days</p>
                  </div>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">Pending</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Authenticated Session Payload</h3>
              <p className="text-xs text-slate-400 mt-1">Serialized payload retrieved from the Zustand global store</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User ID (UID)</p>
                <p className="text-sm font-mono text-violet-600 truncate mt-1 select-all">{user.uid}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{user.name || 'N/A'}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
