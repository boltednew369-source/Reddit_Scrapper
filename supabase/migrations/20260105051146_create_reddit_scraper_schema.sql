/*
  # Reddit Scraper Dashboard Schema

  ## New Tables
  
  ### `posts`
  Stores scraped Reddit posts and comments with GPT analysis
  - `id` (text, primary key) - Reddit post/comment ID
  - `url` (text) - Direct URL to the Reddit post/comment
  - `title` (text) - Post title
  - `body` (text) - Post or comment content
  - `subreddit` (text) - Source subreddit name
  - `created_utc` (timestamptz) - When post was created on Reddit
  - `last_active` (timestamptz) - Last activity timestamp
  - `processed_at` (timestamptz) - When we processed this post
  - `relevance_score` (numeric) - GPT-scored relevance (0-10)
  - `emotion_score` (numeric) - GPT-scored emotional intensity (0-10)
  - `pain_score` (numeric) - GPT-scored pain point severity (0-10)
  - `lead_type` (text) - Classification of lead type
  - `tags` (text) - Comma-separated tags
  - `roi_weight` (integer) - ROI weight for prioritization
  - `community_type` (text) - Type of community (primary/exploratory)
  - `type` (text) - 'post' or 'comment'
  - `insight_processed` (boolean) - Whether deep insight extraction was done
  - `created_at` (timestamptz) - Database record creation time

  ### `cost_tracking`
  Tracks OpenAI API usage and costs by month
  - `id` (uuid, primary key) - Unique identifier
  - `month` (text) - Month in YYYY-MM format
  - `total_cost` (numeric) - Total cost for the month in USD
  - `input_tokens` (bigint) - Total input tokens used
  - `output_tokens` (bigint) - Total output tokens used
  - `model` (text) - GPT model used
  - `monthly_budget` (numeric) - Budget limit for the month
  - `created_at` (timestamptz) - When record was created
  - `updated_at` (timestamptz) - Last update time

  ### `processing_history`
  Tracks which posts have been processed to avoid duplicates
  - `id` (text, primary key) - Reddit post/comment ID
  - `processed_at` (timestamptz) - When it was processed

  ## Security
  - Enable RLS on all tables
  - Public read access for dashboard viewing
  - Authenticated users only for write operations

  ## Indexes
  - Posts: processed_at, relevance_score, roi_weight, subreddit for efficient querying
  - Cost tracking: month for monthly aggregations
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id text PRIMARY KEY,
  url text,
  title text,
  body text,
  subreddit text,
  created_utc timestamptz,
  last_active timestamptz,
  processed_at timestamptz DEFAULT now(),
  relevance_score numeric,
  emotion_score numeric,
  pain_score numeric,
  lead_type text,
  tags text,
  roi_weight integer DEFAULT 0,
  community_type text,
  type text,
  insight_processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create cost tracking table
CREATE TABLE IF NOT EXISTS cost_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  total_cost numeric DEFAULT 0,
  input_tokens bigint DEFAULT 0,
  output_tokens bigint DEFAULT 0,
  model text,
  monthly_budget numeric DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create processing history table
CREATE TABLE IF NOT EXISTS processing_history (
  id text PRIMARY KEY,
  processed_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_posts_processed_at ON posts(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_relevance ON posts(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_roi ON posts(roi_weight DESC);
CREATE INDEX IF NOT EXISTS idx_posts_subreddit ON posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_created_utc ON posts(created_utc DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_month ON cost_tracking(month);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (dashboard viewing)
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view cost tracking"
  ON cost_tracking FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view processing history"
  ON processing_history FOR SELECT
  USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert cost tracking"
  ON cost_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cost tracking"
  ON cost_tracking FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert processing history"
  ON processing_history FOR INSERT
  TO authenticated
  WITH CHECK (true);