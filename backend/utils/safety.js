// Safety & Crisis Intervention Utility
// Detects severe emotional distress, self-harm, or crisis intent and provides empathetic support & emergency resources

export const CRISIS_RESOURCES = {
  us: {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text HOME to 741741 (Crisis Text Line)',
    website: 'https://988lifeline.org'
  },
  international: [
    { country: 'United States & Canada', contact: 'Call 988 or text HOME to 741741' },
    { country: 'United Kingdom', contact: 'Call 111 (NHS) or 116 123 (Samaritans)' },
    { country: 'India', contact: 'KIRAN: 1800-599-0019 or Vandrevala: 9999 666 555' },
    { country: 'Australia', contact: 'Call 13 11 14 (Lifeline)' },
    { country: 'Europe', contact: 'Call 112 (Emergency Services)' }
  ]
};

const CRISIS_PATTERNS = [
  /\b(suicide|kill\s+(myself|me)|end\s+my\s+life|want\s+to\s+die|better\s+off\s+dead)\b/i,
  /\b(self[- ]?harm|cutting\s+(myself|my)|hurt\s+(myself|me)|hang\s+(myself|me))\b/i,
  /\b(can'?t\s+go\s+on\s+any\s+more|no\s+reason\s+to\s+live|don'?t\s+want\s+to\s+wake\s+up)\b/i,
  /\b(overdose\s+(on|pills)|swallow\s+pills\s+to\s+die)\b/i
];

/**
 * Checks text for signs of acute emotional distress, self-harm, or crisis.
 * @param {string} text - User message or transcription
 * @returns {boolean}
 */
export const detectCrisisIntent = (text) => {
  if (!text || typeof text !== 'string') return false;
  return CRISIS_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Returns a warm, empathetic safety response with real crisis helpline contacts.
 * @param {string} [userName]
 * @returns {object}
 */
export const getCrisisSupportResponse = (userName = 'friend') => {
  return {
    isCrisis: true,
    message: `I hear how much pain you're in right now, and I want you to know that you are not alone. Please remember that you matter and there is support available. Because I am an AI companion and cannot provide crisis or medical care, please reach out right now to someone who can help you safely through this:

• 📞 Call or Text 988 (USA & Canada - 24/7 free & confidential Suicide & Crisis Lifeline)
• 💬 Text HOME to 741741 (Crisis Text Line)
• 🌍 UK: Call 111 or 116 123 (Samaritans) | India: 1800-599-0019 (Kiran) | Australia: 13 11 14
• 🚨 In immediate physical danger: Call your local emergency services (911 / 112 / 999).

Please talk to a trusted friend, family member, or qualified professional right now. People care about you and want to be there for you.`,
    resources: CRISIS_RESOURCES,
    summary: "Crisis intervention support provided with emergency resources.",
    moodScore: 1,
    suggestions: [
      "Contact 988 or your local crisis helpline right now",
      "Reach out to a trusted family member or close friend",
      "Stay in a safe place with someone you trust"
    ]
  };
};
