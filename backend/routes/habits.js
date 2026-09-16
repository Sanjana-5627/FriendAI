// Habit Tracking Routes with Robust Streak Engine
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Calculates current and longest streak from a set of completion dates.
 * Considers yesterday and today so streaks do not prematurely drop if today isn't logged yet.
 */
const calculateStreaks = (completions = []) => {
  if (!completions || completions.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Extract unique sorted YYYY-MM-DD strings descending
  const dateSet = new Set(
    completions
      .map(c => new Date(c.date).toISOString().split('T')[0])
      .filter(Boolean)
  );

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const mostRecent = sortedDates[0];
  let currentStreak = 0;

  // Streak is alive if completed today or yesterday
  if (mostRecent === todayStr || mostRecent === yesterdayStr) {
    currentStreak = 1;
    let expectedDate = new Date(mostRecent);
    
    for (let i = 1; i < sortedDates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (sortedDates[i] === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate all-time longest streak
  let longestStreak = currentStreak;
  let running = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const d1 = new Date(sortedDates[i - 1]);
    const d2 = new Date(sortedDates[i]);
    const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 1;
    }
  }

  return {
    current: currentStreak,
    longest: Math.max(longestStreak, currentStreak)
  };
};

// Get all habits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { active, category } = req.query;
    const query = { user_id: req.user.id };
    if (active !== undefined) query.active = active === 'true';
    if (category) query.category = category;

    const habits = await storage.findHabits(query, { sort: { created_at: -1 } });

    // Recalculate streaks dynamically to ensure fresh state
    const todayStr = new Date().toISOString().split('T')[0];
    const enrichedHabits = habits.map(habit => {
      const streakInfo = calculateStreaks(habit.completions);
      const isCompletedToday = (habit.completions || []).some(
        c => new Date(c.date).toISOString().split('T')[0] === todayStr
      );
      return {
        ...habit,
        streak: streakInfo,
        completedToday: isCompletedToday
      };
    });

    res.json(enrichedHabits);
  } catch (error) {
    console.error('Fetch habits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create habit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description = '',
      category = 'health',
      frequency = 'daily',
      target_days = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    const newHabit = await storage.createHabit({
      user_id: req.user.id,
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      target_days,
      streak: { current: 0, longest: 0 },
      completions: [],
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Complete habit for today
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes = '', date } = req.body;

    const habits = await storage.findHabits({ _id: id, user_id: req.user.id });
    if (!habits || habits.length === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    const habit = habits[0];
    const targetDate = date ? new Date(date) : new Date();

    // Prevent future-date completion
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (targetDate >= tomorrow) {
      return res.status(400).json({ error: 'Cannot complete a habit for a future date.' });
    }

    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Prevent duplicate completion on the same calendar day
    const alreadyCompleted = (habit.completions || []).some(
      c => new Date(c.date).toISOString().split('T')[0] === targetDateStr
    );

    if (alreadyCompleted) {
      return res.status(400).json({ error: 'This habit has already been completed today.' });
    }

    const updatedCompletions = [...(habit.completions || []), { date: targetDate, notes }];
    const streakInfo = calculateStreaks(updatedCompletions);

    const updatedHabit = await storage.updateHabit(id, {
      completions: updatedCompletions,
      streak: streakInfo,
      updated_at: new Date()
    });

    res.json({
      ...updatedHabit,
      completedToday: true
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

// Undo habit completion (e.g. for today)
router.post('/:id/undo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const habits = await storage.findHabits({ _id: id, user_id: req.user.id });
    if (!habits || habits.length === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    const habit = habits[0];
    const targetDate = date ? new Date(date) : new Date();
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Filter out completion for this calendar date
    const updatedCompletions = (habit.completions || []).filter(
      c => new Date(c.date).toISOString().split('T')[0] !== targetDateStr
    );

    const streakInfo = calculateStreaks(updatedCompletions);

    const updatedHabit = await storage.updateHabit(id, {
      completions: updatedCompletions,
      streak: streakInfo,
      updated_at: new Date()
    });

    res.json({
      ...updatedHabit,
      completedToday: false,
      streak: streakInfo,
      message: 'Habit completion undone successfully'
    });
  } catch (error) {
    console.error('Undo habit error:', error);
    res.status(500).json({ error: 'Failed to undo habit' });
  }
});

// Update habit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };

    const habit = await storage.updateHabit(id, updates);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteHabit({ _id: id, user_id: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;
