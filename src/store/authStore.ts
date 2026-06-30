import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface UserPayload {
  uid: string;
  email: string;
  name: string;
}

interface MockUser {
  uid: string;
  email: string;
  name: string;
  password?: string;
}

interface AuthState {
  user: UserPayload | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

const setAuthCookie = (token: string) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `taskmatrix-session=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteAuthCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = 'taskmatrix-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  isConfigured: isSupabaseConfigured,

  clearError: () => set({ error: null }),

  initialize: async () => {
    set({ loading: true });
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && session.user) {
          const userPayload: UserPayload = {
            uid: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Supabase User',
          };
          set({ user: userPayload, loading: false });
          setAuthCookie(JSON.stringify(userPayload));
        } else {
          set({ user: null, loading: false });
          deleteAuthCookie();
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session && session.user) {
            const userPayload: UserPayload = {
              uid: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'Supabase User',
            };
            set({ user: userPayload });
            setAuthCookie(JSON.stringify(userPayload));
          } else {
            set({ user: null });
            deleteAuthCookie();
          }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize session';
        set({ error: errorMessage, loading: false });
      }
    } else {
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('taskmatrix_mock_session');
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser) as UserPayload;
            set({ user: parsed, loading: false });
            setAuthCookie(JSON.stringify(parsed));
          } catch {
            set({ user: null, loading: false });
            deleteAuthCookie();
          }
        } else {
          set({ user: null, loading: false });
          deleteAuthCookie();
        }
      } else {
        set({ user: null, loading: false });
      }
    }
  },

  signUp: async (name, email, password) => {
    set({ loading: true, error: null });
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;

        if (data.user) {
          const userPayload: UserPayload = {
            uid: data.user.id,
            email: data.user.email || '',
            name: name,
          };
          set({ user: userPayload, loading: false });
          setAuthCookie(JSON.stringify(userPayload));
          return true;
        }
        set({ loading: false });
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
        set({ error: errorMessage, loading: false });
        return false;
      }
    } else {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          try {
            const registeredUsersStr = localStorage.getItem('taskmatrix_mock_users') || '[]';
            const registeredUsers = JSON.parse(registeredUsersStr) as MockUser[];

            if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
              set({ error: 'User with this email already exists', loading: false });
              resolve(false);
              return;
            }

            const newUser: MockUser = {
              uid: 'mock_uid_' + Math.random().toString(36).substring(2, 11),
              email,
              name,
              password,
            };

            registeredUsers.push(newUser);
            localStorage.setItem('taskmatrix_mock_users', JSON.stringify(registeredUsers));

            const userPayload: UserPayload = {
              uid: newUser.uid,
              email: newUser.email,
              name: newUser.name,
            };

            localStorage.setItem('taskmatrix_mock_session', JSON.stringify(userPayload));
            set({ user: userPayload, loading: false });
            setAuthCookie(JSON.stringify(userPayload));
            resolve(true);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            set({ error: 'Mock Sign Up Error: ' + errorMessage, loading: false });
            resolve(false);
          }
        }, 800);
      });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user && data.session) {
          const userPayload: UserPayload = {
            uid: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || 'Supabase User',
          };
          set({ user: userPayload, loading: false });
          setAuthCookie(JSON.stringify(userPayload));
          return true;
        }
        set({ loading: false });
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
        set({ error: errorMessage, loading: false });
        return false;
      }
    } else {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          try {
            const registeredUsersStr = localStorage.getItem('taskmatrix_mock_users') || '[]';
            const registeredUsers = JSON.parse(registeredUsersStr) as MockUser[];

            const matchedUser = registeredUsers.find(
              (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (!matchedUser) {
              set({ error: 'Invalid email or password', loading: false });
              resolve(false);
              return;
            }

            const userPayload: UserPayload = {
              uid: matchedUser.uid,
              email: matchedUser.email,
              name: matchedUser.name,
            };

            localStorage.setItem('taskmatrix_mock_session', JSON.stringify(userPayload));
            set({ user: userPayload, loading: false });
            setAuthCookie(JSON.stringify(userPayload));
            resolve(true);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            set({ error: 'Mock Sign In Error: ' + errorMessage, loading: false });
            resolve(false);
          }
        }, 800);
      });
    }
  },

  signOut: async () => {
    set({ loading: true });
    
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('taskmatrix_mock_session');
      }
    }
    
    set({ user: null, loading: false });
    deleteAuthCookie();
  },
}));
