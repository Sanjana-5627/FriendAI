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

  // Monochromatic Chart Color Tokens
  const primaryStroke = isDark ? '#ffffff' : '#18181b';
  const secondaryStroke = isDark ? '#a1a1aa' : '#71717a';
  const gridStroke = isDark ? '#27272a' : '#f4f4f5';
  const textFill = isDark ? '#a1a1aa' : '#71717a';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Period Controls */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Wellness & Reflection Analytics
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Holistic trends connecting your daily debriefs, mood, sleep, stress, and activity
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          {['weekly', 'monthly', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                period === p
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {p === 'all' ? 'All-Time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scorecards (Monochromatic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Mood</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.averageMood || 7.5}/10</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">High: {stats.highestMood || 9} / Low: {stats.lowestMood || 6}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Energy</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.averageEnergy || 7.2}/10</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Daily vitality level</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Sleep</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.averageSleep || 7.5} hrs</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Recommended: 7-9 hrs</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Stress</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.averageStress || 4.1}/10</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Lower is healthier</p>
        </div>
      </div>

      {/* Monochromatic Chart Container */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('mood_energy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mood_energy'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Mood & Energy
            </button>
            <button
              onClick={() => setActiveTab('sleep_stress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sleep_stress'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Sleep & Stress
            </button>
            <button
              onClick={() => setActiveTab('habits_activity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'habits_activity'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Habits & Movement
            </button>
          </div>

          <span className="text-[11px] font-semibold text-zinc-400">
            {timeline.length} Days Recorded
          </span>
        </div>

        {/* Recharts Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'mood_energy' ? (
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: textFill }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: textFill }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                      borderColor: isDark ? '#27272a' : '#e4e4e7',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke={primaryStroke} strokeWidth={2.5} name="Mood (1-10)" />
                  <Line type="monotone" dataKey="energy" stroke={secondaryStroke} strokeWidth={2} strokeDasharray="4 4" name="Energy (1-10)" />
                </LineChart>
              ) : activeTab === 'sleep_stress' ? (
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: textFill }} />
                  <YAxis tick={{ fontSize: 11, fill: textFill }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                      borderColor: isDark ? '#27272a' : '#e4e4e7',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sleepHours" stroke={primaryStroke} strokeWidth={2.5} name="Sleep (Hours)" />
                  <Line type="monotone" dataKey="stress" stroke={secondaryStroke} strokeWidth={2} strokeDasharray="4 4" name="Stress (1-10)" />
                </LineChart>
              ) : (
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: textFill }} />
                  <YAxis tick={{ fontSize: 11, fill: textFill }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                      borderColor: isDark ? '#27272a' : '#e4e4e7',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="activityMinutes" fill={primaryStroke} radius={[4, 4, 0, 0]} name="Movement (Minutes)" />
                  <Bar dataKey="screenTimeHours" fill={secondaryStroke} radius={[4, 4, 0, 0]} name="Screen Time (Hours)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
              No trend data available for this range.
            </div>
          )}
        </div>
      </div>

      {/* Non-Medical Lifestyle Correlation Insights */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Lifestyle Patterns & Non-Medical Observations
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          FriendAI computes observational statistical correlations between your daily debriefs, activity, and sleep. These represent your personal lifestyle rhythms and are never medical diagnoses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {patterns.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-500">
              Log daily debriefs and check-ins for 3+ days to unlock personalized pattern insights.
            </div>
          ) : (
            patterns.map((pat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="badge-mono text-[9px]">{pat.category || 'lifestyle'}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Correlation</span>
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                  {pat.insight}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {pat.detail}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default MoodAnalytics;
