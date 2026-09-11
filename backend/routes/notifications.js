// In-App Notification Center Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate contextual notifications for user if empty
const generateInitialNotifications = async (userId) => {
  const [tasks, habits, todayCheckIn] = await Promise.all([
    storage.findTasks({ user_id: userId, completed: false }),
    storage.findHabits({ user_id: userId, active: true }),
    storage.findOneWellnessCheckIn({ user_id: userId, date: new Date().toISOString().split('T')[0] })
  ]);

  if (!todayCheckIn) {
    await storage.createNotification({
      user_id: userId,
      title: 'Daily Wellness Check-In Ready',
      message: 'Take 45 seconds to log your mood and energy for personalized recommendations.',
      type: 'checkin',
      link: '/dashboard'
    });
  }

  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
  if (overdue.length > 0) {
    await storage.createNotification({
      user_id: userId,
      title: `${overdue.length} Overdue Task${overdue.length > 1 ? 's' : ''}`,
      message: 'Review or reschedule your pending tasks to stay stress-free.',
      type: 'task',
      link: '/tasks'
    });
  }

  if (habits.length > 0) {
    await storage.createNotification({
      user_id: userId,
      title: 'Keep Your Habit Streak Going',
      message: `You have ${habits.length} active habits to check off today!`,
      type: 'habit',
      link: '/habits'
    });
  }
};

// Get notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    let notifications = await storage.findNotifications(
      { user_id: req.user.id },
      { sort: { created_at: -1 }, limit: 15 }
    );

    if (notifications.length === 0) {
      await generateInitialNotifications(req.user.id);
      notifications = await storage.findNotifications(
        { user_id: req.user.id },
        { sort: { created_at: -1 }, limit: 15 }
      );
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const updated = await storage.markNotificationRead(req.params.id, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await storage.markAllNotificationsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
