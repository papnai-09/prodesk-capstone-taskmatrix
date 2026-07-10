'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────────── */
type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ── Context ─────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ── Provider ────────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Mark as exiting (triggers exit animation)
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    const t = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timers.current.delete(id);
    }, 280);
    timers.current.set(id + '_exit', t);
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, variant, exiting: false }]);

    // Auto-dismiss after 3.5s
    const t = setTimeout(() => dismiss(id), 3500);
    timers.current.set(id, t);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ── Container ───────────────────────────────────────────────────────── */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      style={{ maxWidth: 'min(380px, calc(100vw - 2rem))' }}
    >
      {toasts.map(t => (
        <ToastPill key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ── Individual pill ─────────────────────────────────────────────────── */
const CONFIG: Record<ToastVariant, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg:    'bg-white',
    border:'border-emerald-100',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg:    'bg-white',
    border:'border-red-100',
  },
  info: {
    icon: Info,
    color: 'text-violet-600',
    bg:    'bg-white',
    border:'border-violet-100',
  },
};

function ToastPill({ toast: t, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const cfg = CONFIG[t.variant];
  const Icon = cfg.icon;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3.5
        rounded-2xl shadow-xl border backdrop-blur-md
        text-sm font-semibold text-slate-800
        ${cfg.bg} ${cfg.border}
        ${t.exiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <Icon className={`h-4.5 w-4.5 shrink-0 ${cfg.color}`} />
      <span className="flex-1 leading-snug">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-slate-400 hover:text-slate-600 transition ml-1"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
