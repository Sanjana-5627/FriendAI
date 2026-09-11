import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { storage } from './storage.js';
import { authenticateToken } from './middleware/auth.js';

// Import modular route handlers
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import wellnessRoutes from './routes/wellness.js';
import moodRoutes from './routes/mood.js';
import tasksRoutes from './routes/tasks.js';
import goalsRoutes from './routes/goals.js';
import habitsRoutes from './routes/habits.js';
import scheduleRoutes from './routes/schedule.js';
import recommendationsRoutes from './routes/recommendations.js';
import notificationsRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import exportRoutes from './routes/export.js';

dotenv.config();

const app = express();

// Connect to MongoDB with graceful fallback to In-Memory storage
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('ℹ️  No MONGODB_URI provided. Running in IN-MEMORY storage mode.');
    storage.setMongoStatus(false);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
    storage.setMongoStatus(true);
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.log('⚠️  Falling back to IN-MEMORY storage mode.');
    storage.setMongoStatus(false);
  }
};

connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 2000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many AI requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/ai/', aiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'FriendAI - Personal Wellness Companion',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    storageMode: storage.isMongoConnected ? 'MongoDB' : 'In-Memory Fallback'
  });
});

app.get('/', (req, res) => {
  res.send('FriendAI Wellness Companion API is active.');
});

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// Direct Journal Route (preserving compatibility)
app.get('/api/journal', authenticateToken, async (req, res) => {
  try {
    const entries = await storage.findJournalEntries(
      { user_id: req.user.id },
      { sort: { created_at: -1 } }
    );
    res.json(entries || []);
  } catch (error) {
    console.error('Fetch journal error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error caught:', err.message);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload size exceeds the allowable limit.' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected server error occurred.'
  });
});

// 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5002;

let server = null;
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, async () => {
    console.log(`\n🌿 FriendAI Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛡️  Security: Helmet, CORS, and Rate Limiting active`);
    console.log(`💾 Storage: ${storage.isMongoConnected ? 'MongoDB' : 'In-Memory Mode'}`);

    // Auto-seed rich demo data for instant testing
    try {
      const { seedDemoData } = await import('./utils/seedData.js');
      await seedDemoData();
    } catch (err) {
      console.warn('Auto-seed notice:', err.message);
    }
  });
}

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ Server terminated cleanly.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, server };
export default app;
