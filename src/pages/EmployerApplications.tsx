import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  status: 'pending' | 'in_review' | 'accepted' | 'rejected';
  created_at: string;
  email: string;
  phone: string;
  qualifications: string;
  experience: string;
  cover_letter: string;
  applicant: {
    full_name: string;
  };
  job_post: {
    title: string;
  };
}

const EmployerApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

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
          applicant:profiles(full_name),
          job_post:job_posts(title)
        `)
        .eq('job_post.employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.map(app =>
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="w-1/2 pr-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Applications</h1>
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              onClick={() => setSelectedApplication(application)}
              className={`bg-white dark:bg-dark-card rounded-lg shadow-md p-6 cursor-pointer transition-colors ${
                selectedApplication?.id === application.id
                  ? 'border-2  border-primary-500'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {application.job_post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {application.applicant.full_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    application.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === 'in_review'
                      ? 'bg-blue-100 text-blue-800'
                      : application.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {application.status.replace('_', ' ').charAt(0).toUpperCase() +
                    application.status.slice(1).replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedApplication && (
        <div className="w-1/2 pl-6 border-l">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <div className="space-x-2">
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'in_review')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Mark as In Review
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                <p><strong>Phone:</strong> {selectedApplication.phone}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
                <p className="whitespace-pre-wrap">{selectedApplication.qualifications}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Experience</h3>
                <p className="whitespace-pre-wrap">{selectedApplication.experience}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                <p className="whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;