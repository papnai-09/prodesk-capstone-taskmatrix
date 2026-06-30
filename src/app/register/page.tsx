'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, signUp, error, loading, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const success = await signUp(name, email, password);
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
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Join and start collaborating with your team
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
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <User className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                  setValidationError(null);
                }}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-slate-800 placeholder-slate-400 focus:border-[#145d70] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#145d70] text-sm transition duration-200"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError();
                  setValidationError(null);
                }}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-slate-800 placeholder-slate-400 focus:border-[#145d70] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#145d70] text-sm transition duration-200"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-[#145d70] hover:bg-[#0f4756] py-3.5 px-4 text-sm font-bold text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-[#145d70] hover:text-[#0f4756] transition duration-200"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
