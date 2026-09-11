// User profile management & privacy control routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await storage.findUser({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      profile: user.profile || {}
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch wellness profile' });
  }
});

// Update user's wellness profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profile } = req.body;

    const updates = { updated_at: new Date() };
    if (name && typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }
    if (profile && typeof profile === 'object') {
      updates.profile = profile;
    }

    const updatedUser = await storage.updateUser(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      name: updatedUser.name,
      profile: updatedUser.profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update wellness profile' });
  }
});

// Complete Account Deletion (Privacy & GDPR compliance)
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await storage.deleteUserData(userId);
    res.json({ message: 'All personal data and account have been permanently deleted.' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account data' });
  }
});

export default router;
