import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
