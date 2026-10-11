import { Router, Response } from 'express';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';

const router = Router();

router.use(authenticateToken);

// ==========================================
// 1. SALES MODULE (Sales, Admin)
// ==========================================
router.get('/sales/leads', requireRoles('Sales', 'Admin'), async (_req: AuthRequest, res: Response) => {
  try {
    // Find all borrowers
    const borrowers = await User.find({ role: 'Borrower' }).select('-password').sort({ createdAt: -1 });

    // Find users who have submitted a loan application
    const appliedApplicantIds = await Loan.distinct('applicant');
    const appliedSet = new Set(appliedApplicantIds.map((id) => id.toString()));

    const leads = borrowers.map((b) => ({
      user: b,
      hasApplied: appliedSet.has(b._id.toString()),
    }));

    return res.status(200).json({ leads });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching sales leads.', error: error.message });
  }
});

// ==========================================
// 2. SANCTION MODULE (Sanction, Admin)
// ==========================================
router.get('/sanction/loans', requireRoles('Sanction', 'Admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: { $in: ['APPLIED', 'SANCTIONED', 'REJECTED'] } })
      .populate('applicant', 'name email pan monthlySalary dob employmentMode')
      .sort({ createdAt: -1 });
    return res.status(200).json({ loans });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching sanction loans.', error: error.message });
  }
});

router.post('/sanction/review', requireRoles('Sanction', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { loanId, decision, rejectionReason } = req.body;

    if (!loanId || !['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ message: 'Valid loanId and decision (APPROVE or REJECT) are required.' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found.' });
    }

    if (loan.status !== 'APPLIED') {
      return res.status(400).json({ message: `Cannot review loan in state '${loan.status}'. Must be 'APPLIED'.` });
    }

    if (decision === 'APPROVE') {
      loan.status = 'SANCTIONED';
      loan.sanctionedBy = req.user?.id as any;
      loan.sanctionedAt = new Date();
    } else {
      loan.status = 'REJECTED';
      loan.rejectionReason = rejectionReason || 'Application rejected by Sanction executive.';
    }

    await loan.save();
    return res.status(200).json({ message: `Loan successfully ${loan.status.toLowerCase()}.`, loan });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error reviewing sanction loan.', error: error.message });
  }
});

// ==========================================
// 3. DISBURSEMENT MODULE (Disbursement, Admin)
// ==========================================
router.get('/disbursement/loans', requireRoles('Disbursement', 'Admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: { $in: ['SANCTIONED', 'DISBURSED'] } })
      .populate('applicant', 'name email pan monthlySalary')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ loans });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching disbursement loans.', error: error.message });
  }
});

router.post('/disbursement/disburse', requireRoles('Disbursement', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.body;

    if (!loanId) {
      return res.status(400).json({ message: 'loanId is required.' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.status !== 'SANCTIONED') {
      return res.status(400).json({ message: `Cannot disburse loan in state '${loan.status}'. Must be 'SANCTIONED'.` });
    }

    loan.status = 'DISBURSED';
    loan.disbursedBy = req.user?.id as any;
    loan.disbursedAt = new Date();
    await loan.save();

    return res.status(200).json({ message: 'Loan funds successfully marked as DISBURSED.', loan });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error disbursing loan.', error: error.message });
  }
});

// ==========================================
// 4. COLLECTION MODULE (Collection, Admin)
// ==========================================
router.get('/collection/loans', requireRoles('Collection', 'Admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: { $in: ['DISBURSED', 'CLOSED'] } })
      .populate('applicant', 'name email pan')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ loans });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching collection loans.', error: error.message });
  }
});

router.get('/collection/payments/:loanId', requireRoles('Collection', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ loanId: req.params.loanId }).sort({ paymentDate: -1 });
    return res.status(200).json({ payments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching payments.' });
  }
});

router.post('/collection/payment', requireRoles('Collection', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { loanId, utrNumber, amount, paymentDate } = req.body;

    if (!loanId || !utrNumber || !amount) {
      return res.status(400).json({ message: 'loanId, utrNumber, and amount are required.' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be a positive number.' });
    }

    const cleanUtr = utrNumber.trim().toUpperCase();

    // Check UTR duplicate uniqueness
    const existingUtr = await Payment.findOne({ utrNumber: cleanUtr });
    if (existingUtr) {
      return res.status(400).json({ message: `Payment failed. UTR Number '${cleanUtr}' has already been used.` });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.status !== 'DISBURSED') {
      return res.status(400).json({ message: `Cannot record payment for loan with status '${loan.status}'. Must be 'DISBURSED'.` });
    }

    const outstanding = Math.round((loan.totalRepayment - loan.paidAmount) * 100) / 100;
    if (payAmount > outstanding + 0.01) {
      return res.status(400).json({
        message: `Payment amount ₹${payAmount.toLocaleString('en-IN')} exceeds outstanding balance ₹${outstanding.toLocaleString('en-IN')}.`,
      });
    }

    // Record Payment
    const payment = await Payment.create({
      loanId: loan._id,
      utrNumber: cleanUtr,
      amount: payAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      createdBy: req.user?.id,
    });

    // Update Loan paidAmount
    loan.paidAmount = Math.round((loan.paidAmount + payAmount) * 100) / 100;

    // Check Auto-Close condition
    if (loan.paidAmount >= loan.totalRepayment - 0.01) {
      loan.status = 'CLOSED';
      loan.closedAt = new Date();
    }

    await loan.save();

    return res.status(201).json({
      message: loan.status === 'CLOSED' ? 'Payment recorded successfully. Loan is now AUTO-CLOSED!' : 'Payment recorded successfully.',
      payment,
      loan,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate UTR Number detected.' });
    }
    return res.status(500).json({ message: 'Error recording payment.', error: error.message });
  }
});

// Admin stats overview endpoint
router.get('/stats', requireRoles('Admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();
    const statusCounts = await Loan.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const totalDisbursedAmount = await Loan.aggregate([
      { $match: { status: { $in: ['DISBURSED', 'CLOSED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.status(200).json({
      totalUsers,
      totalLoans,
      statusCounts,
      totalDisbursedAmount: totalDisbursedAmount[0]?.total || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching stats.' });
  }
});

export default router;
