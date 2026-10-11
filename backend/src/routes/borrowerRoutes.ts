import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { validateBRE } from '../services/breEngine';
import { calculateLoanMath } from '../services/loanMath';
import { User } from '../models/User';
import { Loan } from '../models/Loan';

const router = Router();

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `salary-slip-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, and PNG files under 5 MB are allowed.'));
    }
  },
});

// All routes require Borrower or Admin role
router.use(authenticateToken);
router.use(requireRoles('Borrower', 'Admin'));

// POST /api/borrower/check-eligibility
router.post('/check-eligibility', async (req: AuthRequest, res: Response) => {
  try {
    const { dob, monthlySalary, pan, employmentMode } = req.body;

    const breResult = validateBRE({
      dob,
      monthlySalary: Number(monthlySalary),
      pan,
      employmentMode,
    });

    if (!breResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Engine (BRE) Eligibility Failed.',
        errors: breResult.errors,
      });
    }

    // Save personal details to user model
    await User.findByIdAndUpdate(req.user?.id, {
      dob,
      monthlySalary: Number(monthlySalary),
      pan: pan.trim().toUpperCase(),
      employmentMode,
    });

    return res.status(200).json({
      success: true,
      message: 'BRE Eligibility Passed successfully!',
      age: breResult.calculatedAge,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during BRE check.', error: error.message });
  }
});

// POST /api/borrower/upload-slip
router.post('/upload-slip', (req: AuthRequest, res: Response) => {
  upload.single('salarySlip')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      message: 'Salary slip uploaded successfully.',
      fileUrl: relativeUrl,
      originalName: req.file.originalname,
    });
  });
});

// POST /api/borrower/apply
router.post('/apply', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, tenureDays, salarySlipUrl } = req.body;

    const numAmount = Number(amount);
    const numTenure = Number(tenureDays);

    if (isNaN(numAmount) || numAmount < 50000 || numAmount > 500000) {
      return res.status(400).json({ message: 'Loan amount must be between ₹50,000 and ₹5,00,000.' });
    }

    if (isNaN(numTenure) || numTenure < 30 || numTenure > 365) {
      return res.status(400).json({ message: 'Tenure must be between 30 and 365 days.' });
    }

    // Verify User details exist & pass BRE check
    const user = await User.findById(req.user?.id);
    if (!user || !user.dob || !user.monthlySalary || !user.pan || !user.employmentMode) {
      return res.status(400).json({ message: 'Please complete Personal Details & BRE verification before applying.' });
    }

    const breCheck = validateBRE({
      dob: user.dob,
      monthlySalary: user.monthlySalary,
      pan: user.pan,
      employmentMode: user.employmentMode,
    });

    if (!breCheck.isValid) {
      return res.status(400).json({ message: 'BRE Validation Failed', errors: breCheck.errors });
    }

    // Calculate interest & total repayment using 12% p.a. formula
    const math = calculateLoanMath(numAmount, numTenure, 12);

    const newLoan = await Loan.create({
      applicant: req.user?.id,
      amount: math.principal,
      tenureDays: math.tenureDays,
      interestRate: 12,
      simpleInterest: math.simpleInterest,
      totalRepayment: math.totalRepayment,
      paidAmount: 0,
      status: 'APPLIED',
      salarySlipUrl: salarySlipUrl || '',
    });

    return res.status(201).json({
      message: 'Loan application submitted successfully in APPLIED status.',
      loan: newLoan,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error creating loan application.', error: error.message });
  }
});

// GET /api/borrower/my-loans
router.get('/my-loans', async (req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ applicant: req.user?.id }).sort({ createdAt: -1 });
    return res.status(200).json({ loans });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error fetching loans.' });
  }
});

export default router;
