'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Calculator,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  FileText,
  Lock,
  Layers,
  Building2,
  Check,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  // Hero inquiry form state
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [interestType, setInterestType] = useState<'working_capital' | 'accounting'>('working_capital');
  const [submittedQuery, setSubmittedQuery] = useState(false);

  useEffect(() => {
    if (!isLoading && token && user) {
      if (user.role === 'Borrower') {
        router.push('/borrower');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, token, isLoading, router]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(true);
    setTimeout(() => {
      router.push('/register');
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col space-y-16">
      {/* FULL-BLEED CREDFLOW HERO SECTION */}
      <section className="w-full bg-gradient-to-br from-[#234FE6] via-[#1F4AD6] to-[#16369A] text-white py-12 lg:py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        {/* Subtle decorative background glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#16369A]/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* RBI Compliant Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full trust-badge-pill text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>RBI Compliant · Trusted by 10,000+ MSMEs</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Powering MSME <br />
              growth through <br />
              lending & <br />
              technology.
            </h1>

            {/* Subtitle */}
            <p className="text-white/90 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed font-normal">
              CredFlow is a fintech group operating across lending infrastructure, regulated lending, partner distribution and MSME SaaS — enabling sustainable growth for India's small businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/borrower"
                className="px-6 py-3.5 rounded-xl bg-white text-[#234FE6] hover:bg-slate-50 font-bold text-sm shadow-xl shadow-black/10 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore our companies</span>
                <ArrowRight className="w-4 h-4 text-[#234FE6]" />
              </Link>

              <Link
                href="/register"
                className="px-6 py-3.5 rounded-xl border border-white/40 hover:bg-white/10 text-white font-bold text-sm transition"
              >
                Learn about us
              </Link>
            </div>

            {/* Video / Customer Stories Link */}
            <div className="pt-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition group"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
                <span>Watch customer stories & view demo</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating White Inquiry / Quick Loan Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl shadow-black/25 border border-slate-100">
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Talk to our expert</h2>
                <p className="text-xs text-slate-500">Get a personalised consultation for your business.</p>
              </div>

              {submittedQuery ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Inquiry Received!</h4>
                  <p className="text-xs text-slate-600">Redirecting you to complete your instant digital application...</p>
                </div>
              ) : (
                <form onSubmit={handleHeroSubmit} className="space-y-4">
                  {/* Name & Company Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Company</label>
                      <input
                        type="text"
                        required
                        placeholder="Company name"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Tile Selectors: What are you looking for? */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-700">What are you looking for?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setInterestType('accounting')}
                        className={`p-3 rounded-xl border text-left transition ${
                          interestType === 'accounting'
                            ? 'bg-[#EEF4FF] border-[#234FE6] shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">Accounting software</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Tally, Busy, Marg</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInterestType('working_capital')}
                        className={`p-3 rounded-xl border text-left transition ${
                          interestType === 'working_capital'
                            ? 'bg-[#EEF4FF] border-[#234FE6] shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">Working capital</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Loans & supply chain</div>
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-sm shadow-lg shadow-[#234FE6]/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] mt-2"
                  >
                    <span>Submit query</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & FINTECH FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#234FE6]">
            Fintech Lending Engine
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Comprehensive Digital Loan Management
          </h2>
          <p className="text-sm text-slate-600">
            End-to-end lifecycle automation from automated server BRE verification to multi-role operations disbursement.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-200/80 hover:border-[#234FE6]/50 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#234FE6] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated BRE Rules</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Validates age (23–50), minimum ₹25K salary, Indian PAN regex formatting, and filters unemployed applicants.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-200/80 hover:border-[#234FE6]/50 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#234FE6] flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">12% Fixed Simple Interest</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent live interest calculator updating in real-time as users adjust principal and tenure sliders.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-200/80 hover:border-[#234FE6]/50 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#234FE6] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Document Upload & Review</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accepts salary slips in PDF, PNG, or JPG formats up to 5 MB with instant preview for Sanction officers.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-200/80 hover:border-[#234FE6]/50 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#234FE6] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Strict RBAC Operations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Role-protected modules for Sales (leads), Sanction (approval), Disbursement (release), and Collection (UTR auto-close).
            </p>
          </div>
        </div>

        {/* Action Banners */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-[#234FE6] tracking-wider">Step 1 — Borrower Flow</span>
              <h3 className="text-xl font-black text-slate-900">Borrower Application Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Experience the 4-step borrower wizard with live BRE calculation, salary slip upload, and instant loan creation.
              </p>
            </div>
            <Link
              href="/borrower"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs shadow-md shadow-[#234FE6]/25 transition self-start"
            >
              <span>Launch Borrower Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-purple-600 tracking-wider">Step 2 — Internal Operations</span>
              <h3 className="text-xl font-black text-slate-900">Operations RBAC Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in as Admin, Sales, Sanction, Disbursement, or Collection officer to inspect and process active loan applications.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition self-start"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Log In with 1-Click Role Logins</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
