// Goal Management Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { user_id: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const goals = await storage.findGoals(query, { sort: { created_at: -1 } });
    res.json(goals || []);
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category = 'personal', target_date, milestones = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    const formattedMilestones = (milestones || []).map(m => ({
      title: typeof m === 'string' ? m : m.title,
      completed: !!m.completed,
      completed_at: m.completed ? new Date() : null
    }));

    const completedCount = formattedMilestones.filter(m => m.completed).length;
    const initialProgress = formattedMilestones.length > 0 
      ? Math.round((completedCount / formattedMilestones.length) * 100) 
      : 0;

    const newGoal = await storage.createGoal({
      user_id: req.user.id,
      title: title.trim(),
      description: (description || '').trim(),
      category,
      target_date: target_date ? new Date(target_date) : null,
      milestones: formattedMilestones,
      progress: initialProgress,
      status: 'active',
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };

    // Auto-calculate progress if milestones were updated
    if (Array.isArray(updates.milestones) && updates.milestones.length > 0) {
      const completed = updates.milestones.filter(m => m.completed).length;
      updates.progress = Math.round((completed / updates.milestones.length) * 100);
      if (updates.progress === 100 && updates.status !== 'completed') {
        updates.status = 'completed';
        updates.completed_at = new Date();
      }
    }

    const updatedGoal = await storage.updateGoal(id, updates);
    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(updatedGoal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteGoal({ _id: id, user_id: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
