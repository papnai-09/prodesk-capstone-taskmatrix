'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, error, loading, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    const success = await signIn(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#9bb0b5] px-4 py-12">
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#145d70] uppercase">
            TaskMATRIX
          </h1>
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Please login to continue to your account.
          </p>
        </div>

        {(validationError || error) && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{validationError || error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                  setValidationError(null);
                }}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-slate-800 placeholder-slate-400 focus:border-[#145d70] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#145d70] text-sm transition duration-200"
                placeholder="example@gmail.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                  setValidationError(null);
                }}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-slate-800 placeholder-slate-400 focus:border-[#145d70] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#145d70] text-sm transition duration-200"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-350 text-[#145d70] focus:ring-[#145d70] accent-[#145d70]"
            />
            <label htmlFor="remember-me" className="ml-2.5 block text-xs font-medium text-slate-600">
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-[#145d70] hover:bg-[#0f4756] py-3.5 px-4 text-sm font-bold text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition duration-150"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.321 1.835 15.54.9 12.24.9 6.059.9 1.06 5.88 1.06 12s4.998 11.1 11.18 11.1c6.459 0 10.747-4.524 10.747-10.932 0-.738-.078-1.3-.177-1.883H12.24z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition duration-150"
          >
            <svg className="h-4.5 w-4.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.95.82-.04 1.89-.52 2.84-1.34z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need an account?{' '}
            <Link
              href="/register"
              className="font-bold text-[#145d70] hover:text-[#0f4756] transition duration-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
