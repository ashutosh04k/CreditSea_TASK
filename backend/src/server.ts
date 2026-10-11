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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Seed API endpoint for easy evaluator setup
app.post('/api/seed', async (_req, res) => {
  try {
    const created = await runSeed();
    return res.status(200).json({ message: 'Database seeded successfully!', createdCount: created.length });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to seed database.', error: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on http://localhost:${PORT}`);
});

export default app;
