// Robust Offline / Algorithmic AI Fallback Engine
// Ensures FriendAI works seamlessly even without a Gemini API key or during network/rate-limit outages.

/**
 * Generates an empathetic journal reflection using sentiment analysis and structured wellness frameworks.
 */
export const generateFallbackJournalAnalysis = (transcription, userProfile = {}) => {
  const text = (transcription || '').toLowerCase();
  
  const positiveWords = ['happy', 'joy', 'grateful', 'great', 'awesome', 'excited', 'productive', 'good', 'calm', 'peaceful', 'accomplished', 'smile', 'loved', 'energized'];
  const negativeWords = ['sad', 'bad', 'terrible', 'lonely', 'anxious', 'stress', 'overwhelmed', 'tired', 'exhausted', 'angry', 'frustrated', 'hopeless', 'depressed', 'stuck', 'isolated'];
  const activityWords = ['walk', 'run', 'gym', 'workout', 'yoga', 'exercise', 'read', 'cooked', 'meditated'];
  const socialWords = ['friend', 'friends', 'family', 'call', 'talked', 'mom', 'dad', 'partner', 'colleague', 'met'];

  let positiveScore = positiveWords.filter(w => text.includes(w)).length;
  let negativeScore = negativeWords.filter(w => text.includes(w)).length;
  let hasActivity = activityWords.some(w => text.includes(w));
  let hasSocial = socialWords.some(w => text.includes(w));

  let moodScore = 6;
  let summary = "Thank you for taking time to reflect on your day. Journaling is a powerful habit for emotional clarity.";
  let consolation = "";
  let motivation = "Every single day is a step forward on your wellness journey.";
  let suggestions = [
    "Take 5 deep breaths and write down one thing you appreciate about yourself today",
    "Prepare your space for a restful, screen-free bedtime routine",
    "Drink a tall glass of water to hydrate your body"
  ];

  if (negativeScore > positiveScore) {
    moodScore = Math.max(2, 6 - (negativeScore - positiveScore));
    summary = "It sounds like today was tough and brought some heavy emotions. Acknowledging these feelings is a courageous first step.";
    consolation = "Be gentle with yourself. You don't have to have everything figured out right now. Rest and self-compassion are what matter most today.";
    motivation = "Difficult days do not define your journey. Tomorrow offers a fresh start and space to breathe.";
    suggestions = [
      "Step away from screens for a 15-minute gentle walk or stretch",
      "Reach out to someone you trust, or jot down your feelings without judgment",
      "Allow yourself an early night of restful sleep"
    ];
  } else if (positiveScore > negativeScore) {
    moodScore = Math.min(10, 7 + (positiveScore - negativeScore));
    summary = "It sounds like you had a vibrant, meaningful day! Celebrating these moments grounds your positive momentum.";
    consolation = "";
    motivation = "Keep holding onto this positive rhythm. You are capable of amazing things!";
    suggestions = [
      "Reflect on what specifically made today feel good so you can repeat it tomorrow",
      "Share some of this positive energy with a friend or loved one",
      "Plan one high-priority goal to tackle tomorrow while your momentum is high"
    ];
  }

  if (hasActivity) {
    suggestions.push("Great job staying physically active today! Notice how movement elevates your mood.");
  }
  if (!hasSocial && negativeScore > 0) {
    suggestions.push("Consider sending a quick 'thinking of you' text to a good friend tomorrow.");
  }

  const nuggets = [
    "Habit science shows that celebrating small wins releases dopamine, reinforcing consistent daily progress.",
    "Studies indicate that even 10 minutes of outdoor sunlight in the morning regulates your circadian rhythm and boosts daytime energy.",
    "Expressing gratitude regularly is linked to a 23% reduction in stress hormone levels.",
    "Taking brief 5-minute pauses between focused work blocks significantly prevents mental fatigue."
  ];

  return {
    summary,
    consolation,
    suggestions: suggestions.slice(0, 3),
    moodScore,
    motivation,
    knowledgeNugget: nuggets[Math.floor(Math.random() * nuggets.length)],
    offlineMode: true
  };
};

/**
 * Conversational companion response generator for chat.
 */
