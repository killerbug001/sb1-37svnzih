import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Code2, Sun, Moon, LogOut, Bell, Home, Briefcase, User, FileText } from 'lucide-react';
import { useThemeStore } from '../store/theme';
import { useNotificationStore } from '../store/notifications';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'employer' | 'employee' | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserType(profile.user_type);
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navigationItems = userType === 'employer' 
    ? [
        { icon: Home, label: 'Dashboard', path: '/employer' },
        { icon: Briefcase, label: 'My Posts', path: '/employer/posts' },
        { icon: FileText, label: 'Applications', path: '/employer/applications' },
        { icon: User, label: 'Profile', path: '/employer/profile' },
      ]
    : [
        { icon: Home, label: 'Dashboard', path: '/employee' },
        { icon: FileText, label: 'My Applications', path: '/employee/applications' },
        { icon: User, label: 'Profile', path: '/employee/profile' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <nav className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border fixed w-full top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Code2 className="w-8 h-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-dark-text">
                HireCircle
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border relative"
                >
                  <Bell className="w-5 h-5 text-gray-500 dark:text-dark-text" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-center">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id)}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer",
                                notification.read
                                  ? "bg-gray-50 dark:bg-dark-border"
                                  : "bg-blue-50 dark:bg-blue-900"
                              )}
                            >
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-gray-500 dark:text-dark-text" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500 dark:text-dark-text" />
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className="w-64 fixed h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg",
                        location.pathname === item.path
                          ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                          : "hover:bg-gray-100 dark:hover:bg-dark-border"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        <main className="ml-64 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;