import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  Check, 
  Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('active'); // active, completed, all
  const [breakingDown, setBreakingDown] = useState(null); // goal id

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    milestones: []
  });

  const [milestoneInput, setMilestoneInput] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await apiHelpers.getGoals(filter === 'all' ? null : filter);
      setGoals(res.data || []);
    } catch (err) {
      console.error('Fetch goals error:', err);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: milestoneInput.trim(), completed: false }]
    }));
    setMilestoneInput('');
  };

  const handleRemoveMilestone = (idx) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      await apiHelpers.createGoal(newGoal);
      toast.success('🎉 Goal established!');
      setNewGoal({ title: '', description: '', category: 'personal', target_date: '', milestones: [] });
      setShowAddForm(false);
      fetchGoals();
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleToggleMilestone = async (goal, milestoneIdx) => {
    const goalId = goal._id || goal.id;
    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIdx].completed = !updatedMilestones[milestoneIdx].completed;

    try {
      await apiHelpers.updateGoal(goalId, { milestones: updatedMilestones });
      fetchGoals();
    } catch (err) {
      toast.error('Failed to update milestone');
    }
  };

  const handleBreakdownWithAI = async (goal) => {
    const goalId = goal._id || goal.id;
    setBreakingDown(goalId);
    try {
      const res = await apiHelpers.breakdownGoal(goal.title, goal.category);
      const { milestones, suggestedTasks } = res.data;

      // Update goal milestones
      await apiHelpers.updateGoal(goalId, { milestones });

      // Automatically add suggested tasks to user tasks list
      if (suggestedTasks && suggestedTasks.length > 0) {
        for (const st of suggestedTasks) {
          await apiHelpers.createTask({
            title: st.title,
            priority: st.priority || 'medium',
            category: 'personal',
            goal_id: goalId
          });
        }
      }

      toast.success('✨ AI generated 4 milestones & action tasks!');
      fetchGoals();
    } catch (err) {
      toast.error('AI breakdown failed');
    } finally {
      setBreakingDown(null);
    }
  };

  const handleDeleteGoal = async (goal) => {
    const goalId = goal._id || goal.id;
    if (!window.confirm(`Delete goal "${goal.title}"?`)) return;

    try {
      await apiHelpers.deleteGoal(goalId);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Personal Goals & Milestones
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Turn broad aspirations into concrete, achievable milestones with AI action steps
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg space-y-4 animate-fade-in text-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Create New Goal</h3>

          <div>
            <label className="font-semibold block mb-1">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Run a 5K race, Read 12 books, Learn Python..."
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              >
                <option value="health">Health & Wellness</option>
                <option value="career">Career & Work</option>
                <option value="learning">Learning & Skills</option>
                <option value="financial">Financial</option>
                <option value="relationships">Relationships</option>
                <option value="personal">Personal Growth</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Target Completion Date</label>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Milestones</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Add milestone step..."
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 font-bold rounded-xl"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1">
              {newGoal.milestones.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg text-xs">
                  <span>{i + 1}. {m.title}</span>
                  <button type="button" onClick={() => handleRemoveMilestone(i)} className="text-red-500 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-500 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-xs">
        {['active', 'completed', 'all'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-colors ${
              filter === st
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Goal Cards */}
      {loading ? (
        <LoadingSpinner text="Loading your goals..." />
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No goals found</p>
          <p className="text-xs text-gray-400 mt-1">Start by creating an inspiring goal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const goalId = goal._id || goal.id;
            const isBreaking = breakingDown === goalId;
            return (
              <div
                key={goalId}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
                        {goal.category}
                      </span>
                      {goal.target_date && (
                        <span className="text-[11px] text-gray-400">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleBreakdownWithAI(goal)}
                      disabled={isBreaking}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isBreaking ? 'animate-spin' : ''}`} />
                      <span>{isBreaking ? 'Breaking down...' : 'Break Down with AI'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestones list */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Milestones
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {goal.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleMilestone(goal, idx)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2.5 cursor-pointer transition-colors ${
                            m.completed 
                              ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300' 
                              : 'bg-gray-50/70 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/60 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span className={`truncate ${m.completed ? 'line-through text-gray-400' : ''}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Goals;
