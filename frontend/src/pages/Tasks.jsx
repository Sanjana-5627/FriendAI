import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Trash2, 
  Circle, 
  CheckCircle2, 
  Tag, 
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active'); // active, completed, all
  const [filterCategory, setFilterCategory] = useState('all');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: 'personal',
    goal_id: ''
  });

  const fetchTasksAndGoals = async () => {
    try {
      setLoading(true);
      const [tasksRes, goalsRes] = await Promise.all([
        apiHelpers.getTasks(),
        apiHelpers.getGoals('active')
      ]);
      setTasks(tasksRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndGoals();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await apiHelpers.createTask({
        ...newTask,
        goal_id: newTask.goal_id || null
      });
      toast.success('Task created');
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'personal',
        goal_id: ''
      });
      setShowAddForm(false);
      fetchTasksAndGoals();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleToggleTask = async (task) => {
    const id = task._id || task.id;
    try {
      await apiHelpers.updateTask(id, { completed: !task.completed });
      toast.success(!task.completed ? '✓ Task completed!' : 'Task uncompleted');
      fetchTasksAndGoals();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (task) => {
    const id = task._id || task.id;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    try {
      await apiHelpers.deleteTask(id);
      toast.success('Task removed');
      fetchTasksAndGoals();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterCategory !== 'all' && (t.category || 'personal') !== filterCategory) return false;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            Focus & Execution
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Tasks & Priorities
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Task'}</span>
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Create Task</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title (e.g. Schedule health checkup)"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="input-field"
              required
            />

            <textarea
              placeholder="Optional notes or instructions..."
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="input-field h-16 resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="wellness">Wellness</option>
                  <option value="social">Social</option>
                  <option value="chores">Chores</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button type="submit" className="btn-primary">Save Task</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs text-xs">
        <div className="flex items-center space-x-1.5">
          {['active', 'completed', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 text-[11px]">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
          >
            <option value="all">All</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="wellness">Wellness</option>
            <option value="social">Social</option>
            <option value="chores">Chores</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <CheckSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No tasks in this view</p>
          <p className="text-xs text-zinc-400 mt-1">Add a task or adjust your filter selection.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const id = task._id || task.id;
            const isDone = task.completed;

            return (
              <div
                key={id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isDone 
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs sm:text-sm font-medium truncate ${
                        isDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {task.title}
                      </span>
                      <span className="badge-mono text-[9px]">
                        {task.priority || 'medium'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Tasks;
