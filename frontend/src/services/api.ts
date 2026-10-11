import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE_URL = getBaseUrl();

export const getFileUrl = (relativeUrl?: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
  return `${backendBase}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API helper methods
export const apiService = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),

  // Borrower
  checkEligibility: (data: { dob: string; monthlySalary: number; pan: string; employmentMode: string }) =>
    api.post('/borrower/check-eligibility', data),
  uploadSalarySlip: (formData: FormData) =>
    api.post('/borrower/upload-slip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  applyLoan: (data: { amount: number; tenureDays: number; salarySlipUrl: string }) =>
    api.post('/borrower/apply', data),
  getMyLoans: () => api.get('/borrower/my-loans'),

  // Sales
  getSalesLeads: () => api.get('/dashboard/sales/leads'),

  // Sanction
  getSanctionLoans: () => api.get('/dashboard/sanction/loans'),
  reviewLoan: (data: { loanId: string; decision: 'APPROVE' | 'REJECT'; rejectionReason?: string }) =>
    api.post('/dashboard/sanction/review', data),

  // Disbursement
  getDisbursementLoans: () => api.get('/dashboard/disbursement/loans'),
  disburseLoan: (loanId: string) => api.post('/dashboard/disbursement/disburse', { loanId }),

  // Collection
  getCollectionLoans: () => api.get('/dashboard/collection/loans'),
  getPayments: (loanId: string) => api.get(`/dashboard/collection/payments/${loanId}`),
  recordPayment: (data: { loanId: string; utrNumber: string; amount: number; paymentDate?: string }) =>
    api.post('/dashboard/collection/payment', data),

  // Admin Stats & Seed
  getAdminStats: () => api.get('/dashboard/stats'),
  seedDatabase: () => api.post('/seed'),
};
