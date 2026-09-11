import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { Bell, CheckCheck, X, Calendar, CheckSquare, Zap, Heart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiHelpers.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await apiHelpers.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiHelpers.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'checkin':
        return <Heart className="w-4 h-4 text-emerald-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case 'habit':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl h-full flex flex-col p-4 sm:p-5 text-gray-900 dark:text-gray-100 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base">Notifications & Reminders</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">All Read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-500">Loading reminders...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400 mt-0.5">No pending reminders right now.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const id = item._id || item.id;
              return (
                <div
                  key={id}
                  onClick={() => handleMarkRead(id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/60 opacity-70'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-xs">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ml-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={onClose}
                          className="inline-block mt-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Take Action →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
