// Daily Wellness Check-In & Digital Wellness Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Submit or update Daily Wellness Check-in
router.post('/check-in', authenticateToken, async (req, res) => {
  try {
    const {
      mood,
      energy = 5,
      stress = 5,
      sleep_hours = 7,
      sleep_quality = 'good',
      physical_activity = 'light_walk',
      physical_activity_minutes = 20,
      social_interaction = 'moderate',
      screen_time_hours = 4,
      productive_screen_hours = 3,
      productivity = 6,
      notes = ''
    } = req.body;

    if (mood === undefined || mood === null) {
      return res.status(400).json({ error: 'Mood score (1-10) is required' });
    }

    const parsedMood = Math.min(10, Math.max(1, Number(mood)));
    const today = req.body.date || getTodayDateString();

    const checkInData = {
      user_id: req.user.id,
      date: today,
      mood: parsedMood,
      energy: Math.min(10, Math.max(1, Number(energy))),
      stress: Math.min(10, Math.max(1, Number(stress))),
      sleep_hours: Math.min(24, Math.max(0, Number(sleep_hours))),
      sleep_quality,
      physical_activity,
      physical_activity_minutes: Number(physical_activity_minutes) || 0,
      social_interaction,
      screen_time_hours: Math.min(24, Math.max(0, Number(screen_time_hours))),
      productive_screen_hours: Math.min(24, Math.max(0, Number(productive_screen_hours))),
      productivity: Math.min(10, Math.max(1, Number(productivity))),
      notes: (notes || '').trim()
    };

    const savedCheckIn = await storage.saveWellnessCheckIn(checkInData);

    // Also trigger an automatic wellness insight/recommendation if stress is high or social is none
    if (checkInData.stress >= 7 || checkInData.social_interaction === 'none' || checkInData.screen_time_hours > 7) {
      try {
        let recTitle = "Take a Gentle Screen Break";
        let recDesc = "You logged high screen time today. Consider a 15-minute nature walk or screen-free stretching.";
        let recType = "wellness_break";

        if (checkInData.social_interaction === 'none') {
          recTitle = "Connect with Someone You Value";
          recDesc = "You reported low social connection today. A quick call or message to a friend can brighten your evening.";
          recType = "anti_loneliness";
        } else if (checkInData.stress >= 7) {
          recTitle = "Evening Stress Decompression";
          recDesc = "High stress noted today. Try 10 minutes of box breathing or listening to calming music before bed.";
          recType = "wellness_break";
        }

        await storage.createRecommendation({
          user_id: req.user.id,
          type: recType,
          title: recTitle,
          description: recDesc,
          category: 'wellness',
          status: 'active'
        });
      } catch (recErr) {
        console.warn('Recommendation creation error:', recErr.message);
      }
    }

    res.status(201).json({
      message: 'Daily wellness check-in saved successfully',
      checkIn: savedCheckIn
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to save daily check-in' });
  }
});

// Check if today's check-in has been completed
router.get('/check-in/today', authenticateToken, async (req, res) => {
  try {
    const today = getTodayDateString();
    const checkIn = await storage.findOneWellnessCheckIn({
      user_id: req.user.id,
      date: today
    });

    res.json({
      completed: !!checkIn,
      checkIn: checkIn || null
    });
  } catch (error) {
    console.error('Check-in status error:', error);
    res.status(500).json({ error: 'Failed to retrieve check-in status' });
  }
});

// Get wellness history (for analytics and trends)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const history = await storage.findWellnessCheckIns(
      { user_id: req.user.id },
      { sort: { date: -1 }, limit: days }
    );

    res.json(history || []);
  } catch (error) {
    console.error('Wellness history error:', error);
    res.status(500).json({ error: 'Failed to fetch wellness history' });
  }
});

// Log Digital Wellness & Screen Time
router.post('/digital', authenticateToken, async (req, res) => {
  try {
    const { total_hours, productive_hours, social_media_hours, notes } = req.body;
    const today = getTodayDateString();

    const existingCheckIn = await storage.findOneWellnessCheckIn({
      user_id: req.user.id,
      date: today
    });

    if (existingCheckIn) {
      await storage.saveWellnessCheckIn({
        ...existingCheckIn,
        screen_time_hours: Number(total_hours) || existingCheckIn.screen_time_hours,
        productive_screen_hours: Number(productive_hours) || existingCheckIn.productive_screen_hours
      });
    }

    res.json({
      message: 'Screen time recorded successfully',
      total_hours: Number(total_hours),
      productive_hours: Number(productive_hours)
    });
  } catch (error) {
    console.error('Digital wellness error:', error);
    res.status(500).json({ error: 'Failed to record digital wellness data' });
  }
});

export default router;
