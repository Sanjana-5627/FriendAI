// Recommendation Engine & Nearby Places/Activities Routes
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';
import { filterPlacesAndActivities, CURATED_PLACES_AND_ACTIVITIES } from '../utils/placesData.js';

const router = express.Router();

/**
 * Generates personalized anti-loneliness & wellness recommendations based on recent check-in patterns.
 */
const evaluatePersonalizedRecommendations = async (userId) => {
  const [user, checkIns, habits, tasks] = await Promise.all([
    storage.findUser({ _id: userId }),
    storage.findWellnessCheckIns({ user_id: userId }, { sort: { date: -1 }, limit: 5 }),
    storage.findHabits({ user_id: userId, active: true }),
    storage.findTasks({ user_id: userId, completed: false })
  ]);

  const profile = user?.profile || {};
  const recs = [];

  const recentCheckIn = checkIns[0];
  const lowSocial = !recentCheckIn || recentCheckIn.social_interaction === 'none' || recentCheckIn.social_interaction === 'low';
  const highScreen = recentCheckIn && recentCheckIn.screen_time_hours >= 6;
  const lowActivity = !recentCheckIn || recentCheckIn.physical_activity === 'none';

  // Anti-loneliness trigger
  if (lowSocial) {
    recs.push({
      user_id: userId,
      type: 'anti_loneliness',
      title: 'Gentle Connection: Phone Call or Voice Note',
      description: 'You\'ve had limited social contact recently. Sending a short 2-minute voice note to an old friend can instantly rekindle warmth without feeling overwhelming.',
      category: 'social',
      action_type: 'add_task',
      action_payload: { taskTitle: 'Send a quick voice note or text to a friend', priority: 'medium' },
      status: 'active'
    });

    recs.push({
      user_id: userId,
      type: 'anti_loneliness',
      title: 'Study or Read from a Cozy Neighborhood Cafe',
      description: 'Working or reading around other people provides ambient social connection and lifts feelings of isolation.',
      category: 'social',
      action_type: 'explore_places',
      action_payload: { category: 'cafe' },
      status: 'active'
    });
  }

  // High screen time trigger
  if (highScreen) {
    recs.push({
      user_id: userId,
      type: 'wellness_break',
      title: 'Outdoor Sunlight & Green Space Reset',
      description: 'High screen time can strain focus and mood. A 20-minute walk in a nearby park or botanical garden refreshes mental energy.',
      category: 'wellness',
      action_type: 'explore_places',
      action_payload: { category: 'park' },
      status: 'active'
    });
  }

  // Low physical activity trigger
  if (lowActivity) {
    recs.push({
      user_id: userId,
      type: 'activity',
      title: 'Gentle Evening Stroll along the Trail',
      description: 'Even 15 minutes of light walking boosts endorphins and improves tonight\'s sleep quality.',
      category: 'fitness',
      action_type: 'add_task',
      action_payload: { taskTitle: '15-minute evening walk outside', priority: 'low' },
      status: 'active'
    });
  }

  // General interest-based discovery
  const interest = (profile.interests || [])[0] || 'reading';
  recs.push({
    user_id: userId,
    type: 'activity',
    title: `Explore Community ${interest.charAt(0).toUpperCase() + interest.slice(1)} Spaces`,
    description: `Discover local venues tailored to your interest in ${interest}. A wonderful way to meet like-minded people.`,
    category: 'hobby',
    action_type: 'explore_places',
    action_payload: { category: 'workshop' },
    status: 'active'
  });

  return recs;
};

// Get active personalized recommendations
router.get('/', authenticateToken, async (req, res) => {
  try {
    let existingRecs = await storage.findRecommendations(
      { user_id: req.user.id, status: 'active' },
      { sort: { created_at: -1 }, limit: 6 }
    );

    if (existingRecs.length === 0) {
      const newRecs = await evaluatePersonalizedRecommendations(req.user.id);
      for (const rec of newRecs) {
        await storage.createRecommendation(rec);
      }
      existingRecs = await storage.findRecommendations(
        { user_id: req.user.id, status: 'active' },
        { sort: { created_at: -1 }, limit: 6 }
      );
    }

    res.json(existingRecs);
  } catch (error) {
    console.error('Fetch recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Update recommendation status (accept, complete, dismiss)
router.put('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'accepted', 'completed', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await storage.updateRecommendation(id, { status });
    res.json(updated);
  } catch (error) {
    console.error('Recommendation feedback error:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Nearby Places & Activities Directory with rich filters
router.get('/places', authenticateToken, (req, res) => {
  try {
    const { category, cost, indoorOutdoor, maxDistanceKm, search } = req.query;
    const filtered = filterPlacesAndActivities({
      category,
      cost,
      indoorOutdoor,
      maxDistanceKm,
      search
    });

    res.json(filtered);
  } catch (error) {
    console.error('Places fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch places & activities' });
  }
});

export default router;
