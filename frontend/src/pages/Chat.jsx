import React, { useState, useRef, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Send, 
  Sparkles, 
  CheckSquare, 
  Target, 
  Zap, 
  Plus, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  ShieldAlert,
  Bot,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import SafetyCrisisModal from '../components/SafetyCrisisModal';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
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
  }, []);

  const initializeWelcomeMessage = () => {
    setMessages([{
      type: 'ai',
      content: "Hello! I'm your AI personal wellness companion. I'm here to listen, help you reflect, plan your day, or suggest small healthy steps when you feel overwhelmed or lonely. What's on your mind today?",
      timestamp: new Date().toISOString()
    }]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('friendai_chat_history', JSON.stringify(messages.slice(-30)));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech API speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
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

  const speakText = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!textInput.trim() || loading) return;

    const userText = textInput.trim();
    setTextInput('');

    const newMsg = {
      type: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await apiHelpers.chat(userText, messages);
      const data = res.data;

      if (data.isCrisis) {
        setSafetyModalOpen(true);
      }

      const aiReply = {
        type: 'ai',
        content: data.reply || data.message || "I'm right here with you. How can I support you right now?",
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, aiReply]);

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestedActions(data.suggestions);
      }

      if (ttsEnabled && aiReply.content) {
        speakText(aiReply.content);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToAction = async (actionText, type) => {
    try {
      if (type === 'task') {
        await apiHelpers.createTask({
          title: actionText,
          priority: 'medium',
          category: 'wellness'
        });
        toast.success(`✓ Created task: "${actionText}"`);
      } else if (type === 'habit') {
        await apiHelpers.createHabit({
          name: actionText,
          category: 'health',
          frequency: 'daily'
        });
        toast.success(`✓ Created daily habit: "${actionText}"`);
      } else if (type === 'goal') {
        await apiHelpers.createGoal({
          title: actionText,
          category: 'personal'
        });
        toast.success(`✓ Created goal: "${actionText}"`);
      }
      setSuggestedActions(prev => prev.filter(a => a !== actionText));
    } catch (err) {
      toast.error('Failed to create action');
    }
  };

  const clearChat = () => {
    localStorage.removeItem('friendai_chat_history');
    initializeWelcomeMessage();
    toast.success('Chat history cleared');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
              <span>FriendAI Companion</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-[10px] text-gray-400">Wellness & empathetic listener</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* TTS Audio Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl text-xs flex items-center space-x-1 transition-colors ${
              ttsEnabled 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Read responses aloud"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Crisis Hotline Button */}
          <button
            onClick={() => setSafetyModalOpen(true)}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Crisis Help / 988 Lifeline"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Clear history */}
          <button
            onClick={clearChat}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-4 space-y-3.5 mb-3">
        {messages.map((msg, index) => {
          const isUser = msg.type === 'user';
          return (
            <div
              key={index}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-xs'
                }`}
              >
                {msg.content}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 italic py-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>FriendAI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Action Cards (One-Click Conversion) */}
      {suggestedActions.length > 0 && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 mb-3 space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
            <span>✨ One-Click Action Items from AI</span>
            <button onClick={() => setSuggestedActions([])} className="hover:underline text-gray-400">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs shadow-xs"
              >
                <span className="truncate max-w-[220px] font-medium text-gray-800 dark:text-gray-200">
                  {suggestion}
                </span>
                <button
                  onClick={() => handleConvertToAction(suggestion, 'task')}
                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded text-[10px] font-bold"
                  title="Add as Task"
                >
                  + Task
                </button>
                <button
                  onClick={() => handleConvertToAction(suggestion, 'habit')}
                  className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[10px] font-bold"
                  title="Add as Habit"
                >
                  + Habit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="relative flex items-center space-x-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type whatever is on your mind or how your day is going..."
          className="flex-1 py-3 pl-4 pr-12 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs text-gray-900 dark:text-white"
        />

        {/* Mic Speech button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`absolute right-14 p-1.5 rounded-xl transition-colors ${
            isListening 
              ? 'text-red-500 bg-red-50 animate-pulse' 
              : 'text-gray-400 hover:text-indigo-600'
          }`}
          title="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!textInput.trim() || loading}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl disabled:opacity-40 transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-400 text-center mt-2">
        FriendAI is an empathetic wellness companion and does not replace medical or mental healthcare.
      </p>

      <SafetyCrisisModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />
    </div>
  );
};

export default Chat;
