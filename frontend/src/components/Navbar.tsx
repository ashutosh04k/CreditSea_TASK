'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, Database, Phone, LogIn, Sparkles, Building2 } from 'lucide-react';
import { apiService } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMsg(null);
    try {
      await apiService.seedDatabase();
      setSeedMsg('Demo Accounts Seeded!');
      setTimeout(() => setSeedMsg(null), 4000);
    } catch (err: any) {
      setSeedMsg('Seed failed');
      setTimeout(() => setSeedMsg(null), 3000);
    } finally {
      setIsSeeding(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Sales':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Sanction':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Disbursement':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Collection':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Borrower':
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#234FE6] flex items-center justify-center shadow-md shadow-[#234FE6]/30 text-white group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#0F172A] leading-none">
              Cred<span className="text-[#234FE6]">Flow</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Lending & Technology
            </span>
          </div>
        </Link>

        {/* CredFlow Style Center Nav */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              pathname === '/'
                ? 'bg-[#EEF4FF] text-[#234FE6]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>

          <Link
            href="/borrower"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              pathname === '/borrower'
                ? 'bg-[#EEF4FF] text-[#234FE6]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Borrower Portal
          </Link>

          {user && user.role !== 'Borrower' && (
            <Link
              href="/dashboard"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                pathname === '/dashboard'
                  ? 'bg-[#EEF4FF] text-[#234FE6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Operations Dashboard
            </Link>
          )}

          <a
            href="tel:8521975695"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#234FE6] transition rounded-full hover:bg-slate-50"
          >
            <Phone className="w-3.5 h-3.5 text-[#234FE6]" />
            <span>8521975695</span>
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2.5">
          {/* Quick Seed button */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Seed demo accounts for all roles"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : seedMsg ? seedMsg : 'Seed Demo DB'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-row items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs shadow-md shadow-[#234FE6]/25 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex items-center px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#234FE6] hover:text-[#234FE6] text-slate-700 font-bold text-xs transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
