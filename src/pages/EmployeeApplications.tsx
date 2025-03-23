import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  status: 'pending' | 'in_review' | 'accepted' | 'rejected';
  created_at: string;
  job_post: {
    title: string;
    employer: {
      full_name: string;
    };
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const EmployeeApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_post:job_posts(
            title,
            employer:profiles(full_name)
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>
      <div className="space-y-6">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {application.job_post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {application.job_post.employer.full_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Applied on {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  statusColors[application.status]
                }`}
              >
                {application.status.replace('_', ' ').charAt(0).toUpperCase() +
                  application.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No applications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start applying for jobs to see your applications here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeApplications;