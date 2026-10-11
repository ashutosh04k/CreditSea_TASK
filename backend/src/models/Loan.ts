import mongoose, { Schema, Document, Types } from 'mongoose';

export type LoanStatus = 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'CLOSED' | 'REJECTED';

export interface ILoan extends Document {
  applicant: Types.ObjectId;
  amount: number;
  tenureDays: number;
  interestRate: number; // e.g., 12 for 12% p.a.
  simpleInterest: number;
  totalRepayment: number;
  paidAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  salarySlipUrl?: string;
  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['APPLIED', 'SANCTIONED', 'DISBURSED', 'CLOSED', 'REJECTED'],
      default: 'APPLIED',
    },
    rejectionReason: { type: String },
    salarySlipUrl: { type: String },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>('Loan', LoanSchema);
