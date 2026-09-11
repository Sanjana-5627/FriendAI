import React, { useState } from 'react';
import { apiHelpers } from '../utils/api';
import { X, Sparkles, Moon, Activity, Users, Monitor, Smile, Battery, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckInModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mood: 7,
    energy: 6,
    stress: 4,
    sleep_hours: 7.5,
    sleep_quality: 'good',
    physical_activity: 'light_walk',
    physical_activity_minutes: 25,
    social_interaction: 'moderate',
    screen_time_hours: 4,
    productive_screen_hours: 3,
    productivity: 7,
    notes: ''
  });

  const getMoodEmoji = (score) => {
    if (score >= 9) return '🌟 Ecstatic';
    if (score >= 8) return '😊 Happy & Content';
    if (score >= 7) return '🙂 Good & Balanced';
    if (score >= 5) return '😐 Neutral / Okay';
    if (score >= 3) return '😔 Low & Tired';
    return '💙 Struggling';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiHelpers.submitCheckIn(formData);
      toast.success('🎉 Daily check-in recorded! Your wellness score updated.');
      if (onCheckInSuccess) onCheckInSuccess();
      onClose();
    } catch (error) {
      console.error('Check-in submission failed:', error);
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Wellness Check-In</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Quick 45-second reflection to personalize your day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Mood Slider */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold flex items-center space-x-2">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>How is your mood right now?</span>
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {formData.mood}/10 - {getMoodEmoji(formData.mood)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>1 Low</span>
              <span>5 Balanced</span>
              <span>10 Exceptional</span>
            </div>
          </div>

          {/* Energy & Stress 2-column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold flex items-center space-x-1.5">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Energy Level</span>
                </label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formData.energy}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy}
                onChange={(e) => setFormData({ ...formData, energy: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-500" />
                  <span>Stress Level</span>
                </label>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{formData.stress}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress}
                onChange={(e) => setFormData({ ...formData, stress: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sleep Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2 mb-3">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold">Sleep Last Night</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Duration: {formData.sleep_hours} hrs</label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={(e) => setFormData({ ...formData, sleep_hours: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Quality</label>
                <select
                  value={formData.sleep_quality}
                  onChange={(e) => setFormData({ ...formData, sleep_quality: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="poor">Restless / Poor</option>
                  <option value="fair">Fair (Woke up a few times)</option>
                  <option value="good">Good & Restful</option>
                  <option value="excellent">Deep & Refreshing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity & Social & Screen Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <label className="text-xs font-semibold flex items-center space-x-1.5 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Physical Movement</span>
              </label>
              <select
                value={formData.physical_activity}
                onChange={(e) => setFormData({ ...formData, physical_activity: e.target.value })}
                className="w-full text-xs py-1.5 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="none">Rest / None</option>
                <option value="light_walk">Light Walk (15-30m)</option>
                <option value="moderate_workout">Workout / Sports (30-60m)</option>
                <option value="intense_training">Intense Training (60m+)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <label className="text-xs font-semibold flex items-center space-x-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>Social Contact</span>
              </label>
              <select
                value={formData.social_interaction}
                onChange={(e) => setFormData({ ...formData, social_interaction: e.target.value })}
                className="w-full text-xs py-1.5 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="none">Solo Day / None</option>
                <option value="low">Brief Text / Casual</option>
                <option value="moderate">Call / Met a Friend</option>
                <option value="high">Gathering / High Social</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <label className="text-xs font-semibold flex items-center space-x-1.5 mb-1.5">
                <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                <span>Screen Time</span>
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.screen_time_hours}
                  onChange={(e) => setFormData({ ...formData, screen_time_hours: Number(e.target.value) })}
                  className="w-full text-xs py-1 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
                <span className="text-[11px] text-gray-500">hrs</span>
              </div>
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div>
            <label className="text-xs font-semibold block mb-1 text-gray-600 dark:text-gray-400">
              One thought or highlight from today (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What made you smile today, or what's on your mind?..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {loading ? <span>Saving...</span> : <span>Save Check-In</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
