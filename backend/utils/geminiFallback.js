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
