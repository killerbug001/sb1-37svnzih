import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          navigate(profile.user_type === 'employer' ? '/employer' : '/employee');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Code2 className="w-10 h-10 text-primary-500" />
          <h1 className="text-3xl font-bold ml-2">HireCircle</h1>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;