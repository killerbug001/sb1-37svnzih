/*
  # Add job application details and notifications

  1. Changes
    - Add new columns to job_applications table for detailed applications
    - Create notifications table for system notifications
    - Update RLS policies

  2. New Tables
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - title (text)
      - message (text)
      - read (boolean)
      - created_at (timestamp)

  3. Modified Tables
    - job_applications
      - Add email, phone, qualifications, experience, cover_letter
*/

-- Add new columns to job_applications
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS qualifications text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS cover_letter text;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Create function to handle job application notifications
CREATE OR REPLACE FUNCTION handle_job_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for employer
  INSERT INTO notifications (user_id, title, message)
  SELECT 
    job_posts.employer_id,
    'New Job Application',
    'A new application has been submitted for ' || job_posts.title
  FROM job_posts
  WHERE job_posts.id = NEW.job_post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job application notifications
CREATE TRIGGER job_application_notification
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_application_notification();