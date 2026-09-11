// Daily Timetable & Schedule Planner Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getTodayDateString = () => new Date().toISOString().split('T')[0];

/**
 * Builds a balanced daily schedule combining user routine, active habits, pending tasks, and breaks.
 */
const generateBalancedSchedule = (userProfile = {}, pendingTasks = [], activeHabits = []) => {
  const wakeTime = userProfile.sleep_schedule?.wake_time || '07:30';
  const bedtime = userProfile.sleep_schedule?.bedtime || '23:00';
  const workType = userProfile.work_schedule?.type || 'standard';

  const items = [];
  let itemCounter = 1;
  const addItem = (time, title, category, duration_minutes, notes = '') => {
    items.push({
      id: `sched_${Date.now()}_${itemCounter++}`,
      time,
      title,
      category,
      duration_minutes,
      completed: false,
      skipped: false,
      notes
    });
  };

  // Morning routine & wake-up
  addItem(wakeTime, 'Gentle Morning Routine & Hydration', 'routine', 30, 'Drink a glass of water, light stretch, mindful breath');
  
  // Morning habit if available
  const morningHabit = activeHabits.find(h => h.category === 'mindfulness' || h.name.toLowerCase().includes('water') || h.name.toLowerCase().includes('meditat'));
  if (morningHabit) {
    addItem('08:00', `Habit: ${morningHabit.name}`, 'routine', 15);
  } else {
    addItem('08:00', 'Nutritious Breakfast & Mindful Start', 'meal', 30);
  }

  // Morning focus block
  if (workType !== 'flexible') {
    addItem('09:00', 'High-Priority Focus Session (Deep Work / Study)', 'work', 90, 'Tackle your most demanding task first');
  } else {
    addItem('09:30', 'Dedicated Creative or Project Work', 'work', 90);
  }

  // First priority task if available
  const highPriorityTask = pendingTasks.find(t => t.priority === 'high' || t.priority === 'urgent');
  if (highPriorityTask) {
    addItem('10:45', `Task: ${highPriorityTask.title}`, 'work', 45, highPriorityTask.description || '');
  } else {
    addItem('10:45', 'Productive Task Flow & Inbox Clearance', 'work', 45);
  }

  // Mid-day break & Lunch
  addItem('11:45', 'Mindful Screen-Free Break & Hydration', 'break', 15, 'Step away from all digital screens');
  addItem('12:15', 'Nourishing Lunch & Fresh Air Walk', 'meal', 45);

  // Afternoon block
  addItem('13:30', 'Secondary Focus Session & Collaboration', 'work', 75);

  // Physical movement / Exercise (anti-loneliness & energy)
  const fitnessHabit = activeHabits.find(h => h.category === 'fitness' || h.name.toLowerCase().includes('walk') || h.name.toLowerCase().includes('gym'));
  if (fitnessHabit) {
    addItem('15:00', `Exercise Habit: ${fitnessHabit.name}`, 'exercise', 45);
  } else {
    addItem('15:00', 'Energizing Afternoon Walk or Light Exercise', 'exercise', 30, 'Outdoor walk or gentle stretching');
  }

  // Afternoon task or hobby
  const secondTask = pendingTasks.find(t => t._id !== highPriorityTask?._id);
  if (secondTask) {
    addItem('16:00', `Task: ${secondTask.title}`, 'personal', 45);
  } else {
    addItem('16:00', 'Learning, Reading, or Creative Hobby Time', 'hobby', 45);
  }

  // Social connection or personal downtime
  addItem('17:15', 'Social Catch-Up, Call, or Unwind', 'social', 45, 'Reach out to a friend or enjoy quality downtime');

  // Evening routine & Dinner
  addItem('19:00', 'Relaxing Dinner & Personal Downtime', 'meal', 60);
  addItem('20:30', 'Gentle Decompression (Reading, Podcast, Reflection)', 'personal', 60);

  // Sleep preparation
  addItem('22:15', 'Digital Sunset & Wind-Down Routine', 'sleep', 45, 'Dim lights, disconnect from screens, prepare for restful sleep');

  return items;
};

// Get today's schedule (or auto-generate if not yet present)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const today = req.query.date || getTodayDateString();
    let schedule = await storage.findSchedule({ user_id: req.user.id, date: today });

    if (!schedule) {
      // Auto-generate initial schedule for today
      const [user, tasks, habits] = await Promise.all([
        storage.findUser({ _id: req.user.id }),
        storage.findTasks({ user_id: req.user.id, completed: false }),
        storage.findHabits({ user_id: req.user.id, active: true })
      ]);

      const items = generateBalancedSchedule(user?.profile, tasks, habits);
      schedule = await storage.saveSchedule({
        user_id: req.user.id,
        date: today,
        items
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Fetch schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Regenerate today's schedule
router.post('/regenerate', authenticateToken, async (req, res) => {
  try {
    const today = req.body.date || getTodayDateString();
    const [user, tasks, habits] = await Promise.all([
      storage.findUser({ _id: req.user.id }),
      storage.findTasks({ user_id: req.user.id, completed: false }),
      storage.findHabits({ user_id: req.user.id, active: true })
    ]);

    const items = generateBalancedSchedule(user?.profile, tasks, habits);
    const updated = await storage.saveSchedule({
      user_id: req.user.id,
      date: today,
      items
    });

    res.json({
      message: 'Schedule refreshed with personalized balance',
      schedule: updated
    });
  } catch (error) {
    console.error('Regenerate schedule error:', error);
    res.status(500).json({ error: 'Failed to regenerate schedule' });
  }
});

// Update an individual schedule item (complete, skip, edit, reschedule)
router.put('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { date, completed, skipped, title, time, notes } = req.body;
    const targetDate = date || getTodayDateString();

    const schedule = await storage.findSchedule({ user_id: req.user.id, date: targetDate });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const items = (schedule.items || []).map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          ...(completed !== undefined ? { completed } : {}),
          ...(skipped !== undefined ? { skipped } : {}),
          ...(title ? { title } : {}),
          ...(time ? { time } : {}),
          ...(notes !== undefined ? { notes } : {})
        };
      }
      return item;
    });

    const updated = await storage.saveSchedule({
      ...schedule,
      user_id: req.user.id,
      date: targetDate,
      items
    });

    res.json(updated);
  } catch (error) {
    console.error('Update schedule item error:', error);
    res.status(500).json({ error: 'Failed to update schedule item' });
  }
});

export default router;
