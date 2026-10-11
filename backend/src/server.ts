import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import borrowerRoutes from './routes/borrowerRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { runSeed } from './seed/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes - mounted at both /api and root to handle any URL structure
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/borrower', borrowerRoutes);
app.use('/borrower', borrowerRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

// Seed API endpoint for easy evaluator setup (supported at both /seed and /api/seed)
const handleSeed = async (_req: express.Request, res: express.Response) => {
  try {
    const created = await runSeed();
    return res.status(200).json({ message: 'Database seeded successfully!', createdCount: created.length });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to seed database.', error: error.message });
  }
};
app.post('/api/seed', handleSeed);
app.post('/seed', handleSeed);

// Health check (supported at both /health and /api/health)
const handleHealth = (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on http://localhost:${PORT}`);
});

export default app;
