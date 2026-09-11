import axios from 'axios';

// Resolve base URL dynamically: supports environment variables and local development fallback
const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5002';
  }
  return '';
};

// Create API instance
export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Comprehensive API helper functions
export const apiHelpers = {
  // Authentication & Profile
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  demoLogin: () => api.post('/api/auth/demo'),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (profileData) => api.put('/api/users/profile', profileData),
  deleteAccount: () => api.delete('/api/users/account'),

  // Dashboard Aggregator
  getDashboard: () => api.get('/api/dashboard'),

  // AI Companion & Journaling
  chat: (message, history = []) => api.post('/api/ai/chat', { message, history }),
  generateDayReview: (text, date) => api.post('/api/ai/day-review', { text, date }),
  getReflections: () => api.get('/api/ai/reflections'),
  analyzeText: (transcription, context = {}) => api.post('/api/ai/analyze', { transcription, context }),
  breakdownGoal: (title, category) => api.post('/api/ai/breakdown-goal', { title, category }),
  transcribeAudio: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    return api.post('/api/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  textToSpeech: (text) => api.post('/api/ai/speak', { text }),

  // Daily Wellness Check-In
  submitCheckIn: (checkInData) => api.post('/api/wellness/check-in', checkInData),
  getTodayCheckIn: () => api.get('/api/wellness/check-in/today'),
  getWellnessHistory: (days = 30) => api.get(`/api/wellness/history?days=${days}`),
  logScreenTime: (data) => api.post('/api/wellness/digital', data),

  // Mood & Multi-Metric Analytics
  getMoodAnalytics: (period = 'weekly') => api.get(`/api/mood/analytics?period=${period}`),

  // Tasks Management
  getTasks: (params = {}) => api.get('/api/tasks', { params }),
  createTask: (task) => api.post('/api/tasks', task),
  updateTask: (id, updates) => api.put(`/api/tasks/${id}`, updates),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),

  // Goals Management
  getGoals: (status, category) => api.get('/api/goals', { params: { status, category } }),
  createGoal: (goal) => api.post('/api/goals', goal),
  updateGoal: (id, updates) => api.put(`/api/goals/${id}`, updates),
  deleteGoal: (id) => api.delete(`/api/goals/${id}`),

  // Habits Tracking
  getHabits: (active = true, category) => api.get('/api/habits', { params: { active, category } }),
  createHabit: (habit) => api.post('/api/habits', habit),
  updateHabit: (id, updates) => api.put(`/api/habits/${id}`, updates),
  completeHabit: (id, notes = '', date = null) => api.post(`/api/habits/${id}/complete`, { notes, date }),
  deleteHabit: (id) => api.delete(`/api/habits/${id}`),

  // Daily Timetable Planner
  getSchedule: (date) => api.get('/api/schedule', { params: { date } }),
  regenerateSchedule: (date) => api.post('/api/schedule/regenerate', { date }),
  updateScheduleItem: (itemId, updates) => api.put(`/api/schedule/items/${itemId}`, updates),

  // Anti-Loneliness Recommendations & Places
  getRecommendations: () => api.get('/api/recommendations'),
  updateRecommendationFeedback: (id, status) => api.put(`/api/recommendations/${id}/feedback`, { status }),
  getPlacesAndActivities: (filters = {}) => api.get('/api/recommendations/places', { params: filters }),

  // In-App Notifications
  getNotifications: () => api.get('/api/notifications'),
  markNotificationRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/api/notifications/read-all'),

  // Journal Entries Archive
  getJournalEntries: () => api.get('/api/journal'),

  // Data Export (JSON / CSV)
  exportData: (format = 'json') => api.get('/api/export', {
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  })
};

export default api;
