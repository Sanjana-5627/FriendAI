// Storage abstraction layer - works with both MongoDB and in-memory storage
import mongoose from 'mongoose';

class StorageAdapter {
  constructor() {
    this.isMongoConnected = false;
    this.inMemory = {
      users: new Map(),
      journalEntries: new Map(),
      wellnessCheckIns: new Map(),
      tasks: new Map(),
      goals: new Map(),
      habits: new Map(),
      dailySchedules: new Map(),
      recommendations: new Map(),
      notifications: new Map(),
      idCounters: {
        users: 1,
        journalEntries: 1,
        wellnessCheckIns: 1,
        tasks: 1,
        goals: 1,
        habits: 1,
        dailySchedules: 1,
        recommendations: 1,
        notifications: 1
      }
    };
  }

  setMongoStatus(status) {
    this.isMongoConnected = status;
  }

  generateId(type) {
    return `mem_${type}_${this.inMemory.idCounters[type]++}`;
  }

  // User operations
  async findUser(query) {
    if (this.isMongoConnected) {
      const { User } = await import('./models.js');
      return await User.findOne(query);
    }
    
    // In-memory fallback
    if (query.email) {
      for (const [id, user] of this.inMemory.users) {
        if (user.email === query.email) {
          return { ...user, _id: id, id: id };
        }
      }
    }
    if (query._id) {
      const user = this.inMemory.users.get(String(query._id));
      return user ? { ...user, _id: query._id, id: query._id } : null;
    }
    return null;
  }

  async createUser(userData) {
    if (this.isMongoConnected) {
      const { User } = await import('./models.js');
      return await User.create(userData);
    }
    
    // In-memory fallback
    const id = this.generateId('users');
    const user = { ...userData, _id: id, id: id };
    this.inMemory.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    if (this.isMongoConnected) {
      const { User } = await import('./models.js');
      return await User.findByIdAndUpdate(id, updates, { new: true });
    }
    
    // In-memory fallback
    const strId = String(id);
    const user = this.inMemory.users.get(strId);
    if (user) {
      // Deep merge for profile object if provided
      if (updates.profile && user.profile) {
        updates.profile = { ...user.profile, ...updates.profile };
      }
      Object.assign(user, updates);
      this.inMemory.users.set(strId, user);
      return { ...user, _id: strId, id: strId };
    }
    return null;
  }

  async deleteUserData(userId) {
    const strUserId = String(userId);
    if (this.isMongoConnected) {
      const { User, JournalEntry, WellnessCheckIn, Task, Goal, Habit, DailySchedule, Recommendation, Notification } = await import('./models.js');
      await Promise.all([
        User.deleteOne({ _id: userId }),
        JournalEntry.deleteMany({ user_id: userId }),
        WellnessCheckIn.deleteMany({ user_id: userId }),
        Task.deleteMany({ user_id: userId }),
        Goal.deleteMany({ user_id: userId }),
        Habit.deleteMany({ user_id: userId }),
        DailySchedule.deleteMany({ user_id: userId }),
        Recommendation.deleteMany({ user_id: userId }),
        Notification.deleteMany({ user_id: userId })
      ]);
      return true;
    }

    // In-memory cleanup
    this.inMemory.users.delete(strUserId);
    for (const [id, item] of this.inMemory.journalEntries) if (String(item.user_id) === strUserId) this.inMemory.journalEntries.delete(id);
    for (const [id, item] of this.inMemory.wellnessCheckIns) if (String(item.user_id) === strUserId) this.inMemory.wellnessCheckIns.delete(id);
    for (const [id, item] of this.inMemory.tasks) if (String(item.user_id) === strUserId) this.inMemory.tasks.delete(id);
    for (const [id, item] of this.inMemory.goals) if (String(item.user_id) === strUserId) this.inMemory.goals.delete(id);
    for (const [id, item] of this.inMemory.habits) if (String(item.user_id) === strUserId) this.inMemory.habits.delete(id);
    for (const [id, item] of this.inMemory.dailySchedules) if (String(item.user_id) === strUserId) this.inMemory.dailySchedules.delete(id);
    for (const [id, item] of this.inMemory.recommendations) if (String(item.user_id) === strUserId) this.inMemory.recommendations.delete(id);
    for (const [id, item] of this.inMemory.notifications) if (String(item.user_id) === strUserId) this.inMemory.notifications.delete(id);
    return true;
  }

