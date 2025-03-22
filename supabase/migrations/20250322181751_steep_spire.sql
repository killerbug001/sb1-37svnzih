/*
  # Initial Schema Setup for HireCircle

  1. Tables
    - profiles
      - id (uuid, references auth.users)
      - user_type (enum: employer, employee)
      - full_name (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - job_posts
      - id (uuid)
      - employer_id (uuid, references profiles)
      - title (text)
      - description (text)
      - requirements (text)
      - status (enum: open, closed)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - job_applications
      - id (uuid)
      - job_post_id (uuid, references job_posts)
      - applicant_id (uuid, references profiles)
      - status (enum: pending, in_review, accepted, rejected)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create custom types
CREATE TYPE user_type AS ENUM ('employer', 'employee');
CREATE TYPE job_status AS ENUM ('open', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users,
    user_type user_type NOT NULL,
    full_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create job_posts table
CREATE TABLE job_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id uuid REFERENCES profiles NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    status job_status DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE job_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_post_id uuid REFERENCES job_posts NOT NULL,
    applicant_id uuid REFERENCES profiles NOT NULL,
    status application_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Job posts policies
CREATE POLICY "Employers can create job posts"
    ON job_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND user_type = 'employer'
        )
    );

CREATE POLICY "Employers can update their own job posts"
    ON job_posts FOR UPDATE
    USING (employer_id = auth.uid());

CREATE POLICY "Everyone can view open job posts"
    ON job_posts FOR SELECT
    USING (status = 'open');

-- Job applications policies
CREATE POLICY "Employees can create applications"
    ON job_applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND user_type = 'employee'
        )
    );

CREATE POLICY "Users can view their own applications"
    ON job_applications FOR SELECT
    USING (
        applicant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM job_posts
            WHERE job_posts.id = job_applications.job_post_id
            AND job_posts.employer_id = auth.uid()
        )
    );

CREATE POLICY "Employers can update application status"
    ON job_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM job_posts
            WHERE job_posts.id = job_applications.job_post_id
            AND job_posts.employer_id = auth.uid()
        )
    );