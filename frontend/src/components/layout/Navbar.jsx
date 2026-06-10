import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Car, User as UserIcon, LogOut, Sun, Moon, Shield, Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { markRead, markAllRead } from '../../store/notificationSlice';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadNotifications = useSelector(state => state.notifications.unreadCount);
  const notifications = useSelector(state => state.notifications.notifications);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4 flex items-center justify-between transition-colors duration-300">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 neon-glow">
          <Car size={24} />
        </div>
        <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-emerald-400 bg-clip-text text-transparent">
          SmartRide
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="relative flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition-all duration-300"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-30" />
                  <div className="absolute right-0 top-12 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl z-40 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button 
                          onClick={() => dispatch(markAllRead())}
                          className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => dispatch(markRead(notif.id))}
                            className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {notif.title}
                              </h4>
                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 block mt-2">
                              {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none p-1 rounded-full border-2 border-transparent hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.first_name[0].toUpperCase()}
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-30" />
                <div className="absolute right-0 top-14 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-40 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1 mt-1">
                      {user.role === 'admin' && <Shield size={12} className="text-emerald-500" />}
                      {user.role} Account
                    </p>
                  </div>
                  
                  <Link
                    to={`/${user.role}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UserIcon size={16} />
                    My Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-lg transition-all duration-300 neon-glow"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
