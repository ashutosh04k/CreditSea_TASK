import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'Admin' | 'Sales' | 'Sanction' | 'Disbursement' | 'Collection' | 'Borrower';
export type EmploymentMode = 'Salaried' | 'Self-Employed' | 'Unemployed';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  pan?: string;
  monthlySalary?: number;
  dob?: string; // YYYY-MM-DD
  employmentMode?: EmploymentMode;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Sales', 'Sanction', 'Disbursement', 'Collection', 'Borrower'],
      default: 'Borrower',
    },
    pan: { type: String, uppercase: true, trim: true },
    monthlySalary: { type: Number },
    dob: { type: String },
    employmentMode: {
      type: String,
      enum: ['Salaried', 'Self-Employed', 'Unemployed'],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
