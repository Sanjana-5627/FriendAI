// Mood & Multi-Metric Wellness Analytics Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const daysCount = period === 'monthly' ? 30 : (period === 'all' ? 60 : 7);

    // Fetch check-ins, journal entries, tasks, and habits
    const [checkIns, journalEntries, tasks, habits] = await Promise.all([
      storage.findWellnessCheckIns({ user_id: req.user.id }, { sort: { date: -1 }, limit: daysCount }),
      storage.findJournalEntries({ user_id: req.user.id }, { sort: { created_at: -1 } }),
      storage.findTasks({ user_id: req.user.id }),
      storage.findHabits({ user_id: req.user.id, active: true })
    ]);

    // Build timeline dates (oldest to newest)
    const timeline = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const checkIn = checkIns.find(c => c.date === dateStr);
      const journalForDay = journalEntries.find(j => {
        const jDate = j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : null;
        return jDate === dateStr;
      });

      // Daily habit completions
      const habitsDone = habits.filter(h => 
        (h.completions || []).some(c => new Date(c.date).toISOString().split('T')[0] === dateStr)
      ).length;

      // Effective mood from checkIn or journalEntry
      const moodVal = checkIn ? checkIn.mood : (journalForDay ? journalForDay.mood_score : null);

      timeline.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        fullDate: dateStr,
        mood: moodVal,
        energy: checkIn ? checkIn.energy : null,
        stress: checkIn ? checkIn.stress : null,
        sleepHours: checkIn ? checkIn.sleep_hours : null,
        activityMinutes: checkIn ? checkIn.physical_activity_minutes : (checkIn?.physical_activity !== 'none' ? 25 : 0),
        socialScore: checkIn ? (checkIn.social_interaction === 'high' ? 9 : (checkIn.social_interaction === 'moderate' ? 6 : (checkIn.social_interaction === 'low' ? 3 : 1))) : null,
        screenTimeHours: checkIn ? checkIn.screen_time_hours : null,
        productivity: checkIn ? checkIn.productivity : null,
        habitsCompleted: habitsDone,
        hasEntry: !!(checkIn || journalForDay)
      });
    }

    // Extract valid non-null values for statistical summaries
    const validMoods = timeline.map(t => t.mood).filter(v => typeof v === 'number');
    const validEnergies = timeline.map(t => t.energy).filter(v => typeof v === 'number');
    const validStresses = timeline.map(t => t.stress).filter(v => typeof v === 'number');
    const validSleeps = timeline.map(t => t.sleepHours).filter(v => typeof v === 'number');
    const validProductivity = timeline.map(t => t.productivity).filter(v => typeof v === 'number');

    const avg = arr => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

    const stats = {
      averageMood: avg(validMoods),
      highestMood: validMoods.length ? Math.max(...validMoods) : 0,
      lowestMood: validMoods.length ? Math.min(...validMoods) : 0,
      averageEnergy: avg(validEnergies),
      averageStress: avg(validStresses),
      averageSleep: avg(validSleeps),
      averageProductivity: avg(validProductivity),
      totalEntries: validMoods.length
    };

    // Calculate Correlation & Pattern Insights (Clearly labeled as patterns, never medical causation)
    const patterns = [];

    // Exercise vs Mood pattern
    const activeDays = timeline.filter(t => t.activityMinutes > 15 && t.mood !== null);
    const inactiveDays = timeline.filter(t => t.activityMinutes <= 15 && t.mood !== null);
    if (activeDays.length > 0 && inactiveDays.length > 0) {
      const activeAvg = avg(activeDays.map(d => d.mood));
      const inactiveAvg = avg(inactiveDays.map(d => d.mood));
      if (activeAvg > inactiveAvg) {
        patterns.push({
          type: 'positive',
          title: 'Movement & Mood Pattern',
          observation: `Your recorded mood averages ${activeAvg}/10 on days with physical activity versus ${inactiveAvg}/10 on restful days.`,
          suggestion: 'Regular light movement shows a positive correlation with your emotional outlook.'
        });
      }
    }

    // Sleep vs Productivity pattern
    const goodSleepDays = timeline.filter(t => t.sleepHours >= 7 && t.productivity !== null);
    const lowSleepDays = timeline.filter(t => t.sleepHours < 7 && t.productivity !== null);
    if (goodSleepDays.length > 0 && lowSleepDays.length > 0) {
      const goodSleepProd = avg(goodSleepDays.map(d => d.productivity));
      const lowSleepProd = avg(lowSleepDays.map(d => d.productivity));
      if (goodSleepProd > lowSleepProd) {
        patterns.push({
          type: 'insight',
          title: 'Sleep & Focus Correlation',
          observation: `Your productivity score averaged ${goodSleepProd}/10 following 7+ hours of sleep compared to ${lowSleepProd}/10 with less rest.`,
          suggestion: 'Prioritizing a consistent sleep routine directly supports your daily focus.'
        });
      }
    }

    // Screen Time vs Stress pattern
    const highScreenDays = timeline.filter(t => t.screenTimeHours >= 6 && t.stress !== null);
    const lowScreenDays = timeline.filter(t => t.screenTimeHours < 6 && t.stress !== null);
    if (highScreenDays.length > 0 && lowScreenDays.length > 0) {
      const highStress = avg(highScreenDays.map(d => d.stress));
      const lowStress = avg(lowScreenDays.map(d => d.stress));
      if (highStress > lowStress) {
        patterns.push({
          type: 'caution',
          title: 'Screen Time & Stress Rhythm',
          observation: `Days with 6+ hours of screen time showed higher stress levels (${highStress}/10 vs ${lowStress}/10).`,
          suggestion: 'Short hourly micro-breaks from displays can mitigate digital fatigue.'
        });
      }
    }

    // Social Interaction pattern
    const socialDays = timeline.filter(t => t.socialScore >= 6 && t.mood !== null);
    if (socialDays.length > 0) {
      const socialMood = avg(socialDays.map(d => d.mood));
      if (socialMood >= 6.5) {
        patterns.push({
          type: 'social',
          title: 'Social Connection Anchor',
          observation: `Connecting with friends or family aligns with your highest mood ratings (${socialMood}/10).`,
          suggestion: 'Scheduling regular catch-ups provides an emotional lift.'
        });
      }
    }

    res.json({
      period,
      timeline,
      stats,
      patterns,
      disclaimer: "These observations are statistical habit correlations to support personal self-reflection, not clinical or medical diagnostics."
    });
  } catch (error) {
    console.error('Mood analytics error:', error);
    res.status(500).json({ error: 'Failed to generate wellness analytics' });
  }
});

export default router;
