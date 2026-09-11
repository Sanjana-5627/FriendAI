import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiHelpers } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CheckInModal from '../components/CheckInModal';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  Target, 
  Zap, 
  CheckSquare, 
  Calendar, 
  ArrowRight, 
  Compass, 
  Clock, 
  Users, 
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Circle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiHelpers.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleHabit = async (habitId, habitName, isCompleted) => {
    if (isCompleted) {
      toast('Habit already recorded for today! Keep up the streak.', { icon: '✨' });
      return;
    }
    try {
      await apiHelpers.completeHabit(habitId);
      toast.success(`Completed "${habitName}"!`);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not complete habit');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await apiHelpers.updateTask(taskId, { completed: !currentStatus });
      toast.success(!currentStatus ? 'Task completed!' : 'Task uncompleted');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Assembling your personalized wellness dashboard..." />;
  }

  const wellnessScore = data?.wellnessScore || { total: 75, breakdown: {} };
  const stats = data?.stats || {};
  const socialHealth = data?.socialHealth || { level: 'Good', color: 'emerald', message: '' };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 22) return 'Good Evening';
    return 'Restful Night';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 px-3 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Welcome & Greeting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl">🌱</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {getGreeting()}, {data?.greetingName || 'Friend'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "Consistency beats intensity. One small mindful action changes your whole trajectory."
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!data?.todayCheckInCompleted ? (
            <button
              onClick={() => setCheckInModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Complete Daily Check-In</span>
            </button>
          ) : (
            <button
              onClick={() => setCheckInModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checked in today ({data?.todayCheckIn?.mood}/10)</span>
            </button>
          )}

          <Link
            to="/chat"
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Chat Friend</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards: Wellness Score, Streak, Mood, Social Indicator */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Wellness Score Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Wellness Score</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {wellnessScore.total}
            </span>
            <span className="text-xs text-gray-400 font-medium">/100</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${wellnessScore.total}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 truncate">
            Mood, sleep, habits & connection
          </p>
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Check-in Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-orange-500">
              {stats.currentStreak || 0}
            </span>
            <span className="text-xs text-gray-400 font-medium">consecutive days</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {stats.currentStreak >= 3 ? '🔥 Building incredible momentum!' : 'Check in daily to build your streak.'}
          </p>
        </div>

        {/* Average Mood Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Recent Average Mood</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              {stats.averageMood || 7}
            </span>
            <span className="text-xs text-gray-400 font-medium">/ 10</span>
          </div>
          <Link to="/mood" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 hover:underline">
            <span>View 7-day trend</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Anti-Loneliness / Social Health */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Connection Health</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-2 flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              socialHealth.level === 'Good' 
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            }`}>
              {socialHealth.level}
            </span>
          </div>
          <Link to="/explore" className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center space-x-1 hover:underline">
            <span>Connect & Explore</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* 3. Main Dashboard Grid (2 columns: Left = Schedule & Tasks; Right = Habits, Goals, Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: 7 Cols */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Today's Schedule Preview */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Today's Balanced Timetable</h3>
              </div>
              <Link to="/planner" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Full Day View →
              </Link>
            </div>

            {data?.todaySchedule && data.todaySchedule.length > 0 ? (
              <div className="space-y-2.5">
                {data.todaySchedule.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                      item.completed 
                        ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 line-through text-gray-400'
                        : 'bg-gray-50/70 dark:bg-gray-800/60 border-gray-200/70 dark:border-gray-700/60 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px] bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                        {item.time}
                      </span>
                      <span className="font-medium truncate max-w-[240px] sm:max-w-md">{item.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No timetable scheduled for today. <Link to="/planner" className="text-indigo-500 font-semibold underline">Generate one</Link>
              </div>
            )}
          </div>

          {/* Pending Tasks & Overdue Warnings */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Priority Tasks</h3>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Manage All ({stats.pendingTasksCount || 0}) →
              </Link>
            </div>

            {data?.upcomingTasks && data.upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingTasks.map((task) => {
                  const id = task._id || task.id;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleTask(id, task.completed)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.priority === 'high' || task.priority === 'urgent' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                            {task.priority}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-gray-400 capitalize">{task.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                All tasks are cleared! Take time to breathe or <Link to="/tasks" className="text-indigo-500 underline">add a new task</Link>.
              </p>
            )}
          </div>

          {/* AI Personalized Recommendations Card */}
          {data?.recommendations && data.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Personalized Wellness Suggestion</h3>
              </div>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{rec.description}</p>
                    <div className="mt-2.5 flex justify-end">
                      <Link
                        to="/explore"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Explore Activity Options →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: 5 Cols */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Habits For Today Checklist */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daily Habits</h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {stats.habitsCompletedToday || 0}/{stats.activeHabitsCount || 0} Done
              </span>
            </div>

            {data?.todayHabits && data.todayHabits.length > 0 ? (
              <div className="space-y-2">
                {data.todayHabits.map((habit) => {
                  const id = habit._id || habit.id;
                  const isDone = (habit.completions || []).some(
                    c => new Date(c.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                  );
                  return (
                    <div
                      key={id}
                      onClick={() => handleToggleHabit(id, habit.name, isDone)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-gray-50/70 dark:bg-gray-800/60 border-gray-200/70 dark:border-gray-700/60 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`font-medium ${isDone ? 'text-emerald-900 dark:text-emerald-200' : 'text-gray-800 dark:text-gray-200'}`}>
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{habit.streak?.current || 0}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                No habits set yet. <Link to="/habits" className="text-indigo-500 underline font-semibold">Create one</Link>
              </p>
            )}
          </div>

          {/* Active Goals Progress */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Goals</h3>
              </div>
              <Link to="/goals" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                View All →
              </Link>
            </div>

            {data?.activeGoals && data.activeGoals.length > 0 ? (
              <div className="space-y-3">
                {data.activeGoals.map((goal) => (
                  <div key={goal._id || goal.id} className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{goal.title}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{goal.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">
                No active goals. <Link to="/goals" className="text-purple-500 underline font-semibold">Set a meaningful goal</Link>
              </p>
            )}
          </div>

          {/* AI Insights & Observations */}
          {data?.insights && data.insights.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <span>💡</span>
                <span>Habit Insights</span>
              </h3>
              <div className="space-y-2.5">
                {data.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs">
                    <div className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white mb-0.5">
                      <span>{insight.icon}</span>
                      <span>{insight.title}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-1">{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onCheckInSuccess={fetchDashboard}
      />
    </div>
  );
};

export default Dashboard;
