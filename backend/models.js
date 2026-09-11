import mongoose from 'mongoose';

// User Schema with comprehensive privacy-conscious Wellness Profile
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    age_range: {
      type: String,
      enum: ['under_18', '18-24', '25-34', '35-44', '45-54', '55+', 'prefer_not_to_say'],
      default: '25-34'
    },
    interests: {
      type: [String],
      default: ['reading', 'walking', 'mindfulness']
    },
    hobbies: {
      type: [String],
      default: ['nature', 'creative writing', 'podcasts']
    },
    sleep_schedule: {
      bedtime: { type: String, default: '23:00' },
      wake_time: { type: String, default: '07:00' },
      typical_hours: { type: Number, default: 8 }
    },
    work_schedule: {
      type: { type: String, default: 'standard' }, // standard, flexible, student, shift, other
      start_time: { type: String, default: '09:00' },
      end_time: { type: String, default: '17:00' }
    },
    fitness_level: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very_active'],
      default: 'moderate'
    },
    social_preferences: {
      type: String,
      enum: ['introvert', 'ambivert', 'extrovert'],
      default: 'ambivert'
    },
    personal_goals_summary: {
      type: String,
      default: 'Build healthy daily routines, reduce screen fatigue, and stay energized.'
    },
    preferred_activities: {
      type: [String],
      default: ['park walks', 'cozy cafe work', 'reading', 'home workouts']
    },
    dietary_preferences: {
      type: String,
      default: ''
    },
    location: {
      enabled: { type: Boolean, default: false },
      city: { type: String, default: 'Local Area' },
      area: { type: String, default: '' }
    },
    notification_settings: {
      daily_checkin: { type: Boolean, default: true },
      habit_reminders: { type: Boolean, default: true },
      task_reminders: { type: Boolean, default: true },
      wellness_breaks: { type: Boolean, default: true }
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transcription: {
    type: String,
    required: true
  },
  ai_response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  mood_score: {
    type: Number,
    min: 1,
    max: 10
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Daily Wellness Check-In Schema
const wellnessCheckInSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  energy: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  stress: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  sleep_hours: {
    type: Number,
    min: 0,
    max: 24,
    default: 7
  },
  sleep_quality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent'],
    default: 'good'
  },
  physical_activity: {
    type: String,
    enum: ['none', 'light_walk', 'moderate_workout', 'intense_training'],
    default: 'light_walk'
  },
  physical_activity_minutes: {
    type: Number,
    default: 20
  },
  social_interaction: {
    type: String,
    enum: ['none', 'low', 'moderate', 'high'],
    default: 'moderate'
  },
  screen_time_hours: {
    type: Number,
    min: 0,
    max: 24,
    default: 4
  },
  productive_screen_hours: {
    type: Number,
    min: 0,
    max: 24,
    default: 3
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10,
    default: 6
  },
  notes: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

wellnessCheckInSchema.index({ user_id: 1, date: 1 }, { unique: true });

// Task Schema
const taskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  due_date: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'study', 'wellness', 'personal', 'chores'],
    default: 'personal'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completed_at: {
    type: Date,
    default: null
  },
  goal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Goal Schema
const goalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['health', 'career', 'personal', 'financial', 'relationships', 'learning', 'wellness', 'other'],
    default: 'personal'
  },
  target_date: {
    type: Date,
    default: null
  },
  milestones: [{
    title: String,
    completed: { type: Boolean, default: false },
    completed_at: Date
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  completed_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Habit Schema
const habitSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['health', 'mindfulness', 'fitness', 'productivity', 'social', 'learning', 'routine'],
    default: 'health'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  target_days: {
    type: [String],
    default: []
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 }
  },
  completions: [{
    date: { type: Date, required: true },
    notes: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Daily Timetable Schedule Schema
const dailyScheduleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  items: [{
    id: { type: String, required: true },
    time: { type: String, required: true }, // e.g. "08:30"
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['work', 'break', 'meal', 'exercise', 'personal', 'social', 'hobby', 'sleep', 'routine'],
      default: 'personal'
    },
    duration_minutes: { type: Number, default: 30 },
    completed: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    notes: { type: String, default: '' }
  }],
  generated_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

dailyScheduleSchema.index({ user_id: 1, date: 1 }, { unique: true });

// Structured Recommendation Schema
const recommendationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['anti_loneliness', 'activity', 'place', 'wellness_break', 'routine_balance'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'wellness'
  },
  action_type: {
    type: String, // 'add_task', 'add_schedule', 'open_link', 'explore_places'
    default: 'add_task'
  },
  action_payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'accepted', 'completed', 'dismissed'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// In-App Notification Schema
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['checkin', 'habit', 'task', 'goal', 'wellness', 'anti_loneliness'],
    default: 'wellness'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for high-performance querying
journalEntrySchema.index({ user_id: 1, created_at: -1 });
taskSchema.index({ user_id: 1, completed: 1, due_date: 1 });
goalSchema.index({ user_id: 1, status: 1 });
habitSchema.index({ user_id: 1, active: 1 });
recommendationSchema.index({ user_id: 1, status: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });

export const User = mongoose.model('User', userSchema);
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export const WellnessCheckIn = mongoose.model('WellnessCheckIn', wellnessCheckInSchema);
export const Task = mongoose.model('Task', taskSchema);
export const Goal = mongoose.model('Goal', goalSchema);
export const Habit = mongoose.model('Habit', habitSchema);
export const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);
export const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
