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
  Bell
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
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `friendai_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `friendai_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
      toast.success(`Data exported in ${format.toUpperCase()} format`);
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete your FriendAI account? This will permanently delete all your daily check-ins, journal reflections, timetable, and tasks. This cannot be undone.'
    );
    if (confirmed) {
      await deleteAccount();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
            Identity & Privacy
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Wellness Profile & Data Control
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure how FriendAI personalizes recommendations without collecting unnecessary sensitive information.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary flex items-center space-x-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-5">
        
        {/* Basic Personal Information */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Age Range</label>
              <select
                value={profile.age_range}
                onChange={(e) => setProfile({ ...profile, age_range: e.target.value })}
                className="input-field"
              >
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
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Daily Routine & Sleep Rhythm
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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

        {/* Activity & Social Style */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Movement & Social Style
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Fitness & Activity Level</label>
              <select
                value={profile.fitness_level || 'moderate'}
                onChange={(e) => setProfile({ ...profile, fitness_level: e.target.value })}
                className="input-field"
              >
                <option value="sedentary">Mostly Sedentary</option>
                <option value="light">Light Activity (walking, light tasks)</option>
                <option value="moderate">Moderate (regular movement/gym)</option>
                <option value="active">Very Active (daily sports/training)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Social Preference</label>
              <select
                value={profile.social_preferences || 'balanced'}
                onChange={(e) => setProfile({ ...profile, social_preferences: e.target.value })}
                className="input-field"
              >
                <option value="introvert">Prefers solitude & quiet environments</option>
                <option value="ambivert">Balanced (mix of quiet & social)</option>
                <option value="extrovert">Energized by social gatherings</option>
              </select>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="pt-2">
            <label className="font-semibold text-xs block mb-1">Personal Interests & Hobbies</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add an interest (e.g. coffee, hiking, reading)"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="btn-secondary px-3"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(profile.interests || []).map((item, idx) => (
                <span
                  key={idx}
                  className="badge-mono flex items-center space-x-1"
                >
                  <span>{item}</span>
                  <button type="button" onClick={() => handleRemoveInterest(item)} className="hover:text-zinc-950">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Nearby Suggestions */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Local Exploration Preferences
          </h2>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold">Allow Location-Based Nearby Recommendations</p>
              <p className="text-zinc-500 mt-0.5">Used exclusively to recommend local parks, cafes, and libraries.</p>
            </div>
            <input
              type="checkbox"
              checked={profile.location?.enabled || false}
              onChange={(e) => setProfile({
                ...profile,
                location: { ...profile.location, enabled: e.target.checked }
              })}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
            />
          </div>
        </div>
      </form>

      {/* Data Export & Account Deletion (Monochromatic) */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Data Sovereignty & Privacy
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          You own 100% of your data. You can download a complete archive at any time or permanently purge your account.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="btn-secondary flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="btn-secondary flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Journal (CSV)</span>
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-auto"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
