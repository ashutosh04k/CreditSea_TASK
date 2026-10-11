'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Loan, User, UserRole, Payment } from '../../types';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  DollarSign,
  Receipt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  FileText,
  Building2,
  TrendingUp,
  PlusCircle,
  X,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  // Active module tab ('sales' | 'sanction' | 'disbursement' | 'collection')
  const [activeTab, setActiveTab] = useState<'sales' | 'sanction' | 'disbursement' | 'collection'>('sales');

  // Data states
  const [salesLeads, setSalesLeads] = useState<{ user: User; hasApplied: boolean }[]>([]);
  const [sanctionLoans, setSanctionLoans] = useState<Loan[]>([]);
  const [disbursementLoans, setDisbursementLoans] = useState<Loan[]>([]);
  const [collectionLoans, setCollectionLoans] = useState<Loan[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [reviewModalLoan, setReviewModalLoan] = useState<Loan | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [paymentModalLoan, setPaymentModalLoan] = useState<Loan | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [loanPayments, setLoanPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/login');
        return;
      }
      if (user?.role === 'Borrower') {
        router.push('/borrower');
        return;
      }

      // Set default tab based on user role
      if (user?.role === 'Sales') setActiveTab('sales');
      else if (user?.role === 'Sanction') setActiveTab('sanction');
      else if (user?.role === 'Disbursement') setActiveTab('disbursement');
      else if (user?.role === 'Collection') setActiveTab('collection');
      else setActiveTab('sales'); // Admin defaults to sales

      loadModuleData();
    }
  }, [isLoading, user, token, router]);

  const loadModuleData = async () => {
    setLoadingData(true);
    setErrorMsg(null);

    try {
      if (user?.role === 'Admin') {
        const statsRes = await apiService.getAdminStats();
        setAdminStats(statsRes.data);
      }

      if (user?.role === 'Sales' || user?.role === 'Admin') {
        const res = await apiService.getSalesLeads();
        setSalesLeads(res.data.leads || []);
      }
      if (user?.role === 'Sanction' || user?.role === 'Admin') {
        const res = await apiService.getSanctionLoans();
        setSanctionLoans(res.data.loans || []);
      }
      if (user?.role === 'Disbursement' || user?.role === 'Admin') {
        const res = await apiService.getDisbursementLoans();
        setDisbursementLoans(res.data.loans || []);
      }
      if (user?.role === 'Collection' || user?.role === 'Admin') {
        const res = await apiService.getCollectionLoans();
        setCollectionLoans(res.data.loans || []);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error loading module data.');
    } finally {
      setLoadingData(false);
    }
  };

  // Sanction Review Action (Approve / Reject)
  const handleSanctionReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!reviewModalLoan) return;

    try {
      await apiService.reviewLoan({
        loanId: reviewModalLoan._id,
        decision,
        rejectionReason: decision === 'REJECT' ? rejectionReason : undefined,
      });

      setSuccessMsg(`Loan ${decision === 'APPROVE' ? 'SANCTIONED' : 'REJECTED'} successfully!`);
      setReviewModalLoan(null);
      setRejectionReason('');
      loadModuleData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit decision.');
    }
  };

  // Disbursement Action
  const handleDisburse = async (loanId: string) => {
    try {
      await apiService.disburseLoan(loanId);
      setSuccessMsg('Loan funds successfully DISBURSED!');
      loadModuleData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Disbursement failed.');
    }
  };

  // Open Payment Modal
  const openPaymentModal = async (loan: Loan) => {
    setPaymentModalLoan(loan);
    setUtrNumber('');
    setPaymentAmount('');
    try {
      const res = await apiService.getPayments(loan._id);
      setLoanPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Payment Action
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalLoan || !utrNumber || !paymentAmount) return;

    try {
      const res = await apiService.recordPayment({
        loanId: paymentModalLoan._id,
        utrNumber,
        amount: Number(paymentAmount),
      });

      setSuccessMsg(res.data.message || 'Payment recorded successfully!');
      setPaymentModalLoan(null);
      loadModuleData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Payment recording failed.');
    }
  };

  const isTabAllowed = (tabName: string) => {
    if (user?.role === 'Admin') return true;
    if (tabName === 'sales' && user?.role === 'Sales') return true;
    if (tabName === 'sanction' && user?.role === 'Sanction') return true;
    if (tabName === 'disbursement' && user?.role === 'Disbursement') return true;
    if (tabName === 'collection' && user?.role === 'Collection') return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[#234FE6]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-bold text-sm">Loading Operations Dashboard...</span>
        </div>
      </div>
    );
  }

  if (user?.role === 'Borrower') {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-md mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-slate-500">
          Borrower accounts are restricted from accessing internal operations dashboard modules.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#234FE6] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Internal loan lifecycle management portal • Enforcing strict module gating by staff role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadModuleData}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Admin Analytics Summary Card */}
      {user?.role === 'Admin' && adminStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">Total System Users</span>
            <div className="text-3xl font-black text-slate-900">{adminStats.totalUsers}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider">Total Applications</span>
            <div className="text-3xl font-black text-slate-900">{adminStats.totalLoans}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Disbursed Funds</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              ₹{(adminStats.totalDisbursedAmount || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">RBAC Status</span>
            <div className="text-xs font-bold text-slate-800 pt-1">Admin Mode (All Modules Unlocked)</div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 pb-3">
        {[
          { id: 'sales', name: 'Sales Module', roleReq: 'Sales', icon: Users },
          { id: 'sanction', name: 'Sanction Module', roleReq: 'Sanction', icon: CheckSquare },
          { id: 'disbursement', name: 'Disbursement Module', roleReq: 'Disbursement', icon: DollarSign },
          { id: 'collection', name: 'Collection Module', roleReq: 'Collection', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const allowed = isTabAllowed(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => allowed && setActiveTab(tab.id as any)}
              disabled={!allowed}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? 'bg-[#234FE6] text-white shadow-md shadow-[#234FE6]/25'
                  : allowed
                  ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {!allowed && <span className="text-[10px] text-rose-600 font-mono font-bold">(Restricted)</span>}
            </button>
          );
        })}
      </div>

      {/* MODULE CONTENT */}

      {/* 1. SALES MODULE */}
      {activeTab === 'sales' && isTabAllowed('sales') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Sales Module — Lead Tracking</span>
              </h2>
              <p className="text-xs text-slate-500">Registered applicants who haven't completed a loan application yet.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              {salesLeads.length} Total Leads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Borrower Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Registration Date</th>
                  <th className="p-3.5 rounded-r-xl">Application Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesLeads.map((lead) => (
                  <tr key={lead.user.id || (lead.user as any)._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-bold text-slate-900">{lead.user.name}</td>
                    <td className="p-3.5 text-slate-500">{lead.user.email}</td>
                    <td className="p-3.5 text-slate-500">
                      {new Date((lead.user as any).createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      {lead.hasApplied ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          Applied
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          Pre-Application Lead
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SANCTION MODULE */}
      {activeTab === 'sanction' && isTabAllowed('sanction') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span>Sanction Module — Loan Approval & Review</span>
              </h2>
              <p className="text-xs text-slate-500">Review applied loans, inspect salary slips & BRE criteria, approve or reject.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              {sanctionLoans.filter((l) => l.status === 'APPLIED').length} Pending Reviews
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Amount & Tenure</th>
                  <th className="p-3.5">Simple Interest @ 12%</th>
                  <th className="p-3.5">Salary Slip</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sanctionLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{loan.applicant?.name || 'Borrower'}</div>
                      <div className="text-[11px] text-slate-500">{loan.applicant?.email}</div>
                      <div className="text-[10px] font-mono text-slate-400">PAN: {loan.applicant?.pan || 'N/A'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#234FE6] font-mono">₹{loan.amount.toLocaleString('en-IN')}</div>
                      <div className="text-slate-500 text-[11px]">{loan.tenureDays} Days</div>
                    </td>
                    <td className="p-3.5 font-mono text-amber-700 font-bold">
                      ₹{loan.simpleInterest.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      {loan.salarySlipUrl ? (
                        <a
                          href={`http://localhost:5001${loan.salarySlipUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#234FE6] hover:underline flex items-center gap-1 font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">Not Uploaded</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                          loan.status === 'APPLIED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : loan.status === 'SANCTIONED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {loan.status === 'APPLIED' && (
                        <button
                          onClick={() => setReviewModalLoan(loan)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs transition shadow-sm"
                        >
                          Review & Decision
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DISBURSEMENT MODULE */}
      {activeTab === 'disbursement' && isTabAllowed('disbursement') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Disbursement Module — Release Funds</span>
              </h2>
              <p className="text-xs text-slate-500">Execute fund transfers for sanctioned loans.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              {disbursementLoans.filter((l) => l.status === 'SANCTIONED').length} Ready for Disbursement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Disbursement Amount</th>
                  <th className="p-3.5">Total Repayment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disbursementLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{loan.applicant?.name || 'Borrower'}</div>
                      <div className="text-slate-500 text-[11px]">{loan.applicant?.email}</div>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-emerald-600 text-sm">
                      ₹{loan.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800">₹{loan.totalRepayment.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                          loan.status === 'SANCTIONED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {loan.status === 'SANCTIONED' && (
                        <button
                          onClick={() => handleDisburse(loan._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm"
                        >
                          Disburse Funds →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COLLECTION MODULE */}
      {activeTab === 'collection' && isTabAllowed('collection') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <span>Collection Module — Payments & Auto-Close</span>
              </h2>
              <p className="text-xs text-slate-500">Record borrower repayment with unique UTR number. Auto-closes loan when total paid equals total repayment.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Borrower</th>
                  <th className="p-3.5">Disbursed Principal</th>
                  <th className="p-3.5">Repayment Progress</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collectionLoans.map((loan) => {
                  const percent = Math.min(100, Math.round((loan.paidAmount / loan.totalRepayment) * 100));

                  return (
                    <tr key={loan._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{loan.applicant?.name || 'Borrower'}</div>
                        <div className="text-[11px] text-slate-500">{loan.applicant?.email}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-800">₹{loan.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-emerald-600 font-bold">₹{loan.paidAmount.toLocaleString('en-IN')}</span>
                          <span className="text-slate-500">/ ₹{loan.totalRepayment.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                            loan.status === 'CLOSED'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {loan.status === 'DISBURSED' && (
                          <button
                            onClick={() => openPaymentModal(loan)}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm"
                          >
                            + Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SANCTION DECISION MODAL */}
      {reviewModalLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900">Review Loan Application</h3>
              <button onClick={() => setReviewModalLoan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <strong>Applicant:</strong> {reviewModalLoan.applicant?.name}
              </div>
              <div>
                <strong>Amount Requested:</strong> ₹{reviewModalLoan.amount.toLocaleString('en-IN')} ({reviewModalLoan.tenureDays} Days)
              </div>
              <div>
                <strong>Interest & Total Repayment:</strong> ₹{reviewModalLoan.simpleInterest} → ₹{reviewModalLoan.totalRepayment}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Rejection Reason (If Rejecting):</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify reason for rejection..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs h-20 text-slate-900 focus:bg-white focus:border-[#234FE6] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleSanctionReview('REJECT')}
                className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleSanctionReview('APPROVE')}
                className="px-5 py-2.5 rounded-xl bg-[#234FE6] hover:bg-[#1B3FB8] text-white font-bold text-xs transition shadow-sm"
              >
                Approve & Sanction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Record Repayment Payment</span>
              </h3>
              <button onClick={() => setPaymentModalLoan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700 font-mono">
              <div>Total Repayment: ₹{paymentModalLoan.totalRepayment.toLocaleString('en-IN')}</div>
              <div>Already Paid: ₹{paymentModalLoan.paidAmount.toLocaleString('en-IN')}</div>
              <div className="text-purple-700 font-bold">
                Remaining Outstanding: ₹{(paymentModalLoan.totalRepayment - paymentModalLoan.paidAmount).toLocaleString('en-IN')}
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700">Unique UTR Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR9876543210"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#234FE6] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalLoan.totalRepayment - paymentModalLoan.paidAmount}
                  placeholder={`Max: ${paymentModalLoan.totalRepayment - paymentModalLoan.paidAmount}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-[#234FE6] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm"
              >
                Record Payment (Auto-Close if Fully Paid)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
