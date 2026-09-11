// AI Companion, Conversational Journaling & Safety Routes
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';
import { detectCrisisIntent, getCrisisSupportResponse } from '../utils/safety.js';
import {
  generateFallbackJournalAnalysis,
  generateFallbackChatResponse,
  generateGoalBreakdown,
  generateFallbackDayReview
} from '../utils/geminiFallback.js';

const router = express.Router();

// Helper to initialize Gemini client safely
const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    return genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn('Gemini client initialization failed, falling back to algorithmic AI:', err.message);
    return null;
  }
};

// Conversational Journal Entry Analysis
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { transcription, context = {} } = req.body;

    if (!transcription || !transcription.trim()) {
      return res.status(400).json({ error: 'Journal reflection text is required' });
    }

    const cleanText = transcription.trim();

    // SAFETY CHECK: Detect severe crisis, self-harm, or distress
    if (detectCrisisIntent(cleanText)) {
      const crisisData = getCrisisSupportResponse();
      // Record safely in journal
      try {
        await storage.createJournalEntry({
          user_id: req.user.id,
          transcription: cleanText,
          ai_response: crisisData,
          mood_score: 1,
          created_at: new Date()
        });
      } catch (err) {
        console.error('Error saving journal crisis entry:', err);
      }
      return res.json(crisisData);
    }

    const user = await storage.findUser({ _id: req.user.id });
    const userProfile = user?.profile || {};

    let analysisResult = null;
    const model = getGeminiModel();

    if (model) {
      try {
        const prompt = `You are FriendAI, an empathetic wellness companion. Analyze this journal entry and provide supportive insights.
Context: User interests: ${(userProfile.interests || []).join(', ')}. Activity level: ${userProfile.fitness_level || 'moderate'}.

Requirements:
1. Provide a warm, supportive summary (2-3 sentences).
2. Offer empathetic consolation if they faced challenges (empty string if positive).
3. Suggest 2-3 realistic, practical, non-overwhelming wellness action steps for tomorrow.
4. Assign a mood score from 1-10 based on overall tone.
5. Share an uplifting motivational note.
6. Share a relevant wellness tip, science fact, or quote.

Return ONLY valid JSON matching this schema:
{
  "summary": "Warm summary",
  "consolation": "Empathetic support or empty string",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "moodScore": 7,
  "motivation": "Encouraging note",
  "knowledgeNugget": "Wellness insight"
}

User's Journal Entry:
"${cleanText}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, switching to algorithmic fallback:', geminiError.message);
      }
    }

    if (!analysisResult) {
      analysisResult = generateFallbackJournalAnalysis(cleanText, userProfile);
    }

    // Sanitize mood score
    const parsedScore = Number(analysisResult.moodScore) || 6;
    analysisResult.moodScore = Math.min(10, Math.max(1, Math.round(parsedScore)));

    // Save journal entry
    try {
      await storage.createJournalEntry({
        user_id: req.user.id,
        transcription: cleanText,
        ai_response: analysisResult,
        mood_score: analysisResult.moodScore,
        created_at: new Date()
      });
    } catch (saveError) {
      console.error('Error saving journal entry:', saveError);
    }

    res.json(analysisResult);
  } catch (error) {
    console.error('Journal analysis route error:', error);
    res.status(500).json({ error: 'Failed to process journal reflection' });
  }
});

// Dedicated Day Debrief & Reflection Generator
router.post('/day-review', authenticateToken, async (req, res) => {
  try {
    const { text, date } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Please describe what happened during your day' });
    }

    const cleanText = text.trim();

    if (detectCrisisIntent(cleanText)) {
      const crisisData = getCrisisSupportResponse();
      return res.json({ isCrisis: true, ...crisisData });
    }

    const user = await storage.findUser({ _id: req.user.id });
    const userProfile = user?.profile || {};
    const userName = user?.name || 'friend';

    let reviewResult = null;
    const model = getGeminiModel();

    if (model) {
      try {
        const prompt = `You are FriendAI, a wise, warm, perceptive personal friend and companion for ${userName}.
${userName} has just shared their complete story of how their day went.
User's story:
"${cleanText}"

Write a heartfelt, emotionally intelligent Daily Review and Evening Reflection. Do not be generic or clinical. Talk like an empathetic, thoughtful lifelong confidant.

Return ONLY a JSON object matching this schema:
{
  "headline": "A poetic or evocative 4-8 word title summarizing the essence of their day",
  "narrative": "2-3 paragraphs of warm, insightful review. Acknowledge their effort, validate what felt heavy, and mirror the beauty of what went well.",
  "highlights": ["Highlight 1", "Highlight 2"],
  "frictions": ["Friction or fatigue point 1", "Friction point 2"],
  "reflectionPrompt": "A single, deep, grounding question for them to ponder quietly tonight",
  "tomorrowIntention": "One realistic, gentle micro-ritual or focus for tomorrow",
  "moodScore": 8,
  "energyScore": 7
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reviewResult = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('Gemini day review failed, using fallback:', err.message);
      }
    }

    if (!reviewResult) {
      reviewResult = generateFallbackDayReview(cleanText, userProfile, userName);
    }

    const todayDate = date || new Date().toISOString().split('T')[0];

    // Persist as a structured Day Reflection Journal Entry
    const savedEntry = await storage.createJournalEntry({
      user_id: req.user.id,
      transcription: cleanText,
      type: 'day_review',
      date: todayDate,
      headline: reviewResult.headline,
      ai_response: reviewResult,
      mood_score: reviewResult.moodScore || 7,
      created_at: new Date()
    });

    res.json({
      id: savedEntry.id || savedEntry._id,
      date: todayDate,
      ...reviewResult
    });
  } catch (error) {
    console.error('Day review generation error:', error);
    res.status(500).json({ error: 'Failed to generate day review' });
  }
});

