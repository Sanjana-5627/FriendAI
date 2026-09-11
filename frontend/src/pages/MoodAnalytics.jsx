import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Moon, 
  Zap, 
  Users, 
  Info,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

const MoodAnalytics = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [activeTab, setActiveTab] = useState('mood_energy');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiHelpers.getMoodAnalytics(period);
      setData(res.data);
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load wellness analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading && !data) {
    return <LoadingSpinner text="Crunching multi-metric wellness trends..." />;
  }

  const timeline = data?.timeline || [];
  const stats = data?.stats || {};
  const patterns = data?.patterns || [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Period Controls */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Wellness & Habit Analytics
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Holistic trends connecting mood, sleep, stress, activity, and focus
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {['weekly', 'monthly', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {p === 'all' ? 'All-Time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Avg Mood</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.averageMood}/10</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-0.5">High: {stats.highestMood} / Low: {stats.lowestMood}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Avg Energy</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.averageEnergy}/10</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Daily vitality level</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Avg Sleep</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.averageSleep} hrs</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Recommended: 7-9 hrs</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Avg Stress</p>
          <p className="text-2xl font-black text-rose-500 mt-1">{stats.averageStress}/10</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Lower is healthier</p>
        </div>
      </div>

      {/* Chart View Tabs */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('mood_energy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mood_energy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Mood & Energy
            </button>
            <button
              onClick={() => setActiveTab('sleep_stress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sleep_stress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Sleep & Stress
            </button>
            <button
              onClick={() => setActiveTab('habits_activity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'habits_activity'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Habits & Movement
            </button>
          </div>

          <span className="text-[11px] font-semibold text-gray-400">
            {timeline.length} Days Sampled
          </span>
        </div>

        {/* Recharts Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'mood_energy' ? (
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} name="Mood (1-10)" />
                  <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2.5} name="Energy (1-10)" />
                </LineChart>
              ) : activeTab === 'sleep_stress' ? (
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sleepHours" stroke="#3b82f6" strokeWidth={3} name="Sleep (Hours)" />
                  <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={2.5} name="Stress Level (1-10)" />
                </LineChart>
              ) : (
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="habitsCompleted" fill="#8b5cf6" name="Habits Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activityMinutes" fill="#14b8a6" name="Activity (Minutes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No historical entries found for this period. Complete daily check-ins to build rich trends.
            </div>
          )}
        </div>
      </div>

      {/* Pattern Correlation Insights (Non-Medical) */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Habit & Wellness Pattern Correlations
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
            Statistical Patterns
          </span>
        </div>

        {patterns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {patterns.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs"
              >
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{p.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{p.observation}</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] italic">{p.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-3">
            Keep recording daily check-ins! As you log 3+ days, FriendAI will detect patterns between your sleep, physical movement, screen time, and emotional vitality.
          </p>
        )}

        <div className="flex items-start space-x-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 mt-3">
          <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
          <span>
            {data?.disclaimer || 'These insights are statistical habit patterns meant for personal self-reflection, not clinical diagnosis or medical causation.'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default MoodAnalytics;
