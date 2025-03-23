import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Briefcase, ChevronRight } from 'lucide-react';

interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string;
  created_at: string;
  employer: {
    full_name: string;
  };
}

const EmployeeDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          employer:profiles(full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
      <div className="grid gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>Posted by {job.employer.full_name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <Link
                  to={`/employee/jobs/${job.id}/apply`}
                  className="inline-flex items-center text-primary-500 hover:text-primary-600"
                >
                  Apply Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No jobs available</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;