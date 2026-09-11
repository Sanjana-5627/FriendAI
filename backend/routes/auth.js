// Authentication routes
import express from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await storage.findUser({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await storage.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profile: {
        age_range: '25-34',
        interests: ['reading', 'walking', 'mindfulness'],
        hobbies: ['nature', 'creative writing'],
        sleep_schedule: { bedtime: '23:00', wake_time: '07:00', typical_hours: 8 },
        work_schedule: { type: 'standard', start_time: '09:00', end_time: '17:00' },
        fitness_level: 'moderate',
        social_preferences: 'ambivert',
        personal_goals_summary: 'Build healthy daily routines and stay energized.',
        preferred_activities: ['park walks', 'cozy cafe work', 'reading'],
        dietary_preferences: '',
        location: { enabled: false, city: 'Local Area', area: '' },
        notification_settings: {
          daily_checkin: true,
          habit_reminders: true,
          task_reminders: true,
          wellness_breaks: true
        }
      },
      created_at: new Date(),
      updated_at: new Date()
    });

    const userId = (newUser._id || newUser.id).toString();
    const token = generateToken(userId, newUser.email);

    const safeUser = {
      id: userId,
      _id: userId,
      name: newUser.name,
      email: newUser.email,
      profile: newUser.profile,
      created_at: newUser.created_at
    };

    res.status(201).json({
      token,
      user: safeUser,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await storage.findUser({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = (user._id || user.id).toString();
    await storage.updateUser(userId, { updated_at: new Date() });

    const token = generateToken(userId, user.email);

    const safeUser = {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      profile: user.profile,
      created_at: user.created_at
    };

    res.json({
      token,
      user: safeUser,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please check credentials.' });
  }
});

// Get current authenticated user details
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await storage.findUser({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const safeUser = {
      id: (user._id || user.id).toString(),
      _id: (user._id || user.id).toString(),
      name: user.name,
      email: user.email,
      profile: user.profile,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({ user: safeUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

export default router;
