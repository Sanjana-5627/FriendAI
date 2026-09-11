# 🌿 FriendAI - Personal Wellness & Anti-Loneliness Companion

An AI-powered personal wellness, routine-building, and anti-loneliness companion built with **React 18**, **Node.js + Express**, **MongoDB** (with zero-config In-Memory development fallback), and **Google Gemini AI** (with robust local rule-based fallback).

FriendAI bridges digital well-being with real-world activity: tracking holistic wellness, breaking down goals, building verified habit streaks, detecting loneliness or isolation patterns, generating balanced daily timetables, and offering curated nearby exploration recommendations.

---

## 🌟 Key Features

### 1. 👤 Privacy-Conscious Personal Wellness Profile
- **Adaptive Personalization**: Age range (no exact DOB collected), typical sleep schedules, work/study routines, activity levels, social preferences, dietary interests, and goals.
- **Privacy & Safety**: Zero collection of sensitive health identifiers; full in-app editing and instant account/data deletion.
- **Location Status**: Voluntary location toggle with distance-based filtering and fallback to regional hubs.

### 2. ⚡ Rapid Daily Wellness Check-In (< 45 Seconds)
- Designed to eliminate form fatigue with an intuitive single-view modal:
  - **Mood & Vitality**: 1-10 slider scales for Mood, Energy, and Stress.
  - **Rest & Health**: Sleep duration (hours), sleep quality, physical activity (minutes).
  - **Social & Digital Balance**: Social interaction rating (1-10), screen time (hours), productivity (1-10).
  - **Reflection**: Optional brief journal entry with instant sentiment extraction.

### 3. 📊 Holistic Multi-Metric Analytics & Correlation Engine
- **Cross-Metric Visual Trends**: Recharts-powered graphs comparing Mood vs Energy, Sleep vs Stress, and Physical Activity vs Social Interaction.
- **Statistical Correlation Patterns**: Identifies lifestyle correlations (e.g., *"Your mood averages 2.1 points higher on days with 30+ min of physical exercise"*).
- **Responsible Labeling**: Clearly distinguished as statistical patterns and correlations—never claiming medical causation.

### 4. 🧭 Anti-Loneliness & Community Hub ("Connect & Explore")
- **Isolation Pattern Detection**: Identifies sustained low social activity, elevated screen time, or sedentary routines.
- **Gentle Reconnection Suggestions**: Personalized, non-shaming prompts (walking in sunlight, visiting a library, phoning a friend, coffee shops, hobby workshops).
- **Nearby Places & Activities Directory**: Filter by category (Parks, Cafes, Libraries, Gyms, Cultural, Community), maximum distance, and cost (Free vs Paid).
- **Graceful Geolocation**: Works seamlessly with browser location or gracefully falls back to default regional recommendations without crashing.

### 5. 🗓️ Personalized AI Daily Timetable & Planner
- **Balanced Hourly Blueprint**: Synthesizes tasks, goals, habits, sleep routine, and free time into a realistic daily itinerary.
- **Overload Prevention**: Automatically blocks out focus blocks, meal breaks, restorative walks, and wind-down periods.
- **Interactive Control**: Mark schedule blocks complete, skip with a note, or click **Regenerate Schedule** on demand.

### 6. 🛡️ Crisis Safety & Distress Protocol
- **Empathetic Distress Interception**: Automated real-time safety scanning for self-harm, severe crisis, or extreme emotional distress keywords.
- **Non-Clinical Boundaries**: Clearly states that FriendAI is an AI companion, not a licensed therapist or medical provider.
- **Emergency Resources**: Automatically presents the **988 Suicide & Crisis Lifeline** (Call/Text 988), Crisis Text Line (HOME to 741741), and International resources.

### 7. 🤖 Context-Aware AI Chat & One-Click Actions
- **Grounded Memory**: Leverages user's recent mood, top priorities, and profile context rather than generic chatbot loops.
- **One-Click Action Cards**: When the AI suggests a healthy action, users can instantly click **"Add to Tasks"**, **"Add to Habits"**, or **"Add to Goals"** without retyping.
- **Multimodal Voice Support**: Browser speech-to-text transcription and native Web Speech text-to-speech.