export const generateFallbackChatResponse = (userMessage, context = {}) => {
  const text = (userMessage || '').toLowerCase();
  const userName = context.name || 'friend';
  const interests = (context.interests || []).join(', ');

  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening'];
  const isGreeting = greetings.some(g => text.startsWith(g));

  const questions = ['how are you', 'who are you', 'what can you do', 'help'];
  const isQuestion = questions.some(q => text.includes(q));

  const lonelyWords = ['lonely', 'alone', 'no one', 'isolated', 'bored', 'empty'];
  const isLonely = lonelyWords.some(w => text.includes(w));

  const tiredWords = ['tired', 'exhausted', 'burnt out', 'burnout', 'sleepy'];
  const isTired = tiredWords.some(w => text.includes(w));

  const goalWords = ['goal', 'habit', 'plan', 'task', 'routine', 'start'];
  const isPlanning = goalWords.some(w => text.includes(w));

  let reply = "";
  const suggestions = [];

  if (isGreeting) {
    reply = `Hello ${userName}! 👋 I'm so glad you checked in. How is your day going so far? I'm here to listen, whether you want to reflect, plan your day, or just chat.`;
    suggestions.push("Do a quick daily wellness check-in", "Review today's schedule", "Plan one small goal");
  } else if (isLonely) {
    reply = `I hear you, ${userName}. Feeling disconnected or alone can be really heavy, but I want you to know you're not invisible, and I'm right here with you. When was the last time you stepped outside or heard a familiar voice? Even a tiny change of environment or sending a short text to a friend can help break that feeling of isolation.`;
    suggestions.push("Check the 'Connect & Explore' page for nearby cafes or parks", "Call or text an old friend", "Take a short 10-minute walk outside");
  } else if (isTired) {
    reply = `It sounds like your body and mind are asking for a breather. Constant productivity without adequate rest leads to burnout. Have you had enough water and quality sleep recently? What's one thing you can take off your plate today to give yourself space to rest?`;
    suggestions.push("Take a 15-minute screen-free rest break", "Plan an early wind-down time tonight", "Prioritize just 1 essential task today");
  } else if (isPlanning) {
    reply = `I love that you're focusing on your progress! The secret to sustainable habits is making them too small to fail. Focus on building consistency before scaling intensity. What specific milestone would make you feel proud today?`;
    suggestions.push("Add a specific task to your list", "Schedule a 25-minute focus session", "Review your active goals");
  } else {
    reply = `Thank you for sharing that with me, ${userName}. I'm listening closely. Exploring your thoughts out loud is a great way to make sense of things. How does that situation make you feel right now, and what kind of support would be most helpful?`;
    suggestions.push("Reflect on your current energy level", "Take a brief mindfulness pause", "Turn this reflection into a daily check-in");
  }

  return {
    reply,
    suggestions,
    offlineMode: true
  };
};

/**
 * Breaks a goal into realistic milestones and action steps.
 */
export const generateGoalBreakdown = (title, category = 'personal') => {
  return {
    milestones: [
      { title: `Define specific scope and initial setup for "${title}"`, completed: false },
      { title: "Complete initial 7 days of consistent practice", completed: false },
      { title: "Review mid-way progress and adjust approach", completed: false },
      { title: `Achieve target outcome for ${title}`, completed: false }
    ],
    suggestedTasks: [
      { title: `Research best practices and tools for ${title}`, priority: 'medium' },
      { title: `Dedicate 20 minutes to ${title} this week`, priority: 'high' },
      { title: "Set up a recurring habit to support this goal", priority: 'medium' }
    ]
  };
};

/**
 * Generates an in-depth, empathetic "Day in Review & Reflection" from user's day description.
 */