  // Journal operations
  async findJournalEntries(query, options = {}) {
    if (this.isMongoConnected) {
      const { JournalEntry } = await import('./models.js');
      let q = JournalEntry.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.select) q = q.select(options.select);
      return await q.lean();
    }
    
    let entries = Array.from(this.inMemory.journalEntries.entries())
      .map(([id, entry]) => ({ ...entry, _id: id, id: id }));
    
    if (query.user_id) {
      const queryUserId = String(query.user_id);
      entries = entries.filter(e => String(e.user_id) === queryUserId);
    }
    if (query.transcription?.$regex) {
      const regex = new RegExp(query.transcription.$regex);
      entries = entries.filter(e => regex.test(e.transcription));
    }
    if (query.mood_score?.$ne !== undefined) {
      entries = entries.filter(e => e.mood_score !== query.mood_score.$ne);
    }
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      entries.sort((a, b) => {
        if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
      });
    }
    
    return entries;
  }

  async createJournalEntry(entryData) {
    if (this.isMongoConnected) {
      const { JournalEntry } = await import('./models.js');
      return await JournalEntry.create(entryData);
    }
    
    const id = this.generateId('journalEntries');
    const entry = { ...entryData, _id: id, id: id };
    this.inMemory.journalEntries.set(id, entry);
    return entry;
  }

  async deleteJournalEntry(query) {
    if (this.isMongoConnected) {
      const { JournalEntry } = await import('./models.js');
      return await JournalEntry.deleteOne(query);
    }
    if (query._id) {
      const item = this.inMemory.journalEntries.get(String(query._id));
      if (item && (!query.user_id || String(item.user_id) === String(query.user_id))) {
        this.inMemory.journalEntries.delete(String(query._id));
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  // Wellness Check-In operations
  async findWellnessCheckIns(query, options = {}) {
    if (this.isMongoConnected) {
      const { WellnessCheckIn } = await import('./models.js');
      let q = WellnessCheckIn.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.limit) q = q.limit(options.limit);
      return await q.lean();
    }
    
    let list = Array.from(this.inMemory.wellnessCheckIns.entries())
      .map(([id, item]) => ({ ...item, _id: id, id: id }));
    
    if (query.user_id) {
      const queryUserId = String(query.user_id);
      list = list.filter(item => String(item.user_id) === queryUserId);
    }
    if (query.date) {
      list = list.filter(item => item.date === query.date);
    }

    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      list.sort((a, b) => {
        if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
      });
    }

    if (options.limit) {
      list = list.slice(0, options.limit);
    }
    
    return list;
  }

  async findOneWellnessCheckIn(query) {
    const list = await this.findWellnessCheckIns(query, { limit: 1 });
    return list.length > 0 ? list[0] : null;
  }

  async saveWellnessCheckIn(data) {
    const query = { user_id: data.user_id, date: data.date };
    if (this.isMongoConnected) {
      const { WellnessCheckIn } = await import('./models.js');
      return await WellnessCheckIn.findOneAndUpdate(query, data, { upsert: true, new: true });
    }

    // In-memory upsert
    const existing = await this.findOneWellnessCheckIn(query);
    if (existing) {
      const id = String(existing._id);
      const updated = { ...existing, ...data, updated_at: new Date() };
      this.inMemory.wellnessCheckIns.set(id, updated);
      return updated;
    }

    const id = this.generateId('wellnessCheckIns');
    const checkIn = { ...data, _id: id, id: id, created_at: new Date() };
    this.inMemory.wellnessCheckIns.set(id, checkIn);
    return checkIn;
  }

  // Task operations
  async findTasks(query, options = {}) {
    if (this.isMongoConnected) {
      const { Task } = await import('./models.js');
      let q = Task.find(query);
      if (options.sort) q = q.sort(options.sort);
      return await q.lean();
    }
    
    let tasks = Array.from(this.inMemory.tasks.entries())
      .map(([id, task]) => ({ ...task, _id: id, id: id }));
    
    if (query._id || query.id) {
      const targetId = String(query._id || query.id);
      tasks = tasks.filter(t => String(t._id) === targetId || String(t.id) === targetId);
    }
    if (query.user_id) {
      const queryUserId = String(query.user_id);
      tasks = tasks.filter(t => String(t.user_id) === queryUserId);
    }
    if (query.completed !== undefined) {
      tasks = tasks.filter(t => t.completed === query.completed);
    }
    if (query.goal_id) {
      tasks = tasks.filter(t => String(t.goal_id) === String(query.goal_id));
    }
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      tasks.sort((a, b) => {
        if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
      });
    }
    
    return tasks;
  }

  async findTask(query) {
    if (this.isMongoConnected) {
      const { Task } = await import('./models.js');
      return await Task.findOne(query);
    }
    
    if (query._id) {
      const task = this.inMemory.tasks.get(String(query._id));
      if (task && (!query.user_id || String(task.user_id) === String(query.user_id))) {
        return { ...task, _id: query._id, id: query._id };
      }
    }
    return null;
  }

  async createTask(taskData) {
    if (this.isMongoConnected) {
      const { Task } = await import('./models.js');
      return await Task.create(taskData);
    }
    
    const id = this.generateId('tasks');
    const task = { ...taskData, _id: id, id: id };
    this.inMemory.tasks.set(id, task);
    return task;
  }

  async updateTask(id, updates) {
    if (this.isMongoConnected) {
      const { Task } = await import('./models.js');
      return await Task.findByIdAndUpdate(id, updates, { new: true });
    }
    
    const strId = String(id);
    const task = this.inMemory.tasks.get(strId);
    if (task) {
      Object.assign(task, updates);
      this.inMemory.tasks.set(strId, task);
      return { ...task, _id: strId, id: strId };
    }
    return null;
  }

  async deleteTask(query) {
    if (this.isMongoConnected) {
      const { Task } = await import('./models.js');
      return await Task.deleteOne(query);
    }
    
    if (query._id) {
      const strId = String(query._id);
      const task = this.inMemory.tasks.get(strId);
      if (task && (!query.user_id || String(task.user_id) === String(query.user_id))) {
        this.inMemory.tasks.delete(strId);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  // Goal operations
  async findGoals(query, options = {}) {
    if (this.isMongoConnected) {
      const { Goal } = await import('./models.js');
      let q = Goal.find(query);
      if (options.sort) q = q.sort(options.sort);
      return await q.lean();
    }
    
    let goals = Array.from(this.inMemory.goals.entries())
      .map(([id, goal]) => ({ ...goal, _id: id, id: id }));
    
    if (query._id || query.id) {
      const targetId = String(query._id || query.id);
      goals = goals.filter(g => String(g._id) === targetId || String(g.id) === targetId);
    }
    if (query.user_id) {
      const queryUserId = String(query.user_id);
      goals = goals.filter(g => String(g.user_id) === queryUserId);
    }
    if (query.status) {
      goals = goals.filter(g => g.status === query.status);
    }
    if (query.category) {
      goals = goals.filter(g => g.category === query.category);
    }
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      goals.sort((a, b) => {
        if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
      });
    }
    
    return goals;
  }

  async createGoal(goalData) {
    if (this.isMongoConnected) {
      const { Goal } = await import('./models.js');
      return await Goal.create(goalData);
    }
    
    const id = this.generateId('goals');
    const goal = { ...goalData, _id: id, id: id };
    this.inMemory.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id, updates) {
    if (this.isMongoConnected) {
      const { Goal } = await import('./models.js');
      return await Goal.findByIdAndUpdate(id, updates, { new: true });
    }
    
    const strId = String(id);
    const goal = this.inMemory.goals.get(strId);
    if (goal) {
      Object.assign(goal, updates);
      this.inMemory.goals.set(strId, goal);
      return { ...goal, _id: strId, id: strId };
    }
    return null;
  }

  async deleteGoal(query) {
    if (this.isMongoConnected) {
      const { Goal } = await import('./models.js');
      return await Goal.deleteOne(query);
    }
    
    if (query._id) {
      const strId = String(query._id);
      const goal = this.inMemory.goals.get(strId);
      if (goal && (!query.user_id || String(goal.user_id) === String(query.user_id))) {
        this.inMemory.goals.delete(strId);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  // Habit operations
  async findHabits(query, options = {}) {
    if (this.isMongoConnected) {
      const { Habit } = await import('./models.js');
      let q = Habit.find(query);
      if (options.sort) q = q.sort(options.sort);
      return await q.lean();
    }
    
    let habits = Array.from(this.inMemory.habits.entries())
      .map(([id, habit]) => ({ ...habit, _id: id, id: id }));
    
    if (query._id || query.id) {
      const targetId = String(query._id || query.id);
      habits = habits.filter(h => String(h._id) === targetId || String(h.id) === targetId);
    }
    if (query.user_id) {
      const queryUserId = String(query.user_id);
      habits = habits.filter(h => String(h.user_id) === queryUserId);
    }
    if (query.active !== undefined) {
      habits = habits.filter(h => h.active === query.active);
    }
    if (query.category) {
      habits = habits.filter(h => h.category === query.category);
    }
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      habits.sort((a, b) => {
        if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
      });
    }
    
    return habits;
  }

  async createHabit(habitData) {
    if (this.isMongoConnected) {
      const { Habit } = await import('./models.js');
      return await Habit.create(habitData);
    }
    
    const id = this.generateId('habits');
    const habit = { ...habitData, _id: id, id: id };
    this.inMemory.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id, updates) {
    if (this.isMongoConnected) {
      const { Habit } = await import('./models.js');
      return await Habit.findByIdAndUpdate(id, updates, { new: true });
    }
    
    const strId = String(id);
    const habit = this.inMemory.habits.get(strId);
    if (habit) {
      Object.assign(habit, updates);
      this.inMemory.habits.set(strId, habit);
      return { ...habit, _id: strId, id: strId };
    }
    return null;
  }

  async deleteHabit(query) {
    if (this.isMongoConnected) {
      const { Habit } = await import('./models.js');
      return await Habit.deleteOne(query);
    }
    
    if (query._id) {
      const strId = String(query._id);
      const habit = this.inMemory.habits.get(strId);
      if (habit && (!query.user_id || String(habit.user_id) === String(query.user_id))) {
        this.inMemory.habits.delete(strId);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  // Daily Schedule operations
  async findSchedule(query) {
    if (this.isMongoConnected) {
      const { DailySchedule } = await import('./models.js');
      return await DailySchedule.findOne(query);
    }

    for (const [id, sched] of this.inMemory.dailySchedules) {
      if (String(sched.user_id) === String(query.user_id) && sched.date === query.date) {
        return { ...sched, _id: id, id: id };
      }
    }
    return null;
  }

  async saveSchedule(scheduleData) {
    const query = { user_id: scheduleData.user_id, date: scheduleData.date };
    if (this.isMongoConnected) {
      const { DailySchedule } = await import('./models.js');
      return await DailySchedule.findOneAndUpdate(query, scheduleData, { upsert: true, new: true });
    }

    const existing = await this.findSchedule(query);
    if (existing) {
      const id = String(existing._id);
      const updated = { ...existing, ...scheduleData, updated_at: new Date() };
      this.inMemory.dailySchedules.set(id, updated);
      return updated;
    }

    const id = this.generateId('dailySchedules');
    const sched = { ...scheduleData, _id: id, id: id, generated_at: new Date() };
    this.inMemory.dailySchedules.set(id, sched);
    return sched;
  }

  // Recommendation operations
  async findRecommendations(query, options = {}) {
    if (this.isMongoConnected) {
      const { Recommendation } = await import('./models.js');
      let q = Recommendation.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.limit) q = q.limit(options.limit);
      return await q.lean();
    }

    let list = Array.from(this.inMemory.recommendations.entries())
      .map(([id, item]) => ({ ...item, _id: id, id: id }));

    if (query.user_id) {
      const queryUserId = String(query.user_id);
      list = list.filter(item => String(item.user_id) === queryUserId);
    }
    if (query.status) {
      list = list.filter(item => item.status === query.status);
    }

    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      list.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }

    if (options.limit) list = list.slice(0, options.limit);
    return list;
  }

  async createRecommendation(data) {
    if (this.isMongoConnected) {
      const { Recommendation } = await import('./models.js');
      return await Recommendation.create(data);
    }

    const id = this.generateId('recommendations');
    const rec = { ...data, _id: id, id: id, created_at: new Date() };
    this.inMemory.recommendations.set(id, rec);
    return rec;
  }

  async updateRecommendation(id, updates) {
    if (this.isMongoConnected) {
      const { Recommendation } = await import('./models.js');
      return await Recommendation.findByIdAndUpdate(id, updates, { new: true });
    }

    const strId = String(id);
    const item = this.inMemory.recommendations.get(strId);
    if (item) {
      Object.assign(item, updates);
      this.inMemory.recommendations.set(strId, item);
      return { ...item, _id: strId, id: strId };
    }
    return null;
  }

  // Notification operations
  async findNotifications(query, options = {}) {
    if (this.isMongoConnected) {
      const { Notification } = await import('./models.js');
      let q = Notification.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.limit) q = q.limit(options.limit);
      return await q.lean();
    }

    let list = Array.from(this.inMemory.notifications.entries())
      .map(([id, item]) => ({ ...item, _id: id, id: id }));

    if (query.user_id) {
      const queryUserId = String(query.user_id);
      list = list.filter(item => String(item.user_id) === queryUserId);
    }
    if (query.read !== undefined) {
      list = list.filter(item => item.read === query.read);
    }

    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      list.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }

    if (options.limit) list = list.slice(0, options.limit);
    return list;
  }

  async createNotification(data) {
    if (this.isMongoConnected) {
      const { Notification } = await import('./models.js');
      return await Notification.create(data);
    }

    const id = this.generateId('notifications');
    const notif = { ...data, _id: id, id: id, created_at: new Date() };
    this.inMemory.notifications.set(id, notif);
    return notif;
  }

  async markNotificationRead(id, userId) {
    if (this.isMongoConnected) {
      const { Notification } = await import('./models.js');
      return await Notification.findOneAndUpdate(
        { _id: id, user_id: userId },
        { read: true },
        { new: true }
      );
    }

    const strId = String(id);
    const item = this.inMemory.notifications.get(strId);
    if (item && (!userId || String(item.user_id) === String(userId))) {
      item.read = true;
      this.inMemory.notifications.set(strId, item);
      return item;
    }
    return null;
  }

  async markAllNotificationsRead(userId) {
    if (this.isMongoConnected) {
      const { Notification } = await import('./models.js');
      return await Notification.updateMany({ user_id: userId, read: false }, { read: true });
    }

    const strUserId = String(userId);
    for (const [id, item] of this.inMemory.notifications) {
      if (String(item.user_id) === strUserId) {
        item.read = true;
        this.inMemory.notifications.set(id, item);
      }
    }
    return { modifiedCount: 1 };
  }
}

export const storage = new StorageAdapter();
export default storage;
