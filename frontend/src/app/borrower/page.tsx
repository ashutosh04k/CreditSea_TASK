'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Loan } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Calculator,
  FileText,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  Briefcase,
  User as UserIcon,
} from 'lucide-react';

export default function BorrowerPage() {
  const { user, token, isLoading, updateUserLocal } = useAuth();
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 2 BRE Form State
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number | ''>('');
  const [employmentMode, setEmploymentMode] = useState<'Salaried' | 'Self-Employed' | 'Unemployed'>('Salaried');
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [brePassed, setBrePassed] = useState(false);
  const [checkingBre, setCheckingBre] = useState(false);

  // Step 3 File Upload State
  const [salarySlipFile, setSalarySlipFile] = useState<File | null>(null);
  const [salarySlipUrl, setSalarySlipUrl] = useState<string>('');
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 4 Loan Configurator State
  const [amount, setAmount] = useState<number>(100000); // 1 Lakh default
  const [tenureDays, setTenureDays] = useState<number>(180); // 6 months default
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Loans history
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPan(user.pan || '');
      setDob(user.dob || '');
      setMonthlySalary(user.monthlySalary || '');
      setEmploymentMode(user.employmentMode || 'Salaried');

      if (user.pan && user.monthlySalary && user.dob && user.employmentMode && user.employmentMode !== 'Unemployed') {
        setBrePassed(true);
      }
      fetchLoans();
    }
  }, [user]);

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await apiService.getMyLoans();
      setMyLoans(res.data.loans || []);
    } catch (err) {
      console.error('Error fetching my loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  // Live Loan Math: SI = (P * R * T) / (365 * 100) where R = 12
  const fixedRate = 12;
  const rawInterest = (amount * fixedRate * tenureDays) / (365 * 100);
  const simpleInterest = Math.round(rawInterest * 100) / 100;
  const totalRepayment = Math.round((amount + simpleInterest) * 100) / 100;

  // Handle BRE check
  const handleBRECheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingBre(true);
    setBreErrors([]);

    try {
      const res = await apiService.checkEligibility({
        dob,
        monthlySalary: Number(monthlySalary),
        pan,
        employmentMode,
      });

      if (res.data.success) {
        setBrePassed(true);
        updateUserLocal({ dob, monthlySalary: Number(monthlySalary), pan, employmentMode });
        setCurrentStep(3); // Advance to Salary Slip Upload
      }
    } catch (err: any) {
      setBrePassed(false);
      if (err.response?.data?.errors) {
        setBreErrors(err.response.data.errors);
      } else {
        setBreErrors([err.response?.data?.message || 'Eligibility check failed. Please review inputs.']);
      }
    } finally {
      setCheckingBre(false);
    }
  };

  // Handle Salary Slip Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5 MB limit.');
      return;
    }

    setSalarySlipFile(file);
    setUploadError(null);
    setUploadingSlip(true);

    const formData = new FormData();
    formData.append('salarySlip', file);

    try {
      const res = await apiService.uploadSalarySlip(formData);
      setSalarySlipUrl(res.data.fileUrl);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploadingSlip(false);
    }
  };

  // Handle Submit Application
  const handleApplyLoan = async () => {
    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const res = await apiService.applyLoan({
        amount,
        tenureDays,
        salarySlipUrl,
      });

      setApplySuccess('Loan application submitted successfully in APPLIED status!');
      fetchLoans();
      setTimeout(() => {
        setApplySuccess(null);
      }, 5000);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to submit loan application.');
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SANCTIONED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DISBURSED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[#234FE6]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-bold text-sm">Loading Borrower Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#234FE6] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Borrower Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Loan Application Wizard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the 4-step wizard to apply for an instant low-interest digital loan.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
          <UserIcon className="w-4 h-4 text-[#234FE6]" />
          <span className="text-slate-900 font-bold">{user?.name}</span>
          <span className="text-slate-500">({user?.email})</span>
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { num: 1, title: 'Auth & Login', icon: ShieldCheck },
          { num: 2, title: 'Personal & BRE', icon: FileText },
          { num: 3, title: 'Salary Slip Upload', icon: UploadCloud },
          { num: 4, title: 'Loan Config & Apply', icon: Calculator },
        ].map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num || (step.num === 2 && brePassed);

          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition ${
                isActive
                  ? 'bg-[#234FE6] border-[#234FE6] text-white shadow-md shadow-[#234FE6]/25'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isActive ? 'text-white/80' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                  Step {step.num}
                </span>
                {isDone ? (
                  <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                ) : (
                  <Icon className="w-4 h-4 opacity-70" />
                )}
              </div>
              <span className="text-xs font-bold line-clamp-1">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard Step Content */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Step 1: Authentication Confirmation */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-xl mx-auto text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Step 1 — Authenticated</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                You are securely logged in as <strong className="text-slate-800">{user?.name}</strong>. Passwords are encrypted with bcrypt.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3.5 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-[#234FE6]/25 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Proceed to Personal Details & BRE Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Personal Details + BRE Verification */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#234FE6]" />
                <span>Step 2 — Personal Details & BRE Eligibility Check</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Server-side Business Rule Engine (BRE) validates Age (23–50), Salary (≥ ₹25,000/mo), PAN format, and Employment Mode.
              </p>
            </div>

            {breErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="font-bold text-xs flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>BRE Rejection — Application Blocked</span>
                </div>
                <ul className="list-disc list-inside text-xs space-y-1 text-rose-700">
                  {breErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {brePassed && breErrors.length === 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All BRE Server Rules Passed! You are eligible for a digital loan.</span>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  Continue to Step 3 →
                </button>
              </div>
            )}

            <form onSubmit={handleBRECheck} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">PAN Number (Format: ABCDE1234F)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono tracking-wider focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Date of Birth (Age 23 - 50)</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Monthly Salary (Min ₹25,000)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 50000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Employment Mode</label>
                <select
                  value={employmentMode}
                  onChange={(e) => setEmploymentMode(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#234FE6] focus:ring-2 focus:ring-[#234FE6]/10 outline-none transition"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed (BRE Reject)</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={checkingBre}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs shadow-md shadow-[#234FE6]/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingBre ? (
                    <span>Running BRE Verification...</span>
                  ) : (
                    <>
                      <span>Run BRE Eligibility Engine</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Upload Salary Slip */}
        {currentStep === 3 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#234FE6]" />
                <span>Step 3 — Upload Salary Slip Document</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Accepts PDF, JPG, or PNG files up to 5 MB.</p>
            </div>

            {uploadError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {uploadError}
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 hover:border-[#234FE6] rounded-3xl p-8 text-center bg-slate-50/70 transition flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] text-[#234FE6] flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {salarySlipFile ? salarySlipFile.name : 'Choose file or drag & drop here'}
                </span>
                <span className="text-xs text-slate-500">PDF, PNG, JPG (Max 5MB)</span>
              </div>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="salary-slip-input"
              />

              <label
                htmlFor="salary-slip-input"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-sm cursor-pointer transition"
              >
                {uploadingSlip ? 'Uploading...' : salarySlipUrl ? 'Change Salary Slip' : 'Select Salary Slip File'}
              </label>

              {salarySlipUrl && (
                <div className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Salary Slip Attached Successfully!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
              >
                ← Back to BRE Check
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                disabled={!salarySlipUrl && !salarySlipFile}
                className="px-6 py-2.5 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs shadow-md shadow-[#234FE6]/25 transition disabled:opacity-40"
              >
                Continue to Loan Configurator →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Loan Configuration & Apply */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#234FE6]" />
                <span>Step 4 — Loan Configuration & Apply</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your loan principal and tenure using sliders. Live calculation updates automatically at 12% p.a. fixed interest.
              </p>
            </div>

            {applySuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}

            {applyError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Sliders Form */}
              <div className="md:col-span-7 space-y-6">
                {/* Loan Amount Slider */}
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Loan Amount</label>
                    <span className="text-xl font-black text-[#234FE6] font-mono">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={500000}
                    step={10000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>₹50,000</span>
                    <span>₹2,75,000</span>
                    <span>₹5,00,000</span>
                  </div>
                </div>

                {/* Tenure Days Slider */}
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Tenure (Days)</label>
                    <span className="text-xl font-black text-indigo-700 font-mono">{tenureDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={365}
                    step={5}
                    value={tenureDays}
                    onChange={(e) => setTenureDays(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>30 Days</span>
                    <span>180 Days</span>
                    <span>365 Days</span>
                  </div>
                </div>
              </div>

              {/* Live Interest Calculation Panel */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-[#234FE6]/30 space-y-5 shadow-lg shadow-[#234FE6]/5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase text-[#234FE6] tracking-wider">Live Calculation</span>
                  <span className="px-3 py-1 rounded-full bg-[#EEF4FF] text-[#234FE6] text-[10px] font-extrabold uppercase">
                    12% p.a. Fixed SI
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Principal (P):</span>
                    <span className="font-mono text-slate-900 font-bold">₹{amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Tenure (T):</span>
                    <span className="font-mono text-slate-900 font-bold">{tenureDays} Days</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Simple Interest (SI):</span>
                    <span className="font-mono text-amber-700 font-bold">₹{simpleInterest.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-700">Total Repayment:</span>
                    <span className="text-2xl font-black text-[#234FE6] font-mono">
                      ₹{totalRepayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Formula: SI = (P × R × T) / (365 × 100)</div>
                  <div className="text-slate-500">
                    SI = ({amount} × 12 × {tenureDays}) / 36500 = ₹{simpleInterest}
                  </div>
                </div>

                <button
                  onClick={handleApplyLoan}
                  disabled={applying}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-black text-xs shadow-md shadow-[#234FE6]/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {applying ? 'Submitting Application...' : 'Apply for Loan (Status: APPLIED)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications Tracker Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">My Loan Applications</h2>
            <p className="text-xs text-slate-500">Track real-time status transitions through the operations lifecycle.</p>
          </div>
          <button
            onClick={fetchLoans}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLoans ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {myLoans.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No loan applications found. Use the wizard above to submit your first loan request.
          </div>
        ) : (
          <div className="space-y-4">
            {myLoans.map((loan) => (
              <div key={loan._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-900 font-mono">
                        ₹{loan.amount.toLocaleString('en-IN')}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Applied on: {new Date(loan.createdAt).toLocaleDateString('en-IN')} • Tenure: {loan.tenureDays} Days
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <div className="text-slate-500">Total Repayment:</div>
                    <div className="text-[#234FE6] font-black font-mono text-base">
                      ₹{loan.totalRepayment.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Active Disbursed / Paid Loans */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Repayment Progress</span>
                    <span className="font-semibold text-slate-700">
                      Paid: ₹{loan.paidAmount.toLocaleString('en-IN')} / ₹{loan.totalRepayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#234FE6] to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (loan.paidAmount / loan.totalRepayment) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Rejection notice if REJECTED */}
                {loan.status === 'REJECTED' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <strong>Rejection Reason:</strong> {loan.rejectionReason || 'Application rejected by Sanction Team.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
