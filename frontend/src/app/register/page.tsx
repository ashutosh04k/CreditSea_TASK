'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.register({ name, email, password });
      const { token, user } = res.data;
      login(token, user);
      router.push('/borrower');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 space-y-6 border border-slate-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] border border-[#234FE6]/20 flex items-center justify-center mx-auto text-[#234FE6]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Borrower Account</h1>
          <p className="text-xs text-slate-500">Register to check loan eligibility and submit loan requests.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-[#234FE6] font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
