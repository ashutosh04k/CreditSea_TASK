'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { LogIn, ShieldCheck, UserCheck, AlertCircle, Sparkles, Building2, Key, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.login({ email: loginEmail, password: loginPassword });
      const { token, user } = res.data;
      login(token, user);

      // Redirect based on role
      if (user.role === 'Borrower') {
        router.push('/borrower');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickRoles: { role: UserRole; title: string; email: string; color: string; badge: string }[] = [
    { role: 'Admin', title: 'Admin User', email: 'admin@lms.com', color: 'bg-amber-50/80 border-amber-200 hover:border-amber-400 text-amber-950', badge: 'bg-amber-100 text-amber-800' },
    { role: 'Sales', title: 'Sales Exec', email: 'sales@lms.com', color: 'bg-indigo-50/80 border-indigo-200 hover:border-indigo-400 text-indigo-950', badge: 'bg-indigo-100 text-indigo-800' },
    { role: 'Sanction', title: 'Sanction Officer', email: 'sanction@lms.com', color: 'bg-blue-50/80 border-blue-200 hover:border-blue-400 text-blue-950', badge: 'bg-blue-100 text-blue-800' },
    { role: 'Disbursement', title: 'Disbursement Exec', email: 'disburse@lms.com', color: 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-emerald-950', badge: 'bg-emerald-100 text-emerald-800' },
    { role: 'Collection', title: 'Collection Exec', email: 'collect@lms.com', color: 'bg-purple-50/80 border-purple-200 hover:border-purple-400 text-purple-950', badge: 'bg-purple-100 text-purple-800' },
    { role: 'Borrower', title: 'Borrower Applicant', email: 'borrower@lms.com', color: 'bg-sky-50/80 border-sky-200 hover:border-sky-400 text-sky-950', badge: 'bg-sky-100 text-sky-800' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] text-[#234FE6] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Role-Based Access Control Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Log In to CredFlow LMS</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Access your borrower portal or operation module based on your assigned system role.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-sm">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@lms.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-sm shadow-lg shadow-[#234FE6]/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#234FE6] font-bold hover:underline">
              Sign up as Borrower
            </Link>
          </div>
        </div>

        {/* Quick Test Accounts Card for Evaluators */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-100 pb-3">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Evaluator 1-Click Role Logins</span>
          </div>
          <p className="text-xs text-slate-500">
            Click any account below to instantly auto-fill credentials and test role-based access:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {quickRoles.map((item) => (
              <button
                key={item.role}
                onClick={() => {
                  setEmail(item.email);
                  setPassword('Password123!');
                  handleLogin(undefined, item.email, 'Password123!');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition shadow-xs ${item.color}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.badge}`}>
                    {item.role}
                  </span>
                  <UserCheck className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div className="mt-2.5">
                  <span className="font-bold text-sm block">{item.title}</span>
                  <span className="text-[11px] text-slate-500 block font-mono mt-0.5">{item.email}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 mt-3">
            <div className="font-bold text-slate-700">Default Password for all seeded accounts:</div>
            <code className="text-[#234FE6] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 inline-block font-bold">
              Password123!
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
