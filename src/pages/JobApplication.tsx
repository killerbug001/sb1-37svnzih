import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string;
  employer_id: string;
  employer: {
    full_name: string;
  };
}

const JobApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPost | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    qualifications: '',
    experience: '',
    cover_letter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          employer:profiles(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      navigate('/employee');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_applications')
        .insert([
          {
            job_post_id: id,
            applicant_id: user.id,
            ...formData
          }
        ]);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/employee/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
        <div className="bg-gray-50 dark:bg-dark-border p-4 rounded-md mb-4">
          <h2 className="font-semibold mb-2">Requirements:</h2>
          <p className="text-gray-700 dark:text-gray-300">{job.requirements}</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Posted by: {job.employer.full_name}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Submit Your Application</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Qualifications</label>
            <textarea
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Why are you suitable for this position?</label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobApplication;