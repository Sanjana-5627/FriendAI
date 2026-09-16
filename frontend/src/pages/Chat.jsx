import React, { useState, useRef, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Send, 
  Sparkles, 
  CheckSquare, 
  Zap, 
  Plus, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  ShieldAlert,
  Bot,
  User,
  BookOpen,
  MessageSquare,
  History,
  Calendar,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import SafetyCrisisModal from '../components/SafetyCrisisModal';

const PROMPT_STARTERS = [
  "My morning started rushed with work, but in the afternoon I took a walk...",
  "Today was really draining and stressful, especially dealing with...",
  "It was a surprisingly calm and productive day. I managed to...",
  "I felt a bit disconnected and lonely today, and spent too much time on screens..."
];

const Chat = () => {
  const [activeTab, setActiveTab] = useState('debrief'); // 'debrief' | 'chat' | 'history'
  
  // Day Debrief state
  const [dayStory, setDayStory] = useState('');
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [pastReflections, setPastReflections] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  // Chat dialogue state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat & past reflections
  useEffect(() => {
    loadChatHistory();
    loadPastReflections();
    setupSpeechRecognition();
  }, []);

  const loadPastReflections = async () => {
    try {
      const res = await apiHelpers.getReflections();
      setPastReflections(res.data || []);
      // If today already has a reflection, show it
      const today = new Date().toISOString().split('T')[0];
      const todayReflection = (res.data || []).find(r => r.date === today && r.ai_response);
      if (todayReflection) {
        setCurrentReview(todayReflection.ai_response);
      }
    } catch (err) {
      console.warn('Could not load past reflections:', err);
    }
  };

  const loadChatHistory = () => {
    const saved = localStorage.getItem('friendai_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  };

  const initializeWelcomeMessage = () => {
    setMessages([{
      type: 'ai',
      content: "Hello. I'm here as your personal confidant. Whether you want to talk about how your day felt, work through something weighing on your mind, or plan tomorrow, I'm listening.",
      timestamp: new Date().toISOString()
    }]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('friendai_chat_history', JSON.stringify(messages.slice(-30)));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech Recognition
  const setupSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'debrief') {
          setDayStory(prev => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setChatInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  };

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening...', { icon: '🎙️' });
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // 1. Submit Day Debrief
  const handleGenerateDayReview = async () => {
    if (!dayStory.trim()) {
      toast.error('Please share a few sentences about your day.');
      return;
    }

    setIsDebriefLoading(true);
    try {
      const res = await apiHelpers.generateDayReview(dayStory.trim());
      if (res.data.isCrisis) {
        setSafetyModalOpen(true);
        return;
      }
      setCurrentReview(res.data);
      toast.success('Your Day in Review has been generated.');
      loadPastReflections();
    } catch (err) {
      console.error('Day review error:', err);
      toast.error('Could not generate day review. Please try again.');
    } finally {
      setIsDebriefLoading(false);
    }
  };

  // 2. Chat message send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = {
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await apiHelpers.chat(userMessage.content, newHistory.slice(-6));
      
      if (res.data.isCrisis) {
        setSafetyModalOpen(true);
      }

      const aiReply = {
        type: 'ai',
        content: res.data.reply || res.data.message,
        suggestions: res.data.suggestions || [],
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiReply]);

      if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiReply.content);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to receive response.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAddActionAsTask = async (title) => {
    try {
      await apiHelpers.createTask({
        title,
        priority: 'medium',
        category: 'wellness'
      });
      toast.success(`✓ Added "${title}" to your tasks!`);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleAddActionAsHabit = async (name) => {
    try {
      await apiHelpers.createHabit({
        name,
        frequency: 'daily',
        category: 'wellness'
      });
      toast.success(`✓ Added "${name}" to your daily habits!`);
    } catch (err) {
      toast.error('Failed to create habit');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Tab Navigation (Monochromatic & Clean) */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Personal Confidant & Reflection
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tell FriendAI about your complete day to receive meaningful reviews and thoughtful reflections.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center space-x-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('debrief')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'debrief'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Debrief</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Companion Dialogue</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Reviews ({pastReflections.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY DEBRIEF & REVIEW                                             */}
      {/* ========================================================================= */}
      {activeTab === 'debrief' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Debrief Input Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Tell FriendAI About Today
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  What happened from morning to evening? How did it feel? What drained or nourished your energy?
                </p>
              </div>

              {/* Dictation Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent animate-pulse'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="Voice Dictation"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Expansive Textarea */}
            <textarea
              rows={5}
              value={dayStory}
              onChange={(e) => setDayStory(e.target.value)}
              placeholder="I started my morning with... At work, something that tested my patience was... In the evening I felt... What I really wish went differently is..."
              className="w-full bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-y leading-relaxed"
            />

            {/* Quick Starters */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Sentence starters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => setDayStory(prev => prev ? `${prev} ${starter}` : starter)}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 px-2.5 py-1 rounded-lg transition-all text-left truncate max-w-full sm:max-w-xs"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400">
                {dayStory.trim().split(/\s+/).filter(Boolean).length} words shared
              </span>
              <button
                onClick={handleGenerateDayReview}
                disabled={!dayStory.trim() || isDebriefLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isDebriefLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 loading-spinner"></div>
                    <span>Reflecting on your day...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Day Review & Reflection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Review Output (Monochromatic Editorial Card) */}
          {currentReview && (
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-6">
              
              {/* Review Header & Headline */}
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-mono uppercase tracking-widest text-[10px]">Day in Review</span>
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {currentReview.headline}
                </h2>
                <div className="flex items-center space-x-3 mt-3">
                  <span className="badge-mono">
                    Estimated Mood: {currentReview.moodScore || 7}/10
                  </span>
                  <span className="badge-mono">
                    Vitality: {currentReview.energyScore || 6}/10
                  </span>
                </div>
              </div>

              {/* The Narrative Debrief */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  The Companion's Perspective
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 font-serif">
                  {currentReview.narrative}
                </div>
              </div>

              {/* Highs & Frictions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Highs */}
                <div className="card-subtle space-y-2">
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    What Brought Flow & Joy
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {(currentReview.highlights || []).map((h, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-zinc-900 dark:text-zinc-100 mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Frictions */}
                <div className="card-subtle space-y-2">
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    What Drained Energy
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {(currentReview.frictions || []).map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-zinc-400 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reflection Prompt & Tomorrow's Intention */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                {currentReview.reflectionPrompt && (
                  <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-4 rounded-xl flex items-start space-x-3">
                    <Moon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Tonight's Quiet Question</p>
                      <p className="text-xs sm:text-sm font-medium mt-0.5">{currentReview.reflectionPrompt}</p>
                    </div>
                  </div>
                )}

                {currentReview.tomorrowIntention && (
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40 dark:bg-stone-950">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">Suggested Micro-Intention For Tomorrow</p>
                      <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{currentReview.tomorrowIntention}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleAddActionAsTask(currentReview.tomorrowIntention)}
                        className="btn-secondary text-[11px] font-semibold flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add as Task</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bridge to Open Companion */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/60 dark:bg-stone-900/60 p-4 rounded-xl border border-amber-200/80 dark:border-stone-800">
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Unpack Your Day in Real Time</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Take this review into live dialogue with your companion.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      const promptText = `I just debriefed my day: "${currentReview.headline}". Let's talk about it.`;
                      setChatInput(promptText);
                    }}
                    className="btn-primary text-xs flex items-center space-x-2 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Talk with Companion →</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANION DIALOGUE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col h-[650px] overflow-hidden animate-in fade-in duration-200">
          
          {/* Chat Control Strip */}
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Companion Dialogue</span>
              <span className="text-[10px] text-zinc-400">• Online</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-md text-xs flex items-center space-x-1 transition-all ${
                  ttsEnabled
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Toggle Voice Output"
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-medium hidden sm:inline">Voice</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.type === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-xs'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Suggestions Action Cards */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Suggested Next Steps
                        </span>
                        {msg.suggestions.map((sug, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-xs bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800"
                          >
                            <span className="truncate pr-2">{sug}</span>
                            <div className="flex space-x-1 shrink-0">
                              <button
                                onClick={() => handleAddActionAsTask(sug)}
                                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-medium"
                              >
                                + Task
                              </button>
                              <button
                                onClick={() => handleAddActionAsHabit(sug)}
                                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-medium"
                              >
                                + Habit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="block text-[10px] opacity-40 mt-1.5 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-zinc-400 flex items-center space-x-2">
                  <div className="w-3 h-3 loading-spinner"></div>
                  <span>FriendAI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip (Input of the Day) */}
          <div className="px-4 py-2 bg-amber-50/50 dark:bg-stone-900/60 border-t border-stone-200/60 dark:border-stone-800 flex items-center space-x-2 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-amber-800 dark:text-amber-400 font-bold shrink-0 text-[10px] uppercase tracking-wider">Quick Starters:</span>
            {[
              "Reflect on my day with me",
              "I felt really drained today",
              "Celebrate my win today",
              "How can I set myself up for a restful evening?",
              "Help me plan my tomorrow"
            ].map((pill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChatInput(pill)}
                className="bg-white hover:bg-amber-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 border border-amber-200/70 dark:border-stone-700 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors shadow-xs"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center space-x-2">
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 animate-pulse'
                  : 'text-stone-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title="Speak message"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChatMessage()}
              placeholder="Talk with your companion about your day, feelings, or next steps..."
              className="flex-1 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />

            <button
              onClick={handleSendChatMessage}
              disabled={!chatInput.trim() || isChatLoading}
              className="btn-primary p-2.5 rounded-xl flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAST REVIEWS & MEMOIR ARCHIVE                                      */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Life Reflections Archive
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review your days and see how your thoughts, energy, and resilience evolved over time.
            </p>
          </div>

          {pastReflections.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6">
              <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No previous reviews logged yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Share what happened today in the "Daily Debrief" tab to generate your very first Day in Review.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pastReflections.map((entry, idx) => {
                const response = entry.ai_response || {};
                return (
                  <div
                    key={entry.id || entry._id || idx}
                    className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="badge-mono text-[10px]">
                          {entry.date || new Date(entry.created_at).toISOString().split('T')[0]}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Mood: {entry.mood_score || response.moodScore || 7}/10
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {entry.headline || response.headline || "Daily Reflection"}
                    </h3>

                    {/* Original Story Extract */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2">
                      "{entry.transcription}"
                    </p>

                    {/* AI Narrative */}
                    {response.narrative && (
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 font-serif leading-relaxed line-clamp-3">
                        {response.narrative}
                      </div>
                    )}

                    {/* Tomorrow Intention if present */}
                    {response.tomorrowIntention && (
                      <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
                        <span>Intention: <strong>{response.tomorrowIntention}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Safety modal */}
      <SafetyCrisisModal 
        isOpen={safetyModalOpen} 
        onClose={() => setSafetyModalOpen(false)} 
      />

    </div>
  );
};

export default Chat;
