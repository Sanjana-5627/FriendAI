import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiHelpers } from '../utils/api';
import { 
  User, 
  Settings, 
  Download, 
  Trash2, 
  Save, 
  Moon, 
  Briefcase, 
  Activity, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Bell,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, deleteAccount } = useAuth();

  const [name, setName] = useState('');
  const [profile, setProfile] = useState({
    age_range: '25-34',
    interests: [],
    hobbies: [],
    sleep_schedule: { bedtime: '23:00', wake_time: '07:00', typical_hours: 8 },
    work_schedule: { type: 'standard', start_time: '09:00', end_time: '17:00' },
    fitness_level: 'moderate',
    social_preferences: 'ambivert',
    personal_goals_summary: '',
    preferred_activities: [],
    dietary_preferences: '',
    location: { enabled: false, city: 'Local Area', area: '' },
    notification_settings: {
      daily_checkin: true,
      habit_reminders: true,
      task_reminders: true,
      wellness_breaks: true
    }
  });

  const [saving, setSaving] = useState(false);
  const [interestInput, setInterestInput] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.profile) {
        setProfile(prev => ({
          ...prev,
          ...user.profile,
          sleep_schedule: { ...prev.sleep_schedule, ...(user.profile.sleep_schedule || {}) },
          work_schedule: { ...prev.work_schedule, ...(user.profile.work_schedule || {}) },
          location: { ...prev.location, ...(user.profile.location || {}) },
          notification_settings: { ...prev.notification_settings, ...(user.profile.notification_settings || {}) }
        }));
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, profile });
    } catch (err) {
      // toast in context
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!interestInput.trim()) return;
    if (!profile.interests.includes(interestInput.trim().toLowerCase())) {
      setProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interestInput.trim().toLowerCase()]
      }));
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (item) => {
    setProfile(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== item)
    }));
  };

  const handleExport = async (format = 'json') => {
    setExporting(true);
    try {
      const res = await apiHelpers.exportData(format);
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'friendai-wellness-data.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'friendai-wellness-data.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      '⚠️ PERMANENT ACCOUNT DELETION\n\nThis will immediately and permanently erase your account, all journal entries, wellness check-ins, tasks, goals, and habits.\n\nType "DELETE" to confirm:'
    );
    if (confirmation === 'DELETE') {
      await deleteAccount();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Personal Wellness Profile
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize your wellness companion preferences and manage privacy
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Core Personal Identity */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Basic Identity & Privacy-Safe Age</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Age Range (Privacy-Conscious)</label>
              <select
                value={profile.age_range}
                onChange={(e) => setProfile({ ...profile, age_range: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="under_18">Under 18</option>
                <option value="18-24">18 - 24</option>
                <option value="25-34">25 - 34</option>
                <option value="35-44">35 - 44</option>
                <option value="45-54">45 - 54</option>
                <option value="55+">55+</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routines: Sleep & Work Schedules */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Daily Routine & Sleep Rhythm</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Typical Bedtime</label>
              <input
                type="time"
                value={profile.sleep_schedule?.bedtime || '23:00'}
                onChange={(e) => setProfile({
                  ...profile,
                  sleep_schedule: { ...profile.sleep_schedule, bedtime: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Typical Wake Time</label>
              <input
                type="time"
                value={profile.sleep_schedule?.wake_time || '07:00'}
                onChange={(e) => setProfile({
                  ...profile,
                  sleep_schedule: { ...profile.sleep_schedule, wake_time: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Work / Study Routine</label>
              <select
                value={profile.work_schedule?.type || 'standard'}
                onChange={(e) => setProfile({
                  ...profile,
                  work_schedule: { ...profile.work_schedule, type: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="standard">Standard 9-to-5</option>
                <option value="flexible">Flexible / Remote</option>
                <option value="student">Student / Academic</option>
                <option value="shift">Shift Work</option>
                <option value="freelance">Freelance / Entrepreneur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity, Social & Interests */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Movement, Social Style & Interests</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Fitness & Activity Level</label>
              <select
                value={profile.fitness_level}
                onChange={(e) => setProfile({ ...profile, fitness_level: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="sedentary">Sedentary (Desk work, low movement)</option>
                <option value="light">Lightly Active (Daily short walks)</option>
                <option value="moderate">Moderately Active (2-3 workouts/week)</option>
                <option value="very_active">Very Active (Daily fitness/sports)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Social Preference</label>
              <select
                value={profile.social_preferences}
                onChange={(e) => setProfile({ ...profile, social_preferences: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="introvert">Introvert (Recharges in quiet spaces)</option>
                <option value="ambivert">Ambivert (Balanced solo & social time)</option>
                <option value="extrovert">Extrovert (Thrives with regular connection)</option>
              </select>
            </div>
          </div>

          {/* Interests Tag Cloud */}
          <div>
            <label className="text-xs font-semibold block mb-1">Personal Interests & Hobbies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.interests || []).map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg flex items-center space-x-1"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add interest (e.g. photography, running, chess)..."
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 text-xs font-bold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Personal Wellness Vision</label>
            <textarea
              rows={2}
              value={profile.personal_goals_summary || ''}
              onChange={(e) => setProfile({ ...profile, personal_goals_summary: e.target.value })}
              placeholder="What habits or wellness outcomes are most important to you right now?"
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Privacy & Data Control Section */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacy, Data Portability & Account Control</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your personal reflections and wellness records belong strictly to you. Export your complete data anytime or delete your account with one click.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account & Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
