import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Calendar, 
  RotateCw, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Coffee, 
  Briefcase, 
  Dumbbell, 
  Utensils, 
  Users, 
  Moon, 
  Check, 
  Plus,
  Flame,
  RotateCcw,
  ListTodo,
  CheckSquare,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Planner = () => {
  const [schedule, setSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'schedule', 'tasks', 'habits'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'high', 'pending', 'completed'
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const fetchPlannerData = async (date) => {
    try {
      setLoading(true);
      const [schedRes, tasksRes, habitsRes] = await Promise.all([
        apiHelpers.getSchedule(date),
        apiHelpers.getTasks(),
        apiHelpers.getHabits()
      ]);
      setSchedule(schedRes.data);
      setTasks(tasksRes.data || []);
      setHabits(habitsRes.data || []);
    } catch (error) {
      console.error('Fetch planner data error:', error);
      toast.error('Failed to load planner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData(selectedDate);
  }, [selectedDate]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await apiHelpers.regenerateSchedule(selectedDate);
      setSchedule(res.data.schedule);
      toast.success('Schedule regenerated with balanced focus blocks.');
    } catch (error) {
      toast.error('Failed to regenerate schedule');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleScheduleItem = async (item) => {
    const newStatus = !item.completed;
    try {
      const updated = await apiHelpers.updateScheduleItem(item.id || item._id, {
        date: selectedDate,
        completed: newStatus
      });
      setSchedule(updated.data);
      toast.success(newStatus ? `Completed "${item.title}"` : 'Marked incomplete');
    } catch (error) {
      toast.error('Failed to update schedule item');
    }
  };

  const handleSkipScheduleItem = async (item) => {
    try {
      const updated = await apiHelpers.updateScheduleItem(item.id || item._id, {
        date: selectedDate,
        skipped: !item.skipped
      });
      setSchedule(updated.data);
      toast(item.skipped ? 'Unskipped item' : 'Skipped item without penalty', { icon: '↷' });
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  // Task Handlers
  const handleToggleTask = async (task) => {
    const taskId = task.id || task._id;
    const newStatus = !task.completed;
    try {
      await apiHelpers.updateTask(taskId, { completed: newStatus });
      setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId) ? { ...t, completed: newStatus } : t));
      toast.success(newStatus ? `Completed "${task.title}"` : `Marked "${task.title}" pending`);
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      const res = await apiHelpers.createTask({
        title: quickTaskTitle.trim(),
        priority: 'medium',
        category: 'wellness',
        due_date: selectedDate
      });
      setTasks(prev => [res.data, ...prev]);
      setQuickTaskTitle('');
      toast.success('Added task to today\'s planner!');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  // Habit Handlers
  const handleCompleteHabit = async (habit) => {
    const habitId = habit.id || habit._id;
    try {
      await apiHelpers.completeHabit(habitId);
      toast.success(`Completed habit "${habit.name}" today! 🔥`);
      const habitsRes = await apiHelpers.getHabits();
      setHabits(habitsRes.data || []);
    } catch (err) {
      toast.error('Failed to complete habit');
    }
  };

  const handleUndoHabit = async (habit) => {
    const habitId = habit.id || habit._id;
    try {
      await apiHelpers.undoHabit(habitId);
      toast.success(`Undone completion for "${habit.name}"`);
      const habitsRes = await apiHelpers.getHabits();
      setHabits(habitsRes.data || []);
    } catch (err) {
      toast.error('Failed to undo habit');
    }
  };

  const isHabitCompletedToday = (habit) => {
    if (habit.completedToday !== undefined) return habit.completedToday;
    if (!habit.completions || habit.completions.length === 0) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.completions.some(c => new Date(c.date).toISOString().split('T')[0] === today);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return Briefcase;
      case 'break': return Coffee;
      case 'meal': return Utensils;
      case 'exercise': return Dumbbell;
      case 'social': return Users;
      case 'sleep': return Moon;
      default: return Clock;
    }
  };

  const items = schedule?.items || [];
  const completedScheduleCount = items.filter(i => i.completed).length;
  const scheduleProgress = items.length > 0 ? Math.round((completedScheduleCount / items.length) * 100) : 0;

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completedHabitsCount = habits.filter(isHabitCompletedToday).length;

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'high') return t.priority === 'high' && !t.completed;
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header with Warm Joyful Amber Accent */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-600 dark:text-amber-400 uppercase block mb-1">
            Integrated Day Planner & Routine
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Daily Timetable & Tasks
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Your balanced timetable, task commitments from all sections, and daily habit routines in one calm view.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 focus:outline-none"
          />

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary flex items-center space-x-1.5 shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Blocks</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Timetable Blocks</span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{completedScheduleCount}/{items.length}</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${scheduleProgress}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Tasks Across Sections</span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{completedTasksCount}/{tasks.length}</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-amber-600 rounded-full transition-all duration-300" 
              style={{ width: `${tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Habits Done Today</span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{completedHabitsCount}/{habits.length}</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300" 
              style={{ width: `${habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center space-x-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          All-in-One View
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          Timetable ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          Tasks All Sections ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'habits'
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          Habits & Streaks ({habits.length})
        </button>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <LoadingSpinner text="Organizing daily timetable, tasks, and habits..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ========================================================= */}
          {/* LEFT/PRIMARY COLUMN: TIMETABLE SCHEDULE BLOCKS           */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'schedule') && (
            <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Hourly Timetable Blueprint</span>
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  {completedScheduleCount}/{items.length} Completed
                </span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8 space-y-3">
                  <Clock className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">No schedule blocks generated</h3>
                  <button onClick={handleRegenerate} className="btn-primary text-xs">
                    Generate Timetable Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {items.map((item, index) => {
                    const Icon = getCategoryIcon(item.category);
                    const isCompleted = item.completed;
                    const isSkipped = item.skipped;

                    return (
                      <div
                        key={item.id || item._id || index}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCompleted
                            ? 'bg-amber-50/40 dark:bg-stone-900/30 border-amber-200/60 dark:border-stone-800/60 opacity-70'
                            : isSkipped
                            ? 'bg-stone-100/40 dark:bg-stone-900/20 border-stone-200/40 dark:border-stone-800/40 opacity-40'
                            : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggleScheduleItem(item)}
                            className="shrink-0 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-amber-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-semibold text-stone-500 shrink-0">
                                {item.startTime} – {item.endTime}
                              </span>
                              <span className="badge-happy text-[9px]">
                                {item.category}
                              </span>
                            </div>

                            <h4 className={`text-xs font-semibold truncate mt-0.5 ${
                              isCompleted || isSkipped ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                            }`}>
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleSkipScheduleItem(item)}
                            className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 px-2 py-1 rounded"
                          >
                            {isSkipped ? 'Unskip' : 'Skip'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* RIGHT COLUMN: TASKS FROM ALL SECTIONS & HABITS            */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'tasks' || activeTab === 'habits') && (
            <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6`}>
              
              {/* TASKS SUB-SECTION */}
              {(activeTab === 'all' || activeTab === 'tasks') && (
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                      <ListTodo className="w-4 h-4 text-amber-500" />
                      <span>Tasks from All Sections</span>
                    </h3>
                    <div className="flex items-center space-x-1 text-[10px]">
                      <button
                        onClick={() => setTaskFilter('all')}
                        className={`px-2 py-0.5 rounded ${taskFilter === 'all' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-400'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTaskFilter('high')}
                        className={`px-2 py-0.5 rounded ${taskFilter === 'high' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-400'}`}
                      >
                        High
                      </button>
                      <button
                        onClick={() => setTaskFilter('pending')}
                        className={`px-2 py-0.5 rounded ${taskFilter === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-400'}`}
                      >
                        Pending
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Task */}
                  <form onSubmit={handleQuickAddTask} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={quickTaskTitle}
                      onChange={(e) => setQuickTaskTitle(e.target.value)}
                      placeholder="Add a task to today's schedule..."
                      className="input-field text-xs py-1.5"
                    />
                    <button type="submit" className="btn-primary py-1.5 px-3 shrink-0 text-xs flex items-center space-x-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Tasks List */}
                  {filteredTasks.length === 0 ? (
                    <p className="text-xs text-stone-400 py-3 text-center">No tasks match this filter.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredTasks.map((t) => (
                        <div
                          key={t.id || t._id}
                          onClick={() => handleToggleTask(t)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between space-x-2 text-xs cursor-pointer transition-all ${
                            t.completed
                              ? 'bg-amber-50/40 dark:bg-stone-900/30 border-stone-200/50 opacity-60'
                              : 'bg-stone-50/70 dark:bg-stone-950 border-stone-200/70 dark:border-stone-800 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {t.completed ? (
                              <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-400 shrink-0" />
                            )}
                            <span className={`truncate font-medium ${t.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                              {t.title}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {t.priority === 'high' && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                                High
                              </span>
                            )}
                            <span className="text-[9px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                              {t.category || 'task'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* HABITS SUB-SECTION WITH UNDO */}
              {(activeTab === 'all' || activeTab === 'habits') && (
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Daily Habits & Streaks</span>
                    </h3>
                    <span className="text-xs text-stone-400 font-mono">
                      {completedHabitsCount}/{habits.length} Done Today
                    </span>
                  </div>

                  {habits.length === 0 ? (
                    <p className="text-xs text-stone-400 py-3 text-center">No habits tracked yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {habits.map((habit) => {
                        const doneToday = isHabitCompletedToday(habit);
                        const streakCount = habit.streak?.current || 0;

                        return (
                          <div
                            key={habit.id || habit._id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between space-x-3 text-xs transition-all ${
                              doneToday
                                ? 'bg-amber-50/50 dark:bg-stone-900/40 border-amber-200/70 dark:border-stone-800'
                                : 'bg-stone-50/70 dark:bg-stone-950 border-stone-200/70 dark:border-stone-800 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className="text-sm">
                                {doneToday ? '🔥' : '✨'}
                              </span>
                              <div className="min-w-0">
                                <h4 className={`font-semibold truncate ${doneToday ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>
                                  {habit.name}
                                </h4>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  Streak: <strong>{streakCount}d</strong>
                                </span>
                              </div>
                            </div>

                            {/* Habit Action: Complete vs Undo */}
                            <div className="shrink-0 flex items-center space-x-1.5">
                              {doneToday ? (
                                <button
                                  onClick={() => handleUndoHabit(habit)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-bold flex items-center space-x-1 transition-all"
                                  title="Undo today's habit completion"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Undo</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCompleteHabit(habit)}
                                  className="btn-primary py-1 px-2.5 text-[11px] flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Check</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

// Helper square icon
const Square = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  </svg>
);

export default Planner;
