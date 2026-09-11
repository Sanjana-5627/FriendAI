import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Calendar, 
  Sparkles, 
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
  Edit3,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Planner = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingItem, setEditingItem] = useState(null);

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
      toast.success('✨ Schedule regenerated with balanced blocks!');
    } catch (error) {
      toast.error('Failed to regenerate schedule');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      const updated = await apiHelpers.updateScheduleItem(item.id, {
        date: selectedDate,
        completed: !item.completed,
        skipped: false
      });
      setSchedule(updated.data);
      toast.success(!item.completed ? '✓ Block marked completed!' : 'Block unmarked');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleToggleSkip = async (item) => {
    try {
      const updated = await apiHelpers.updateScheduleItem(item.id, {
        date: selectedDate,
        skipped: !item.skipped,
        completed: false
      });
      setSchedule(updated.data);
      toast('Item skipped', { icon: '⏭️' });
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updated = await apiHelpers.updateScheduleItem(editingItem.id, {
        date: selectedDate,
        title: editingItem.title,
        time: editingItem.time,
        notes: editingItem.notes
      });
      setSchedule(updated.data);
      setEditingItem(null);
      toast.success('Schedule item updated');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'work':
        return { icon: Briefcase, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' };
      case 'break':
        return { icon: Coffee, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
      case 'meal':
        return { icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' };
      case 'exercise':
        return { icon: Dumbbell, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
      case 'social':
        return { icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' };
      case 'sleep':
        return { icon: Moon, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' };
      default:
        return { icon: Clock, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700' };
    }
  };

  const items = schedule?.items || [];
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Personalized Daily Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Realistic, non-overloaded daily schedule tailored to your routine and balance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          />

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              <span>Day Completion Flow</span>
              <span>{completedCount} of {items.length} blocks done ({progress}%)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Flow List */}
      {loading ? (
        <LoadingSpinner text="Building daily timetable..." />
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No schedule generated yet</p>
          <button onClick={handleRegenerate} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
            Generate Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const config = getCategoryConfig(item.category);
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60'
                    : item.skipped
                    ? 'bg-gray-50/40 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/40 opacity-40 line-through'
                    : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-indigo-200'
                }`}
              >
                {/* Left time & category indicator */}
                <div className="flex items-start sm:items-center space-x-3.5">
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="mt-0.5 sm:mt-0 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className={`p-2 rounded-xl border ${config.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {item.time}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        ({item.duration_minutes}m)
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold mt-0.5 text-gray-900 dark:text-white ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.title}
                    </h3>
                    {item.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleSkip(item)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      item.skipped 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.skipped ? 'Unskip' : 'Skip'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-sm w-full">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Edit Timetable Item</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Time (24h e.g. 14:00)</label>
                <input
                  type="text"
                  value={editingItem.time}
                  onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Planner;
