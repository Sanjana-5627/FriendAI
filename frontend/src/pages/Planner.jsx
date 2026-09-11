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
  X,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Planner = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchSchedule = async (date) => {
    try {
      setLoading(true);
      const res = await apiHelpers.getSchedule(date);
      setSchedule(res.data);
    } catch (error) {
      console.error('Fetch schedule error:', error);
      toast.error('Failed to load daily schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDate);
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

  const handleToggleComplete = async (item) => {
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

  const handleSkipItem = async (item) => {
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
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            Intelligent Time Blocking
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Personalized Daily Timetable
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            A balanced schedule crafted from your habits, focus tasks, and evening reflections.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none"
          />

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary flex items-center space-x-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Daily Momentum
          </span>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            <strong>{completedCount}</strong> of <strong>{items.length}</strong> blocks finished ({progress}%)
          </p>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-48 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Schedule Blocks Timeline */}
      {loading ? (
        <LoadingSpinner text="Loading timetable..." />
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8 space-y-3">
          <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No schedule generated yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Click "Regenerate" to build an intelligent, balanced schedule for this day.
          </p>
          <button onClick={handleRegenerate} className="btn-primary">
            Build Schedule Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const Icon = getCategoryIcon(item.category);
            const isCompleted = item.completed;
            const isSkipped = item.skipped;

            return (
              <div
                key={item.id || item._id || index}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
                    : isSkipped
                    ? 'bg-zinc-100/40 dark:bg-zinc-900/20 border-zinc-200/40 dark:border-zinc-800/40 opacity-40'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  {/* Complete Toggle */}
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="shrink-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Icon & Time */}
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-zinc-500 shrink-0">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="badge-mono text-[9px]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className={`text-xs sm:text-sm font-semibold truncate mt-0.5 ${
                      isCompleted || isSkipped ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleSkipItem(item)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1 rounded"
                    title="Skip this item"
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
  );
};

export default Planner;