// Retrieve user's historical Day Reflections and Journal entries
router.get('/reflections', authenticateToken, async (req, res) => {
  try {
    const entries = await storage.findJournalEntries(
      { user_id: req.user.id },
      { sort: { created_at: -1 } }
    );
    res.json(entries || []);
  } catch (error) {
    console.error('Fetch reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

// Interactive AI Companion Chat with Context & Safety
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const cleanMessage = message.trim();

    // SAFETY CHECK: Detect severe crisis, self-harm, or distress
    if (detectCrisisIntent(cleanMessage)) {
      return res.json(getCrisisSupportResponse());
    }

    const user = await storage.findUser({ _id: req.user.id });
    const userProfile = user?.profile || {};
    const userName = user?.name || 'friend';

    let chatReply = null;
    const model = getGeminiModel();

    if (model) {
      try {
        const recentHistory = history.slice(-6).map(h => `${h.type === 'user' ? 'User' : 'FriendAI'}: ${h.content}`).join('\n');
        const prompt = `You are FriendAI, a personal wellness and anti-loneliness companion for ${userName}.
You are warm, empathetic, realistic, and encouraging. You are an AI companion, NOT a doctor, therapist, or emergency service.
User context:
- Name: ${userName}
- Age group: ${userProfile.age_range || 'adult'}
- Interests: ${(userProfile.interests || []).join(', ')}
- Work/study routine: ${userProfile.work_schedule?.type || 'standard'}
- Preferred activities: ${(userProfile.preferred_activities || []).join(', ')}

Recent conversation:
${recentHistory}

User's new message:
"${cleanMessage}"

Guidelines:
1. Respond warmly and conversationally in 2-4 sentences.
2. Validate their feelings without hollow toxic positivity.
3. If they mention feeling lonely, overwhelmed, or stuck, gently propose 1 small real-world action (e.g. taking a walk, having tea, calling a friend, visiting a cafe).
4. If relevant, propose 1-3 practical suggestion bullet points.
5. Never pretend to be human or provide medical diagnosis.

Respond in JSON format:
{
  "reply": "Your conversational response",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          chatReply = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('Gemini chat error, using algorithmic fallback:', err.message);
      }
    }

    if (!chatReply) {
      chatReply = generateFallbackChatResponse(cleanMessage, {
        name: userName,
        interests: userProfile.interests
      });
    }

    res.json(chatReply);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate companion response' });
  }
});

// Break down Goal into Actionable Milestones & Tasks with AI
router.post('/breakdown-goal', authenticateToken, async (req, res) => {
  try {
    const { title, category = 'personal' } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    let breakdown = null;
    const model = getGeminiModel();

    if (model) {
      try {
        const prompt = `Break down this personal goal into 4 structured, realistic chronological milestones and 3 actionable initial tasks.
Goal: "${title}" (Category: ${category})

Respond with ONLY valid JSON in this format:
{
  "milestones": [
    { "title": "Milestone 1 description", "completed": false },
    { "title": "Milestone 2 description", "completed": false },
    { "title": "Milestone 3 description", "completed": false },
    { "title": "Milestone 4 description", "completed": false }
  ],
  "suggestedTasks": [
    { "title": "Initial quick action step 1", "priority": "high" },
    { "title": "Setup action step 2", "priority": "medium" },
    { "title": "Follow-up practice step 3", "priority": "medium" }
  ]
}`;
        const result = await model.generateContent(prompt);
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) breakdown = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.warn('Gemini goal breakdown error, using fallback:', err.message);
      }
    }

    if (!breakdown) {
      breakdown = generateGoalBreakdown(title, category);
    }

    res.json(breakdown);
  } catch (error) {
    console.error('Goal breakdown error:', error);
    res.status(500).json({ error: 'Failed to break down goal' });
  }
});

// Speech & TTS helper endpoints (Browser handles client-side speech synthesis & recognition)
router.post('/transcribe', authenticateToken, (req, res) => {
  res.json({
    transcription: '',
    message: 'Speech recognition is handled in the browser via Web Speech API',
    audioReceived: true
  });
});

router.post('/speak', authenticateToken, (req, res) => {
  res.json({
    fallback: true,
    message: 'Speech synthesis is handled in the browser via Web Speech API',
    text: req.body.text || ''
  });
});

export default router;
