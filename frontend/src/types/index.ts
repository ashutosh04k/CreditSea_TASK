export type UserRole = 'Admin' | 'Sales' | 'Sanction' | 'Disbursement' | 'Collection' | 'Borrower';
export type EmploymentMode = 'Salaried' | 'Self-Employed' | 'Unemployed';
export type LoanStatus = 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'CLOSED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pan?: string;
  monthlySalary?: number;
  dob?: string;
  employmentMode?: EmploymentMode;
}

export interface Loan {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
    pan?: string;
    monthlySalary?: number;
    dob?: string;
    employmentMode?: EmploymentMode;
  };
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  paidAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  salarySlipUrl?: string;
  sanctionedBy?: string;
  sanctionedAt?: string;
  disbursedBy?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  createdBy: string;
  createdAt: string;
}

export interface BREResult {
  success: boolean;
  message: string;
  errors?: string[];
  age?: number;
}
