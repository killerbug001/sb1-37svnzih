import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle } from 'lucide-react';

interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
  created_at: string;
}

const EmployerDashboard: React.FC = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const fetchJobPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobPosts(posts || []);
    } catch (err) {
      console.error('Error fetching job posts:', err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('job_posts').insert([
        {
          ...newJob,
          employer_id: user.id,
          status: 'open'
        }
      ]);

      if (error) throw error;

      setIsCreating(false);
      setNewJob({ title: '', description: '', requirements: '' });
      fetchJobPosts();
    } catch (err) {
      console.error('Error creating job post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Job Postings</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Job
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create New Job Posting</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Requirements</label>
              <textarea
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
              >
                Create Job Post
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {jobPosts.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Requirements:</h3>
              <p className="text-gray-700">{job.requirements}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm ${
                job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Posted on {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerDashboard;