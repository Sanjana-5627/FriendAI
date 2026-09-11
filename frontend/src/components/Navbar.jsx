import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiHelpers } from '../utils/api';
import { 
  Home, 
  MessageSquare, 
  Compass, 
  Calendar, 
  CheckSquare, 
  Target, 
  Zap, 
  BarChart3, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Bell, 
  ShieldAlert,
  Feather
} from 'lucide-react';
import CheckInModal from './CheckInModal';
import NotificationDrawer from './NotificationDrawer';
import SafetyCrisisModal from './SafetyCrisisModal';

const Navbar = () => {
  const { toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiHelpers.getNotifications();
        setUnreadNotifications(res.data.unreadCount || 0);
      } catch (err) {
        // silent catch
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Daily Debrief & Chat', href: '/chat', icon: MessageSquare },
    { name: 'Connect & Explore', href: '/explore', icon: Compass },
    { name: 'Timetable', href: '/planner', icon: Calendar },
    { name: 'Habits', href: '/habits', icon: Zap },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Analytics', href: '/mood', icon: BarChart3 },
  ];

  if (!user) return null;

  return (
    <>
      <nav className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-15">
            
            {/* Left: Brand Logo & Title (Monochromatic & Minimalist) */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 transition-transform group-hover:scale-105">
                  <Feather className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                    Friend<span className="text-zinc-500 dark:text-zinc-400">AI</span>
                  </span>
                  <span className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase mt-0.5">Companion</span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Navigation Links (Understated Monochromatic) */}
            <div className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions (Check-In CTA, Crisis Help, Notifications, Theme, Profile) */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Quick Daily Check-In CTA */}
              <button
                onClick={() => setCheckInModalOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                <span>Daily Check-In</span>
              </button>

              {/* Emergency Crisis Help Shortcut */}
              <button
                onClick={() => setSafetyModalOpen(true)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                title="Crisis Support & 988 Lifeline"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              {/* Notification Drawer Button */}
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                )}
              </button>

              {/* Dark / Light Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Wellness Profile & Export</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 space-y-1">
            <button
              onClick={() => {
                setCheckInModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full mb-2 py-2 px-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold text-center"
            >
              Daily Wellness Check-In
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile & Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-xs text-zinc-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Modals & Slide-overs */}
      <CheckInModal 
        isOpen={checkInModalOpen} 
        onClose={() => setCheckInModalOpen(false)} 
        onSaved={() => {
          setCheckInModalOpen(false);
          window.location.reload();
        }} 
      />

      <NotificationDrawer 
        isOpen={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />

      <SafetyCrisisModal 
        isOpen={safetyModalOpen} 
        onClose={() => setSafetyModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
