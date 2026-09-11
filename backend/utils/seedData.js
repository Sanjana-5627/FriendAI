// Demo Data Seeder for FriendAI
import bcrypt from 'bcryptjs';
import storage from '../storage.js';

export const seedDemoData = async () => {
  try {
    const existingUser = await storage.findUser({ email: 'demo@friendai.com' });
    if (existingUser) {
      console.log('ℹ️  Demo account already exists (demo@friendai.com).');
      return existingUser;
    }

    console.log('🌱 Seeding rich demo dataset for FriendAI...');

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash('demo123', saltRounds);

    // 1. Create User with Rich Profile
    const demoUser = await storage.createUser({
      name: 'Alex Taylor',
      email: 'demo@friendai.com',
      password: hashedPassword,
      profile: {
        age_range: '25-34',
        sleep_schedule: { bedtime: '23:00', wake_time: '07:00', typical_hours: 8 },
        work_schedule: { type: 'standard', start_time: '09:00', end_time: '17:30' },
        fitness_level: 'moderate',
        social_preferences: 'balanced',
        interests: ['Reading', 'Hiking', 'Coffee', 'Photography'],
        hobbies: ['Nature walks', 'Cozy cafes', 'Library visits', 'Bouldering'],
        personal_goals_summary: 'Reduce screen time, walk 8,000 steps daily, and sleep 8 hours.',
        preferred_activities: ['Nature walks', 'Cozy cafes', 'Library visits', 'Bouldering'],
        dietary_preferences: 'Plant-forward & Mediterranean',
        location: { enabled: true, city: 'Metro Area', area: 'Downtown' },
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

    const userId = (demoUser._id || demoUser.id).toString();

    // 2. Seed 7 Days of Multi-Metric Wellness Check-Ins (for rich analytics trends)
    const checkInData = [
      { daysAgo: 6, mood: 6, energy: 5, stress: 7, sleep: 6.5, sleepQ: 'fair', activity: 15, actLevel: 'light', social: 4, socialLevel: 'low', screen: 6.5, prodScreen: 4, prod: 6, note: 'Tough workday, high screen time, felt tired by evening.' },
      { daysAgo: 5, mood: 7, energy: 7, stress: 5, sleep: 7.5, sleepQ: 'good', activity: 40, actLevel: 'moderate', social: 7, socialLevel: 'moderate', screen: 4.0, prodScreen: 3.5, prod: 8, note: 'Productive day, evening walk helped clear my mind.' },
      { daysAgo: 4, mood: 8, energy: 8, stress: 3, sleep: 8.0, sleepQ: 'excellent', activity: 45, actLevel: 'moderate', social: 8, socialLevel: 'high', screen: 3.5, prodScreen: 3, prod: 9, note: 'Felt very energized! Slept 8 hours and cooked healthy lunch.' },
      { daysAgo: 3, mood: 6, energy: 6, stress: 6, sleep: 6.0, sleepQ: 'poor', activity: 20, actLevel: 'light', social: 4, socialLevel: 'low', screen: 5.5, prodScreen: 3, prod: 6, note: 'Slept late watching series. Low energy in morning.' },
      { daysAgo: 2, mood: 8, energy: 7, stress: 4, sleep: 7.5, sleepQ: 'good', activity: 35, actLevel: 'moderate', social: 7, socialLevel: 'moderate', screen: 3.0, prodScreen: 2.5, prod: 8, note: 'Met a friend at coffee shop. Great conversation.' },
      { daysAgo: 1, mood: 9, energy: 9, stress: 2, sleep: 8.5, sleepQ: 'excellent', activity: 60, actLevel: 'high', social: 9, socialLevel: 'high', screen: 2.5, prodScreen: 2, prod: 9, note: 'Weekend hike in the state park! Refreshed and happy.' },
      { daysAgo: 0, mood: 8, energy: 8, stress: 3, sleep: 7.5, sleepQ: 'good', activity: 30, actLevel: 'moderate', social: 6, socialLevel: 'moderate', screen: 3.0, prodScreen: 2.5, prod: 8, note: 'Started with morning sunlight and hydration. Feeling centered.' }
    ];

    for (const c of checkInData) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - c.daysAgo);
      const dateStr = targetDate.toISOString().split('T')[0];

      await storage.saveWellnessCheckIn({
        user_id: userId,
        date: dateStr,
        mood: c.mood,
        energy: c.energy,
        stress: c.stress,
        sleep_hours: c.sleep,
        sleep_quality: c.sleepQ,
        physical_activity: c.actLevel,
        physical_activity_minutes: c.activity,
        social_interaction: c.socialLevel,
        screen_time_hours: c.screen,
        productive_screen_hours: c.prodScreen,
        productivity: c.prod,
        notes: c.note
      });
    }

    // 3. Seed Habits with Running Streaks & History
    const habitsList = [
      {
        name: 'Morning Sunlight & Walk',
        description: 'Get 15-20 mins natural light and walk right after waking',
        frequency: 'daily',
        category: 'health',
        streak: { current: 6, longest: 14 },
        completionsCount: 6
      },
      {
        name: '10-Minute Mindful Breathing',
        description: 'Quiet breathing session before starting deep work',
        frequency: 'daily',
        category: 'mindfulness',
        streak: { current: 5, longest: 10 },
        completionsCount: 5
      },
      {
        name: 'Hydrate 2.5L Throughout Day',
        description: 'Keep water bottle at desk and sip consistently',
        frequency: 'daily',
        category: 'wellness',
        streak: { current: 7, longest: 21 },
        completionsCount: 7
      },
      {
        name: 'No Screen 30m Before Sleep',
        description: 'Read a physical book to prepare for deep sleep',
        frequency: 'daily',
        category: 'productivity',
        streak: { current: 4, longest: 9 },
        completionsCount: 4
      }
    ];

    for (const h of habitsList) {
      const completions = [];
      for (let i = h.completionsCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        completions.push({
          date: d,
          notes: 'Daily habit completed'
        });
      }

      await storage.createHabit({
        user_id: userId,
        name: h.name,
        description: h.description,
        frequency: h.frequency,
        category: h.category,
        streak: h.streak,
        completions: completions,
        is_active: true
      });
    }

    // 4. Seed Tasks with Priorities & Due Dates
    const tasksList = [
      {
        title: 'Morning 20-minute jog & stretch',
        description: 'Light jog around neighborhood park',
        category: 'health',
        priority: 'medium',
        completed: true,
        due_date: new Date()
      },
      {
        title: 'Call Maya for weekend catch-up',
        description: 'Catch up over phone and schedule a Saturday walk',
        category: 'social',
        priority: 'medium',
        completed: false,
        due_date: new Date()
      },
      {
        title: 'Review quarterly personal wellness milestones',
        description: 'Check sleep patterns and update personal goals',
        category: 'wellness',
        priority: 'high',
        completed: false,
        due_date: new Date(Date.now() + 86400000)
      },
      {
        title: 'Plan healthy Mediterranean meal prep',
        description: 'Get fresh greens, olive oil, and legumes',
        category: 'wellness',
        priority: 'low',
        completed: false,
        due_date: new Date(Date.now() + 172800000)
      }
    ];

    for (const t of tasksList) {
      await storage.createTask({
        user_id: userId,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        completed: t.completed,
        due_date: t.due_date
      });
    }

    // 5. Seed Goals with Milestones & Progress
    const goalsList = [
      {
        title: 'Build an Energizing Morning Routine',
        category: 'Health',
        deadline: new Date(Date.now() + 30 * 86400000),
        progress: 66,
        milestones: [
          { title: 'Wake at 7:00 AM consistently for 7 days', completed: true },
          { title: '15-min sunlight walk before looking at phone', completed: true },
          { title: 'High-protein wholesome breakfast', completed: false }
        ]
      },
      {
        title: 'Read 12 Books This Year',
        category: 'Personal Growth',
        deadline: new Date(Date.now() + 120 * 86400000),
        progress: 50,
        milestones: [
          { title: 'Complete first 3 books (Jan-Mar)', completed: true },
          { title: 'Complete books 4-6 (Apr-Jun)', completed: true },
          { title: 'Join a local monthly book discussion group', completed: false }
        ]
      },
      {
        title: 'Run a 5K Race Comfortably',
        category: 'Fitness',
        deadline: new Date(Date.now() + 60 * 86400000),
        progress: 35,
        milestones: [
          { title: 'Run 2K without stopping', completed: true },
          { title: 'Run 3.5K interval pace', completed: false },
          { title: 'Register for community 5K fun run', completed: false }
        ]
      }
    ];

    for (const g of goalsList) {
      await storage.createGoal({
        user_id: userId,
        title: g.title,
        category: g.category,
        deadline: g.deadline,
        progress: g.progress,
        milestones: g.milestones,
        status: 'active'
      });
    }

    // 6. Seed Today's Daily Schedule (Timetable)
    const todayStr = new Date().toISOString().split('T')[0];

    await storage.saveSchedule({
      user_id: userId,
      date: todayStr,
      generatedBy: 'ai',
      items: [
        { id: 'sched_1', startTime: '07:00', endTime: '08:00', title: 'Morning Sunlight Walk & Hydration', category: 'exercise', completed: true },
        { id: 'sched_2', startTime: '08:00', endTime: '09:00', title: 'Wholesome Breakfast & Reflection', category: 'meal', completed: true },
        { id: 'sched_3', startTime: '09:00', endTime: '12:30', title: 'Deep Focus Work / Project Architecture', category: 'work', completed: false },
        { id: 'sched_4', startTime: '12:30', endTime: '13:30', title: 'Nutritious Lunch & Outdoor Fresh Air', category: 'break', completed: false },
        { id: 'sched_5', startTime: '13:30', endTime: '17:00', title: 'Afternoon Productive Flow & Quick Stretch', category: 'work', completed: false },
        { id: 'sched_6', startTime: '17:30', endTime: '18:30', title: 'Social Call or Sunset Neighborhood Stroll', category: 'social', completed: false },
        { id: 'sched_7', startTime: '19:00', endTime: '20:00', title: 'Balanced Dinner & Relaxed Conversation', category: 'meal', completed: false },
        { id: 'sched_8', startTime: '21:30', endTime: '22:30', title: 'Wind-Down Reading & Restful Sleep Prep', category: 'sleep', completed: false }
      ]
    });

    // 7. Seed Notifications & Reminders
    await storage.createNotification({
      user_id: userId,
      title: 'Streak Record!',
      message: 'Great job keeping your morning walk streak alive — 6 consecutive days!',
      type: 'habit',
      read: false
    });

    await storage.createNotification({
      user_id: userId,
      title: 'Hydration Check',
      message: 'Remember to pause, stretch your posture, and drink a glass of water.',
      type: 'reminder',
      read: false
    });

    console.log('✅ Demo dataset seeded successfully: demo@friendai.com / demo123');
    return demoUser;
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
