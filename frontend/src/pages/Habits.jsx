import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', label: 'All Habits' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'health', label: 'Health & Movement' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'social', label: 'Social & Connection' }
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
      toast.success('Habit created');
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
      toast.success(`✓ "${habitName}" logged for today!`);
      fetchHabits();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Already completed today');
      } else {
        toast.error('Failed to complete habit');
      }
    }
  };

  const handleUndoHabit = async (habitId, habitName) => {
    try {
      await apiHelpers.undoHabit(habitId);
      toast.success(`Undone completion for "${habitName}"`);
      fetchHabits();
    } catch (error) {
      toast.error('Failed to undo habit');
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
    return <LoadingSpinner text="Loading habits & streaks..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            Routines & Continuity
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Daily Habits
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Micro-actions that compound into lasting emotional resilience.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Habit'}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Done Today</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {doneTodayCount} / {habits.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Active routines</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Best Streak</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{longestOverallStreak} days</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Continuous consistency</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Reps</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{totalCompletions}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Lifelong completions</p>
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Establish Habit</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Habit title (e.g. 15-Minute Sunlight Walk)"
              value={newHabit.name}
              onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              required
            />

            <textarea
              placeholder="Why this routine matters to you..."
              value={newHabit.description}
              onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
              className="input-field h-16 resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Category</label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="wellness">Wellness</option>
                  <option value="health">Health & Movement</option>
                  <option value="productivity">Productivity</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="social">Social & Connection</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Frequency</label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, frequency: e.target.value }))}
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button type="submit" className="btn-primary">Save Habit</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8">
            <Zap className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No habits in this category</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Start building a routine to track streaks and strengthen your wellness habits.
            </p>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            const currentStreak = habit.streak?.current || 0;
            const longestStreak = habit.streak?.longest || 0;

            return (
              <div
                key={habit.id || habit._id}
                className={`p-5 rounded-2xl border transition-all ${
                  completedToday
                    ? 'bg-amber-50/40 dark:bg-stone-900/40 border-amber-200/60 dark:border-stone-800'
                    : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-amber-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    {completedToday ? (
                      <button
                        onClick={() => handleUndoHabit(habit.id || habit._id, habit.name)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-sm shadow-amber-500/25 hover:bg-amber-600 transition-all shrink-0"
                        title="Click to undo today's completion"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => completeHabit(habit.id || habit._id, habit.name)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all shrink-0"
                        title="Mark completed today"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-semibold truncate ${
                          completedToday ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {habit.name}
                        </h3>
                        <span className="badge-mono text-[9px]">
                          {habit.category || 'wellness'}
                        </span>
                        {completedToday && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-100/80 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                            ✓ Done Today
                          </span>
                        )}
                      </div>

                      {habit.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                          {habit.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-stone-400">
                        <span className="font-mono flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Streak: <strong className="text-stone-800 dark:text-stone-200">{currentStreak}d</strong></span>
                        </span>
                        {longestStreak > 0 && (
                          <span>Best: <strong className="text-stone-800 dark:text-stone-200">{longestStreak}d</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {completedToday && (
                      <button
                        onClick={() => handleUndoHabit(habit.id || habit._id, habit.name)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold flex items-center space-x-1 border border-amber-200/70 transition-all"
                        title="Undo today's habit completion"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteHabit(habit.id || habit._id, habit.name)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Completion Mini-Grid */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="grid grid-cols-7 gap-1">
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
                            className={`h-5 rounded transition-all ${
                              done
                                ? 'bg-zinc-900 dark:bg-zinc-100'
                                : 'bg-zinc-100 dark:bg-zinc-800'
                            }`}
                            title={`${date.toLocaleDateString()}: ${done ? 'Completed' : 'Missed'}`}
                          />
                          <span className="text-[9px] text-zinc-400 mt-0.5 block font-mono">
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
