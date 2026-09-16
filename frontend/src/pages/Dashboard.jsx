import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiHelpers } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CheckInModal from '../components/CheckInModal';
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Compass, 
  Clock, 
  CheckCircle2, 
  Circle,
  BookOpen,
  MessageSquare,
  Moon,
  Zap,
  CheckSquare,
  Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [latestReflection, setLatestReflection] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiHelpers.getDashboard();
      setData(res.data);

      // Also check latest reflection
      try {
        const refRes = await apiHelpers.getReflections();
        if (refRes.data && refRes.data.length > 0) {
          setLatestReflection(refRes.data[0]);
        }
      } catch (e) {
        // silent catch
      }
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
      toast('Habit already recorded for today! Streak active.', { icon: '✓' });
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
      toast.success(!currentStatus ? 'Task completed' : 'Task uncompleted');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Assembling your companion dashboard..." />;
  }

  const wellnessScore = data?.wellnessScore || { total: 75, breakdown: {} };
  const stats = data?.stats || {};
  const habits = data?.habits || [];
  const tasks = data?.tasks || [];
  const timetable = data?.timetable?.items || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 22) return 'Good Evening';
    return 'Restful Night';
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">
      
      {/* 1. Monochromatic Editorial Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            {today}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getGreeting()}, {data?.greetingName || 'Friend'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Your personal space to reflect on your day, build steady routines, and stay grounded.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {!data?.todayCheckInCompleted ? (
            <button
              onClick={() => setCheckInModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Quick Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCheckInModalOpen(true)}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checked in today ({data?.todayCheckIn?.mood}/10)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Hero Centerpiece: THE DAILY DEBRIEF & REFLECTION CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Evening Reflection & Day in Review
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                The heart of FriendAI: Tell your companion how today went, and get an honest, thoughtful review.
              </p>
            </div>
          </div>

          <Link
            to="/chat"
            className="btn-secondary flex items-center space-x-1.5 text-xs self-start sm:self-auto shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>Open Companion</span>
          </Link>
        </div>

        <div className="p-6 sm:p-7">
          {latestReflection ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <span className="badge-happy text-[10px]">
                  {latestReflection.date || new Date(latestReflection.created_at).toISOString().split('T')[0]}
                </span>
                <span>• Latest Review</span>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {latestReflection.headline || latestReflection.ai_response?.headline || "A Day of Quiet Persistence"}
              </h3>

              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                {latestReflection.ai_response?.narrative || latestReflection.transcription}
              </div>

              {latestReflection.ai_response?.reflectionPrompt && (
                <div className="bg-amber-500/10 text-amber-950 dark:text-amber-200 border border-amber-500/20 p-4 rounded-xl flex items-start space-x-3">
                  <Moon className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">Tonight's Reflection</p>
                    <p className="text-xs sm:text-sm font-medium mt-0.5">{latestReflection.ai_response.reflectionPrompt}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">
                  Ready to add more or talk?
                </span>
                <Link
                  to="/chat"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>Debrief more with FriendAI</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                You haven't told FriendAI about your day yet.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Take two minutes to talk about what happened today—what challenged you, what gave you relief, and how you feel right now. FriendAI will generate your personalized Day in Review.
              </p>
              <div className="pt-2">
                <Link
                  to="/chat"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start Your Day Debrief</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Metrics Summary Strip (Minimalist & Monochromatic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Wellness Score</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{wellnessScore.total}</span>
            <span className="text-xs text-zinc-400">/100</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Calculated holistic health</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Active Habit Streak</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.activeStreak || 6}</span>
            <span className="text-xs text-zinc-400">days</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Best current continuity</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Pending Tasks</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.pendingTasks || tasks.filter(t => !t.completed).length}</span>
            <span className="text-xs text-zinc-400">items</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Priority focus for today</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Recent Mood</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{data?.todayCheckIn?.mood || stats.latestMood || 8}</span>
            <span className="text-xs text-zinc-400">/10</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Vitality & emotional state</span>
        </div>
      </div>

      {/* 4. Two-Column Core: Timetable & Habits/Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Today's Timetable */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Today's Daily Timetable</h3>
            </div>
            <Link to="/planner" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">
              View Schedule →
            </Link>
          </div>

          {timetable.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs">
              No schedule generated for today yet.
              <div className="mt-2">
                <Link to="/planner" className="btn-secondary text-xs">Generate Timetable</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timetable.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[11px] text-zinc-400 w-24 shrink-0">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className={`font-medium ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {item.title}
                    </span>
                  </div>
                  <span className="badge-mono text-[9px]">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Habits & Tasks */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Habits & Priorities</h3>
            </div>
            <Link to="/habits" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Manage All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {habits.slice(0, 4).map((habit) => {
              const completed = habit.completedToday;
              return (
                <div
                  key={habit.id || habit._id}
                  onClick={() => handleToggleHabit(habit.id || habit._id, habit.name, completed)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    completed
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200/60 dark:border-zinc-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className={`font-medium ${completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                    <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                    <span>{habit.streak?.current || 0}d</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tasks Strip */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Focus Tasks</span>
              <Link to="/tasks" className="hover:underline">All Tasks</Link>
            </div>
            <div className="space-y-1.5">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id || task._id}
                  onClick={() => handleToggleTask(task.id || task._id, task.completed)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    {task.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span className={`truncate ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="badge-mono text-[9px]">
                    {task.priority || 'medium'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Check-In Modal */}
      <CheckInModal 
        isOpen={checkInModalOpen} 
        onClose={() => setCheckInModalOpen(false)} 
        onSaved={() => {
          setCheckInModalOpen(false);
          fetchDashboard();
        }} 
      />

    </div>
  );
};

export default Dashboard;
