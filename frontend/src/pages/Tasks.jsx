import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Trash2, 
  Circle, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
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
      toast.success('Task created successfully');
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
      toast.success('Task deleted');
      fetchTasksAndGoals();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'active' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200';
      case 'high':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200';
      case 'low':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200';
      default:
        return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Actionable Tasks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Prioritize your day, connect tasks to long-term goals, and maintain clarity
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'New Task'}</span>
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg space-y-4 animate-fade-in text-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Create New Task</h3>
          
          <div>
            <label className="font-semibold block mb-1">Task Title</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add key details or links..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold block mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="wellness">Wellness</option>
                <option value="chores">Chores</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Link to Goal (Optional)</label>
              <select
                value={newTask.goal_id}
                onChange={(e) => setNewTask({ ...newTask, goal_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
              >
                <option value="">No goal linked</option>
                {goals.map(g => (
                  <option key={g._id || g.id} value={g._id || g.id}>{g.title}</option>
                ))}
              </select>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-xs">
        <div className="flex items-center space-x-1.5">
          {['active', 'completed', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border rounded-xl font-medium"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="wellness">Wellness</option>
            <option value="chores">Chores</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No tasks in this view</p>
          <p className="text-xs text-gray-400 mt-1">Add a task or change your filter selection.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const id = task._id || task.id;
            const isDone = task.completed;
            const isOverdue = task.isOverdue;

            return (
              <div
                key={id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDone 
                    ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60'
                    : isOverdue
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 capitalize">
                        • {task.category}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                          Overdue
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm font-bold mt-1 text-gray-900 dark:text-white ${isDone ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {task.due_date && (
                      <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
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