export const generateFallbackDayReview = (dayText, userProfile = {}, userName = 'friend') => {
  const text = (dayText || '').toLowerCase();

  const positiveWords = ['happy', 'great', 'fun', 'productive', 'proud', 'accomplished', 'relaxed', 'walk', 'coffee', 'read', 'peaceful', 'smile', 'enjoyed', 'laugh', 'good'];
  const negativeWords = ['exhausted', 'tired', 'stress', 'busy', 'hectic', 'rushed', 'angry', 'sad', 'overwhelmed', 'frustrated', 'bad', 'bored', 'lonely', 'hard', 'struggled'];
  const socialWords = ['friend', 'friends', 'mom', 'dad', 'family', 'partner', 'talked', 'met', 'call', 'chatted', 'lunch with', 'dinner with'];
  const workWords = ['work', 'meeting', 'project', 'client', 'code', 'study', 'class', 'exam', 'deadline', 'boss', 'office'];
  const wellnessWords = ['gym', 'walk', 'exercise', 'cooked', 'ate', 'sleep', 'water', 'stretch', 'run', 'hike'];

  const posCount = positiveWords.filter(w => text.includes(w)).length;
  const negCount = negativeWords.filter(w => text.includes(w)).length;
  const hasSocial = socialWords.some(w => text.includes(w));
  const hasWork = workWords.some(w => text.includes(w));
  const hasWellness = wellnessWords.some(w => text.includes(w));

  let headline = "Reflections on Today: Finding Balance";
  let moodScore = 7;
  let energyScore = 6;
  let narrative = "";
  const highlights = [];
  const frictions = [];
  let reflectionPrompt = "";
  let tomorrowIntention = "";

  if (negCount > posCount) {
    headline = "A Demanding Day of Resilience";
    moodScore = Math.max(3, 6 - (negCount - posCount));
    energyScore = Math.max(2, 5 - negCount);
    narrative = `Today demanded a significant amount of your mental and emotional energy, ${userName}. Reading through what you experienced, it's clear you pushed through several moments of friction and fatigue. It is completely natural to feel drained after carrying this kind of load—give yourself credit for navigating it all without needing everything to be perfect.\n\nNotice where your reserves were tested most. Taking time tonight to acknowledge these challenges without judging yourself allows your nervous system to genuinely unwind and recalibrate.`;
    frictions.push("Navigated demanding tasks that depleted cognitive and physical energy");
    if (!hasSocial) frictions.push("Felt isolated or lacked space for meaningful casual connection");
    highlights.push("Stayed resilient and showed up for yourself despite friction");
    reflectionPrompt = "What is one expectation you can gently release tonight before you sleep?";
    tomorrowIntention = "Protect a 20-minute restorative window tomorrow with no screens or obligations.";
  } else if (posCount > negCount) {
    headline = "A Grounded, Fulfilling Day in Flow";
    moodScore = Math.min(10, 7 + (posCount - negCount));
    energyScore = Math.min(10, 7 + posCount);
    narrative = `It sounds like today had a wonderful rhythm, ${userName}! You experienced moments of genuine engagement, flow, and personal satisfaction. What stands out most is how your actions aligned with your values—whether that was getting things done, moving your body, or simply enjoying quiet moments.\n\nDays like today are anchor points. When you take a moment to savor what went right, you train your mind to build on this positive momentum tomorrow.`;
    highlights.push("Experienced fulfilling flow and meaningful moments of progress");
    if (hasWellness) highlights.push("Nurtured your vitality through healthy habits and intentional movement");
    if (hasSocial) highlights.push("Shared uplifting connection with people who matter to you");
    reflectionPrompt = "What was the single most peaceful or satisfying moment of your day today?";
    tomorrowIntention = "Recreate the best condition from today (e.g. your morning walk or quiet focus window).";
  } else {
    headline = "A Steady Day of Quiet Progress";
    moodScore = 6;
    energyScore = 6;
    narrative = `Today was a steady, balanced day with its share of routine and quiet efforts, ${userName}. Not every day needs to be a dramatic breakthrough or a high-stakes adventure; steady days like this are the quiet foundation of your long-term growth and well-being.\n\nYou handled your day's demands and are closing the evening with self-awareness. Taking stock of how your body feels tonight will help you set the pace for tomorrow.`;
    highlights.push("Maintained steady consistency across your daily responsibilities");
    frictions.push("Encountered standard daily fatigue and routine pressures");
    reflectionPrompt = "How does your body feel right now, and what does it need most to feel restored?";
    tomorrowIntention = "Begin tomorrow with 5 minutes of intentional stillness and a glass of water.";
  }

  if (hasWork && !hasWellness) {
    frictions.push("Work/responsibilities took center stage, leaving limited time for physical restoration");
  }

  return {
    headline,
    narrative,
    highlights: highlights.slice(0, 3),
    frictions: frictions.slice(0, 2),
    reflectionPrompt,
    tomorrowIntention,
    moodScore,
    energyScore,
    offlineMode: true
  };
};