### 8. ⚡ Verified Habit Tracker & Anti-Cheat Streaks
- **Streak Integrity**: Prevents future-date completion and duplicate submissions on the same calendar day.
- **Visual Progress**: 7-day completion mini-grids, category tags (Mindfulness, Health, Productivity, Social), and all-time record counters.

### 9. 🎯 Tasks & Goals Overhaul
- **Priority & Due Dates**: High/Medium/Low priorities, categories, and overdue indicators.
- **Milestone Breakdown**: AI-assisted breakdown to turn intimidating goals into bite-sized actionable steps.

### 10. 💾 Data Sovereignty, Security & Export
- **One-Click Data Export**: Download complete user archives in JSON or CSV formats.
- **Security Hardening**: BCrypt 12 rounds, JWT authentication, Express rate limiting, Helmet HTTP headers, CORS whitelisting, and strict user-level data isolation.

---

## 🛠️ Architecture & Tech Stack

```
FriendAI/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT verification & req.user normalization
│   ├── routes/
│   │   ├── auth.js              # Registration, login, /me
│   │   ├── users.js             # Profile management & account deletion
│   │   ├── ai.js                # Chat, goal breakdown, speech, safety
│   │   ├── wellness.js          # Quick daily check-in & history
│   │   ├── mood.js              # Multi-metric analytics & pattern engine
│   │   ├── tasks.js             # Prioritized task manager
│   │   ├── goals.js             # Goals & milestone progress
│   │   ├── habits.js            # Streaks, frequency, completion history
│   │   ├── schedule.js          # AI daily timetable planner
│   │   ├── recommendations.js   # Anti-loneliness engine & nearby places
│   │   ├── notifications.js     # System reminders & drawer
│   │   ├── dashboard.js         # Unified score & dashboard aggregator
│   │   └── export.js            # Full data export (JSON & CSV)
│   ├── utils/
│   │   ├── safety.js            # Crisis detection & 988 helpline protocol
│   │   ├── geminiFallback.js    # Rule-based offline AI & sentiment fallback
│   │   └── placesData.js        # Curated places & activities directory
│   ├── models.js                # MongoDB Mongoose schemas & indexes
│   ├── storage.js               # Dual-Engine: MongoDB + In-Memory Fallback
│   ├── server.js                # Express app configuration & middleware
│   └── tests/
│       └── api.test.js          # 20 Automated backend test suites
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx               # Responsive glassmorphic navigation
    │   │   ├── CheckInModal.jsx         # <45s quick wellness check-in modal
    │   │   ├── NotificationDrawer.jsx   # Reminders slide-over
    │   │   ├── SafetyCrisisModal.jsx    # 988 Lifeline support modal
    │   │   └── LoadingSpinner.jsx       # Polished loading state
    │   ├── contexts/
    │   │   ├── AuthContext.jsx          # Auth, session, profile state
    │   │   └── ThemeContext.jsx         # Dark/Light mode theme state
    │   ├── pages/
    │   │   ├── Dashboard.jsx            # Wellness ring, timetable, insights
    │   │   ├── Chat.jsx                 # AI companion with action cards
    │   │   ├── ConnectExplore.jsx       # Anti-loneliness & place directory
    │   │   ├── Planner.jsx              # Daily schedule timetable
    │   │   ├── Tasks.jsx                # Prioritized task list
    │   │   ├── Goals.jsx                # Milestones & AI breakdown
    │   │   ├── Habits.jsx               # Streak tracking & categories
    │   │   ├── MoodAnalytics.jsx        # Multi-metric charts & correlations
    │   │   ├── Profile.jsx              # Profile editor, export, account
    │   │   ├── Login.jsx                # Secure login
    │   │   └── Register.jsx             # Secure signup
    │   ├── utils/
    │   │   └── api.js                   # Axios client with port 5002 fallback
    │   └── App.jsx                      # Protected routing
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user data & profile |
| `GET` | `/api/users/profile` | Retrieve personal wellness profile |
| `PUT` | `/api/users/profile` | Update wellness profile settings |
| `DELETE` | `/api/users/account` | Permanently delete account & all user data |
| `POST` | `/api/wellness/check-in` | Submit daily wellness check-in |
| `GET` | `/api/wellness/check-in/today` | Check if user logged wellness today |
| `GET` | `/api/wellness/history` | Retrieve wellness check-in history |
| `GET` | `/api/dashboard` | Aggregated dashboard data & wellness score |
| `POST` | `/api/ai/chat` | AI companion conversation with distress check |
| `POST` | `/api/ai/breakdown-goal` | Generate AI milestone action steps for a goal |
| `GET` | `/api/schedule` | Retrieve today's daily schedule |
| `POST` | `/api/schedule/regenerate` | Regenerate realistic timetable |
| `PUT` | `/api/schedule/items/:itemId` | Mark schedule item completed/skipped |
| `GET` | `/api/recommendations` | Anti-loneliness recommendations |
| `GET` | `/api/recommendations/places` | Curated places with category & distance filters |
| `GET` | `/api/mood/analytics` | Multi-metric timeline & pattern correlations |
| `GET` | `/api/tasks` | Get user tasks (with priority & category) |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update / toggle task completion |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/goals` | Get user goals with milestones |
| `POST` | `/api/goals` | Create goal |
| `PUT` | `/api/goals/:id` | Update goal / milestones |
| `DELETE` | `/api/goals/:id` | Delete goal |
| `GET` | `/api/habits` | Get habits with streak calculation |
| `POST` | `/api/habits` | Create habit |
| `POST` | `/api/habits/:id/complete` | Complete habit for today (prevents duplicates) |
| `DELETE` | `/api/habits/:id` | Delete habit |
| `GET` | `/api/notifications` | Get system notifications & reminders |
| `PUT` | `/api/notifications/:id/read` | Mark notification read |
| `GET` | `/api/export?format=json\|csv` | Export all user data |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v8.0 or higher
- **MongoDB**: Optional (app runs automatically in In-Memory mode if not provided)
- **Google Gemini API Key**: Optional (built-in offline AI fallback included)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Sanjana-5627/FriendAI.git
cd FriendAI

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `backend/.env` (or copy from `backend/.env.example`):

