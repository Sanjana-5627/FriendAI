// Task Management Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all user tasks with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { completed, category, priority, goal_id } = req.query;
    const query = { user_id: req.user.id };

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }
    if (goal_id) {
      query.goal_id = goal_id;
    }

    const tasks = await storage.findTasks(query, { sort: { due_date: 1, created_at: -1 } });

    // Mark overdue status dynamically
    const now = new Date();
    const tasksWithOverdue = tasks.map(task => {
      const isOverdue = !task.completed && task.due_date && new Date(task.due_date) < now;
      return {
        ...task,
        isOverdue
      };
    });

    res.json(tasksWithOverdue);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, due_date, priority = 'medium', category = 'personal', goal_id = null } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask = await storage.createTask({
      user_id: req.user.id,
      title: title.trim(),
      description: (description || '').trim(),
      due_date: due_date ? new Date(due_date) : null,
      priority,
      category,
      goal_id,
      completed: false,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };

    const currentTask = await storage.findTask({ _id: id, user_id: req.user.id });
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (updates.completed !== undefined) {
      updates.completed_at = updates.completed ? new Date() : null;
    }

    const updatedTask = await storage.updateTask(id, updates);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteTask({ _id: id, user_id: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
