import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Post {
  id: string;
  url: string;
  title: string;
  body: string;
  subreddit: string;
  created_utc: string;
  last_active: string;
  processed_at: string;
  relevance_score: number;
  emotion_score: number;
  pain_score: number;
  lead_type: string;
  tags: string;
  roi_weight: number;
  community_type: string;
  type: string;
  insight_processed: boolean;
  created_at: string;
}

export interface CostTracking {
  id: string;
  month: string;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  model: string;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
}
