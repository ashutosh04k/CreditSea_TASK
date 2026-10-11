import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';

dotenv.config();

export const seedUsersList = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'Password123!',
    role: 'Admin' as UserRole,
  },
  {
    name: 'Sales Executive',
    email: 'sales@lms.com',
    password: 'Password123!',
    role: 'Sales' as UserRole,
  },
  {
    name: 'Sanction Officer',
    email: 'sanction@lms.com',
    password: 'Password123!',
    role: 'Sanction' as UserRole,
  },
  {
    name: 'Disbursement Officer',
    email: 'disburse@lms.com',
    password: 'Password123!',
    role: 'Disbursement' as UserRole,
  },
  {
    name: 'Collection Officer',
    email: 'collect@lms.com',
    password: 'Password123!',
    role: 'Collection' as UserRole,
  },
  {
    name: 'Rahul Sharma (Borrower)',
    email: 'borrower@lms.com',
    password: 'Password123!',
    role: 'Borrower' as UserRole,
    pan: 'ABCDE1234F',
    monthlySalary: 65000,
    dob: '1995-08-15',
    employmentMode: 'Salaried' as const,
  },
];

export const runSeed = async () => {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const createdUsers = [];

  for (const u of seedUsersList) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const newUser = await User.create({
        ...u,
        password: hashedPassword,
      });
      createdUsers.push(newUser);
      console.log(`[Seed] Created User: ${u.email} (${u.role})`);
    } else {
      console.log(`[Seed] User already exists: ${u.email}`);
    }
  }

  return createdUsers;
};

// Execute if run directly via CLI (npm run seed)
if (require.main === module) {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_db';
  mongoose
    .connect(connStr, { dbName: 'lms_db' })
    .then(async () => {
      console.log('[Seed CLI] Connected to DB. Seeding users...');
      await runSeed();
      console.log('[Seed CLI] Seeding completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] Error:', err);
      process.exit(1);
    });
}
