import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Trophy,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', label: 'All Habits' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'health', label: 'Health & Fitness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'social', label: 'Social & Outdoors' }
];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'wellness',
    target_days: []
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await apiHelpers.getHabits(true);
      setHabits(response.data || []);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    try {
      await apiHelpers.createHabit(newHabit);
      toast.success('Habit created successfully!');
      setNewHabit({ name: '', description: '', frequency: 'daily', category: 'wellness', target_days: [] });
      setShowAddForm(false);
      fetchHabits();
    } catch (error) {
      toast.error('Failed to create habit');
    }
  };

  const completeHabit = async (habitId, habitName) => {
    try {
      await apiHelpers.completeHabit(habitId, '');
      toast.success(`✓ "${habitName}" logged for today! Streak updated.`);
      fetchHabits();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Already completed today');
      } else {
        toast.error('Failed to complete habit');
      }
    }
  };

  const deleteHabit = async (habitId, habitName) => {
    if (!window.confirm(`Delete habit "${habitName}"?`)) return;

    try {
      await apiHelpers.deleteHabit(habitId);
      toast.success('Habit removed');
      fetchHabits();
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const isCompletedToday = (habit) => {
    if (!habit.completions || habit.completions.length === 0) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.completions.some(c => 
      new Date(c.date).toISOString().split('T')[0] === today
    );
  };

  const filteredHabits = habits.filter(h => {
    if (activeCategory === 'all') return true;
    return (h.category || 'wellness').toLowerCase() === activeCategory.toLowerCase();
  });

  const totalCompletions = habits.reduce((acc, h) => acc + (h.completions?.length || 0), 0);
  const longestOverallStreak = habits.reduce((acc, h) => Math.max(acc, h.streak?.longest || 0), 0);
  const doneTodayCount = habits.filter(isCompletedToday).length;

  if (loading) {
    return <LoadingSpinner text="Loading your habits & streaks..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-400/20" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Habits & Consistency
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Build lasting wellness routines with real-time streak verification
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Habit'}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Done Today</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {doneTodayCount} / {habits.length}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Active routines</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Best Streak</p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{longestOverallStreak}</span>
            <span className="text-xs text-gray-400">days</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">All-time record</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Reps</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{totalCompletions}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Lifelong completions</p>
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-base font-black text-gray-900 dark:text-white">Create New Habit</h3>
          </div>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15-Minute Sunlight Walk"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="wellness">Wellness</option>
                  <option value="health">Health & Fitness</option>
                  <option value="productivity">Productivity</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="social">Social & Outdoors</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Description / Cue (Optional)
              </label>
              <textarea
                placeholder="Why this habit matters, or when you will do it..."
                value={newHabit.description}
                onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden h-16 resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
              >
                Save Habit
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-3.5">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8">
            <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No habits found in this category
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Start building a routine to track streaks and strengthen your wellness habits.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              Add First Habit
            </button>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            const currentStreak = habit.streak?.current || 0;
            const longestStreak = habit.streak?.longest || 0;

            return (
              <div
                key={habit.id || habit._id}
                className={`p-5 rounded-3xl border transition-all ${
                  completedToday
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800'
                } shadow-xs hover:shadow-md`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Check Button */}
                    <button
                      onClick={() => !completedToday && completeHabit(habit.id || habit._id, habit.name)}
                      disabled={completedToday}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                        completedToday
                          ? 'bg-emerald-500 text-white cursor-default shadow-md shadow-emerald-500/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95'
                      }`}
                      title={completedToday ? 'Completed for today' : 'Mark completed today'}
                    >
                      <Check className="w-5 h-5" />
                    </button>

                    {/* Habit Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className={`text-sm font-bold truncate ${
                          completedToday 
                            ? 'text-gray-900 dark:text-white line-through opacity-80' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {habit.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {habit.category || 'wellness'}
                        </span>
                        {completedToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      {habit.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {habit.description}
                        </p>
                      )}

                      {/* Streaks */}
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {currentStreak}
                          </span>
                          <span className="text-[11px] text-gray-400">day streak</span>
                        </div>
                        {longestStreak > 0 && (
                          <span className="text-[11px] text-gray-400">
                            Best: <strong className="text-gray-600 dark:text-gray-300">{longestStreak}d</strong>
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          Total: <strong className="text-gray-600 dark:text-gray-300">{habit.completions?.length || 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteHabit(habit.id || habit._id, habit.name)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 7-Day Completion Mini-Grid */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Recent 7 Days
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {habit.completions?.length || 0} total logs
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[...Array(7)].map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                      const done = habit.completions?.some(c => 
                        new Date(c.date).toISOString().split('T')[0] === dateStr
                      );

                      return (
                        <div key={i} className="text-center">
                          <div
                            className={`h-7 rounded-lg transition-all ${
                              done
                                ? 'bg-emerald-500 dark:bg-emerald-400 shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                            title={`${date.toLocaleDateString()}: ${done ? 'Completed' : 'Missed'}`}
                          />
                          <span className="text-[9px] font-bold text-gray-400 mt-1 block">
                            {dayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Habits;