```env
# Required for authentication
JWT_SECRET=friendai_super_secret_production_key_2026

# AI Engine (Optional: uses offline algorithmic fallback if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Database (Optional: uses in-memory storage if omitted)
MONGODB_URI=mongodb://localhost:27017/friendai

# Server Port
PORT=5002
NODE_ENV=development
```

### 3. Run Automated Tests

Run the complete 20-suite automated backend test suite:

```bash
cd backend
npm test
```

### 4. Start Development Servers

In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5002
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 5. Build for Production

```bash
cd frontend
npm run build
```

---

## 🧪 Testing & Quality Assurance

The project includes an automated test runner (`backend/tests/api.test.js`) verifying:
1. User registration & duplicate prevention
2. Password hashing & authentication
3. Strict user-level data isolation (User B cannot access User A's tasks or records)
4. Wellness check-in submission and today's status tracking
5. Verified habit streak tracking & same-day duplicate prevention
6. Timetable generation and milestone action step breakdown
7. Crisis distress detection and 988 Lifeline support triggers
8. Comprehensive JSON & CSV data export

---

## 🔒 Security & Privacy Practices

- **Zero Medical Pretense**: Prominently informs users that the AI is an emotional support companion, not healthcare or psychiatric care.
- **Crisis Intervention**: Immediate compassionate response and emergency helpline display on detection of distress signals.
- **Data Isolation**: All MongoDB queries and in-memory lookups enforce strict `user: req.user.id` tenancy.
- **Sensitive Fields Redaction**: Password hashes, internal tokens, and system secrets are never exposed in API outputs.
- **OWASP Compliance**: Protected with Helmet headers, CORS policies, Express rate limiting, and parameter sanitization.

---

## 📄 License
This project is licensed under the MIT License.
