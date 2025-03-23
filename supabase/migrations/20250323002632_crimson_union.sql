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
DO $$ 
BEGIN
  ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS qualifications text,
    ADD COLUMN IF NOT EXISTS experience text,
    ADD COLUMN IF NOT EXISTS cover_letter text;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications if not already enabled
DO $$ 
BEGIN
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  
  CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create or replace the notification function
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

-- Drop existing trigger if it exists and create new one
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS job_application_notification ON job_applications;
  
  CREATE TRIGGER job_application_notification
    AFTER INSERT ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION handle_job_application_notification();
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;