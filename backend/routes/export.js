// Complete Personal Data Export Routes (JSON & CSV)
import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user.id;

    const [user, journalEntries, checkIns, tasks, goals, habits, schedule] = await Promise.all([
      storage.findUser({ _id: userId }),
      storage.findJournalEntries({ user_id: userId }, { sort: { created_at: -1 } }),
      storage.findWellnessCheckIns({ user_id: userId }, { sort: { date: -1 } }),
      storage.findTasks({ user_id: userId }, { sort: { created_at: -1 } }),
      storage.findGoals({ user_id: userId }, { sort: { created_at: -1 } }),
      storage.findHabits({ user_id: userId }, { sort: { created_at: -1 } }),
      storage.findSchedule({ user_id: userId, date: new Date().toISOString().split('T')[0] })
    ]);

    const exportPackage = {
      export_version: '2.0.0',
      exported_at: new Date().toISOString(),
      user: {
        id: userId,
        name: user?.name,
        email: user?.email,
        profile: user?.profile
      },
      wellness_check_ins: checkIns || [],
      journal_entries: (journalEntries || []).map(j => ({
        date: j.created_at,
        transcription: j.transcription,
        mood_score: j.mood_score,
        summary: j.ai_response?.summary
      })),
      tasks: (tasks || []).map(t => ({
        title: t.title,
        priority: t.priority,
        category: t.category,
        completed: t.completed,
        due_date: t.due_date
      })),
      goals: (goals || []).map(g => ({
        title: g.title,
        category: g.category,
        progress: g.progress,
        status: g.status,
        milestones: g.milestones
      })),
      habits: (habits || []).map(h => ({
        name: h.name,
        category: h.category,
        frequency: h.frequency,
        streak: h.streak,
        completions_count: (h.completions || []).length
      })),
      today_schedule: schedule?.items || []
    };

    if (format === 'csv') {
      let csv = 'Type,Date,Title/Content,Score/Status,Category,Extra\n';
      
      (checkIns || []).forEach(c => {
        csv += `"Check-In","${c.date}","Mood: ${c.mood}, Energy: ${c.energy}","${c.mood}/10","Wellness","Sleep: ${c.sleep_hours}h, Screen: ${c.screen_time_hours}h"\n`;
      });

      (journalEntries || []).forEach(j => {
        const d = j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '';
        const cleanTxt = (j.transcription || '').replace(/"/g, '""');
        csv += `"Journal","${d}","${cleanTxt}","${j.mood_score || 'N/A'}","Reflection",""\n`;
      });

      (tasks || []).forEach(t => {
        const d = t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '';
        csv += `"Task","${d}","${t.title.replace(/"/g, '""')}","${t.completed ? 'Completed' : 'Pending'}","${t.category}","Priority: ${t.priority}"\n`;
      });

      (habits || []).forEach(h => {
        csv += `"Habit","","${h.name.replace(/"/g, '""')}","Streak: ${h.streak?.current || 0}","${h.category}","Completions: ${h.completions?.length || 0}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="friendai-wellness-export.csv"');
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="friendai-wellness-export.json"');
    res.json(exportPackage);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export wellness data' });
  }
});

export default router;
