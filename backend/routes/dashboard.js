// Unified Dashboard Data Route
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getTodayDateString = () => new Date().toISOString().split('T')[0];

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();

    const [user, todayCheckIn, recentCheckIns, journalEntries, tasks, goals, habits, schedule, recommendations] = await Promise.all([
      storage.findUser({ _id: userId }),
      storage.findOneWellnessCheckIn({ user_id: userId, date: today }),
      storage.findWellnessCheckIns({ user_id: userId }, { sort: { date: -1 }, limit: 7 }),
      storage.findJournalEntries({ user_id: userId }, { sort: { created_at: -1 } }),
      storage.findTasks({ user_id: userId }, { sort: { due_date: 1, created_at: -1 } }),
      storage.findGoals({ user_id: userId, status: 'active' }, { sort: { created_at: -1 } }),
      storage.findHabits({ user_id: userId, active: true }, { sort: { created_at: -1 } }),
      storage.findSchedule({ user_id: userId, date: today }),
      storage.findRecommendations({ user_id: userId, status: 'active' }, { limit: 3 })
    ]);

    // Calculate Habit Completions today
    const habitsCompletedToday = habits.filter(h => 
      (h.completions || []).some(c => new Date(c.date).toISOString().split('T')[0] === today)
    ).length;

    // Calculate Task Metrics
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());

    // Calculate 7-Day Mood Trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const cIn = recentCheckIns.find(c => c.date === dStr);
      const jEntry = journalEntries.find(j => {
        const jDate = j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : null;
        return jDate === dStr;
      });

      const moodVal = cIn ? cIn.mood : (jEntry ? jEntry.mood_score : null);
      last7Days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dStr,
        mood: moodVal,
        hasEntry: !!moodVal
      });
    }

    const recordedMoods = last7Days.map(d => d.mood).filter(v => typeof v === 'number');
    const averageMood = recordedMoods.length > 0 
      ? Math.round((recordedMoods.reduce((a, b) => a + b, 0) / recordedMoods.length) * 10) / 10 
      : (todayCheckIn ? todayCheckIn.mood : 7.0);

    // Calculate Verified Journal / Check-In Streak
    const allDates = new Set([
      ...recentCheckIns.map(c => c.date),
      ...journalEntries.map(j => j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : null).filter(Boolean)
    ]);
    const sortedActiveDates = Array.from(allDates).sort().reverse();
    let currentStreak = 0;
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedActiveDates[0] === today || sortedActiveDates[0] === yesterdayStr) {
      currentStreak = 1;
      let checkDate = new Date(sortedActiveDates[0]);
      for (let i = 1; i < sortedActiveDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (sortedActiveDates[i] === checkDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Goals progress
    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
      : 0;

    // Comprehensive Wellness Score Calculation (0-100)
    // 1. Mood Component (25 pts): scaled from average mood (1-10)
    const moodPts = Math.round((averageMood / 10) * 25);
    // 2. Sleep Component (25 pts): ideal 7-9 hours, quality rating
    const sleepHrs = todayCheckIn ? todayCheckIn.sleep_hours : 7.5;
    const sleepPts = sleepHrs >= 7 && sleepHrs <= 9 ? 25 : (sleepHrs >= 6 ? 18 : 12);
    // 3. Habits Component (25 pts): percentage of active habits done
    const habitPts = habits.length > 0 
      ? Math.round((habitsCompletedToday / habits.length) * 25) 
      : 20;
    // 4. Activity & Social Component (25 pts)
    const socialScore = todayCheckIn?.social_interaction === 'high' ? 12 : (todayCheckIn?.social_interaction === 'moderate' ? 10 : 5);
    const activityScore = todayCheckIn?.physical_activity !== 'none' ? 13 : 5;
    const activitySocialPts = todayCheckIn ? (socialScore + activityScore) : 18;

    const overallWellnessScore = Math.min(100, Math.max(10, moodPts + sleepPts + habitPts + activitySocialPts));

    // Social Health / Anti-Loneliness Level
    let socialHealth = {
      level: 'Good',
      color: 'emerald',
      message: 'You have healthy ambient connection.'
    };
    if (todayCheckIn?.social_interaction === 'none') {
      socialHealth = {
        level: 'Needs Care',
        color: 'amber',
        message: 'No social contact logged today. Consider saying hi to a friend or taking a cafe stroll.'
      };
    } else if (todayCheckIn?.screen_time_hours >= 7) {
      socialHealth = {
        level: 'Digital Fatigue',
        color: 'rose',
        message: 'High screen time detected. Step outside for fresh air and green views.'
      };
    }

    // Dynamic AI / Algorithmic Insights
    const insights = [];
    if (habitsCompletedToday === habits.length && habits.length > 0) {
      insights.push({
        type: 'achievement',
        icon: '🌟',
        title: 'All Habits Complete!',
        message: `You completed all ${habits.length} daily habits today. Fantastic discipline!`
      });
    } else if (habitsCompletedToday > 0) {
      insights.push({
        type: 'progress',
        icon: '⚡',
        title: 'Habit Momentum',
        message: `${habitsCompletedToday} of ${habits.length} habits completed today. Keep the streak alive!`
      });
    }

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        icon: '⏰',
        title: 'Overdue Attention',
        message: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past their due date. Consider knocking one off or rescheduling.`
      });
    }

    if (todayCheckIn?.stress >= 7) {
      insights.push({
        type: 'suggestion',
        icon: '💙',
        title: 'Gentle Decompression',
        message: 'High stress level reported today. Schedule a 15-minute screen-free wind-down tonight.'
      });
    } else if (averageMood >= 8) {
      insights.push({
        type: 'positive',
        icon: '✨',
        title: 'Positive Outlook',
        message: `Your mood is shining at ${averageMood}/10! Use this elevated energy to advance your key goals.`
      });
    }

    res.json({
      greetingName: user?.name || 'Friend',
      todayCheckInCompleted: !!todayCheckIn,
      todayCheckIn,
      wellnessScore: {
        total: overallWellnessScore,
        breakdown: {
          mood: { score: moodPts, max: 25, label: 'Mood & Outlook' },
          sleep: { score: sleepPts, max: 25, label: 'Sleep & Rest' },
          habits: { score: habitPts, max: 25, label: 'Habit Discipline' },
          activityAndSocial: { score: activitySocialPts, max: 25, label: 'Activity & Connection' }
        },
        description: 'Your holistic score based on mood, restful sleep, completed habits, and real-world connection.'
      },
      socialHealth,
      stats: {
        currentStreak,
        averageMood,
        completedTasks: completedTasksCount,
        pendingTasksCount: pendingTasks.length,
        overdueTasksCount: overdueTasks.length,
        activeGoalsCount: goals.length,
        goalProgress: avgGoalProgress,
        activeHabitsCount: habits.length,
        habitsCompletedToday
      },
      moodData: last7Days,
      todaySchedule: (schedule?.items || []).slice(0, 5),
      upcomingTasks: pendingTasks.slice(0, 4),
      activeGoals: goals.slice(0, 3),
      todayHabits: habits.slice(0, 5),
      recommendations: recommendations.slice(0, 2),
      insights: insights.slice(0, 3)
    });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard data' });
  }
});

export default router;
