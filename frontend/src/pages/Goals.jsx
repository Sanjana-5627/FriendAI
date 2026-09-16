import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Check, 
  Layers,
  Pencil,
  X,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('active'); // active, completed, all
  const [breakingDown, setBreakingDown] = useState(null); // goal id
  const [editingGoal, setEditingGoal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    milestones: []
  });
  const [editMilestoneInput, setEditMilestoneInput] = useState('');

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
      toast.success('Goal established');
      setNewGoal({ title: '', description: '', category: 'personal', target_date: '', milestones: [] });
      setShowAddForm(false);
      fetchGoals();
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleStartEdit = (goal) => {
    setEditingGoal(goal);
    const dateVal = goal.target_date 
      ? new Date(goal.target_date).toISOString().split('T')[0] 
      : (goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
    
    setEditFormData({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || 'personal',
      target_date: dateVal,
      milestones: (goal.milestones || []).map(m => ({
        title: typeof m === 'string' ? m : m.title,
        completed: !!m.completed
      }))
    });
    setEditMilestoneInput('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      toast.error('Goal title is required');
      return;
    }
    const goalId = editingGoal._id || editingGoal.id;
    try {
      await apiHelpers.updateGoal(goalId, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        category: editFormData.category,
        target_date: editFormData.target_date || null,
        deadline: editFormData.target_date || null,
        milestones: editFormData.milestones
      });
      toast.success('Goal updated successfully! ✓');
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const handleAddEditMilestone = () => {
    if (!editMilestoneInput.trim()) return;
    setEditFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: editMilestoneInput.trim(), completed: false }]
    }));
    setEditMilestoneInput('');
  };

  const handleRemoveEditMilestone = (idx) => {
    setEditFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== idx)
    }));
  };

  const handleEditMilestoneChange = (idx, newTitle) => {
    setEditFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === idx ? { ...m, title: newTitle } : m)
    }));
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
      const newMilestones = (res.data.milestones || []).map(m => ({ title: m.title || m, completed: false }));
      
      const combined = [...(goal.milestones || []), ...newMilestones];
      await apiHelpers.updateGoal(goalId, { milestones: combined });
      
      // Auto-create initial suggested tasks if available
      if (res.data.suggestedTasks && res.data.suggestedTasks.length > 0) {
        for (const t of res.data.suggestedTasks) {
          try {
            await apiHelpers.createTask({
              title: `${t.title} (${goal.title})`,
              priority: t.priority || 'medium',
              category: goal.category === 'fitness' ? 'fitness' : (goal.category === 'career' ? 'work' : 'wellness')
            });
          } catch (taskErr) {
            // Ignore individual task error
          }
        }
        toast.success(`✓ Added ${newMilestones.length} milestones & ${res.data.suggestedTasks.length} starter tasks!`);
      } else {
        toast.success(`✓ Generated ${newMilestones.length} AI action milestones!`);
      }
      fetchGoals();
    } catch (err) {
      console.error('Breakdown goal error:', err);
      toast.error('Could not generate AI steps. Please try again.');
    } finally {
      setBreakingDown(null);
    }
  };

  const handleDeleteGoal = async (goal) => {
    const goalId = goal._id || goal.id;
    if (!window.confirm(`Delete goal "${goal.title}"?`)) return;

    try {
      await apiHelpers.deleteGoal(goalId);
      toast.success('Goal removed');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            Intentions & Milestones
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Personal Goals
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Turn long-term aspirations into progressive, bite-sized daily milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Goal'}</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Establish Goal</h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title (e.g. Build an Energizing Morning Routine)"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              className="input-field"
              required
            />

            <textarea
              placeholder="Why this goal matters to your well-being..."
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="input-field h-16 resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="Health">Health & Fitness</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Career">Career & Craft</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Relationships">Social & Relationships</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            {/* Milestones Add */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Action Milestones</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add milestone (e.g. Walk 15 min every morning)"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); }}}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="btn-secondary px-3"
                >
                  Add
                </button>
              </div>

              {newGoal.milestones.length > 0 && (
                <div className="mt-2 space-y-1">
                  {newGoal.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                      <span>{m.title}</span>
                      <button type="button" onClick={() => handleRemoveMilestone(i)} className="text-zinc-400 hover:text-zinc-600">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button type="submit" className="btn-primary">Create Goal</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        {['active', 'completed', 'all'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === st
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <Target className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No goals found</p>
          <p className="text-xs text-zinc-400 mt-1">Start by establishing an intention.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const goalId = goal._id || goal.id;
            const isBreaking = breakingDown === goalId;
            const milestones = goal.milestones || [];
            const doneCount = milestones.filter(m => m.completed).length;
            const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : (goal.progress || 0);

            return (
              <div
                key={goalId}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="badge-mono text-[9px]">
                        {goal.category}
                      </span>
                      {goal.deadline && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Target: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleBreakdownWithAI(goal)}
                      disabled={isBreaking}
                      className="btn-secondary text-xs flex items-center space-x-1.5"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isBreaking ? 'animate-spin' : ''}`} />
                      <span>{isBreaking ? 'Breaking down...' : 'AI Steps'}</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(goal)}
                      className="p-1.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones List */}
                {milestones.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Milestones ({doneCount}/{milestones.length})
                    </span>
                    <div className="space-y-1.5">
                      {milestones.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          onClick={() => handleToggleMilestone(goal, mIdx)}
                          className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-amber-50/50 dark:hover:bg-stone-800/60 cursor-pointer text-xs transition-colors"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <span className={`${m.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
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

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Edit Goal</h3>
              </div>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g. Run a 5K race, Read 10 books"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why this matters to you..."
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    <option value="personal">Personal Growth</option>
                    <option value="fitness">Health & Fitness</option>
                    <option value="career">Career & Study</option>
                    <option value="learning">Skill & Learning</option>
                    <option value="mindfulness">Mindfulness & Rest</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.target_date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Milestones Editor */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Milestones ({editFormData.milestones.length})
                </label>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editFormData.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[10px] text-stone-400 font-mono w-4 shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleEditMilestoneChange(idx, e.target.value)}
                        className="input-field py-1.5 text-xs flex-1"
                        placeholder="Milestone title"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditMilestone(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                        title="Remove milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new milestone row */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={editMilestoneInput}
                    onChange={(e) => setEditMilestoneInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditMilestone(); } }}
                    placeholder="Add a new milestone step..."
                    className="input-field py-1.5 text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditMilestone}
                    className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Goals;
