import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface UserPayload {
  uid: string;
  email: string;
  name: string;
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userPayload: UserPayload = {
            uid: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Supabase User',
          };
          set({ user: userPayload, loading: false });
          setAuthCookie(JSON.stringify(userPayload));
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    set({ user: null, loading: false });
    deleteAuthCookie();
  },

  signUp: async (name, email, password) => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Supabase credentials are not configured.', loading: false });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data?.user) {
        const userPayload: UserPayload = {
          uid: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || name,
        };

        set({ user: userPayload, loading: false });
        setAuthCookie(JSON.stringify(userPayload));
        return true;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown registration error';
      set({ error: msg, loading: false });
      return false;
    }

    set({ loading: false });
    return false;
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Supabase credentials are not configured.', loading: false });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data?.user) {
        const userPayload: UserPayload = {
          uid: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'Supabase User',
        };

        set({ user: userPayload, loading: false });
        setAuthCookie(JSON.stringify(userPayload));
        return true;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown login error';
      set({ error: msg, loading: false });
      return false;
    }

    set({ loading: false });
    return false;
  },

  signOut: async () => {
    set({ loading: true });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error(err);
      }
    }

    set({ user: null, loading: false });
    deleteAuthCookie();
  },
}));
