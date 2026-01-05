import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Users, MessageSquare, Target } from 'lucide-react';
import './Analytics.css';

interface SubredditStats {
  subreddit: string;
  count: number;
  avgRelevance: number;
  avgROI: number;
}

function Analytics() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [subredditStats, setSubredditStats] = useState<SubredditStats[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_utc', { ascending: true });

      if (error) throw error;

      if (data) {
        setPosts(data);
        calculateSubredditStats(data);
        calculateTypeDistribution(data);
        calculateScoreDistribution(data);
        calculateTimelineData(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubredditStats = (posts: Post[]) => {
    const statsMap = new Map<string, { count: number; totalRelevance: number; totalROI: number }>();

    posts.forEach((post) => {
      if (!post.subreddit) return;

      const existing = statsMap.get(post.subreddit) || {
        count: 0,
        totalRelevance: 0,
        totalROI: 0,
      };

      statsMap.set(post.subreddit, {
        count: existing.count + 1,
        totalRelevance: existing.totalRelevance + (post.relevance_score || 0),
        totalROI: existing.totalROI + (post.roi_weight || 0),
      });
    });

    const stats: SubredditStats[] = Array.from(statsMap.entries())
      .map(([subreddit, data]) => ({
        subreddit,
        count: data.count,
        avgRelevance: data.totalRelevance / data.count,
        avgROI: data.totalROI / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setSubredditStats(stats);
  };

  const calculateTypeDistribution = (posts: Post[]) => {
    const types = posts.reduce((acc, post) => {
      const type = post.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribution = Object.entries(types).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    setTypeDistribution(distribution);
  };

  const calculateScoreDistribution = (posts: Post[]) => {
    const ranges = [
      { name: '0-2', min: 0, max: 2, count: 0 },
      { name: '2-4', min: 2, max: 4, count: 0 },
      { name: '4-6', min: 4, max: 6, count: 0 },
      { name: '6-8', min: 6, max: 8, count: 0 },
      { name: '8-10', min: 8, max: 10, count: 0 },
    ];

    posts.forEach((post) => {
      const score = post.relevance_score || 0;
      const range = ranges.find((r) => score >= r.min && score < r.max);
      if (range) range.count++;
    });

    setScoreDistribution(ranges);
  };

  const calculateTimelineData = (posts: Post[]) => {
    const dateMap = new Map<string, number>();

    posts.forEach((post) => {
      const date = new Date(post.processed_at).toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const timeline = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    setTimelineData(timeline);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Insights from {posts.length} scraped posts</p>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <Users size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Subreddits</div>
            <div className="summary-value">{subredditStats.length}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <MessageSquare size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Posts</div>
            <div className="summary-value">
              {posts.filter((p) => p.type === 'post').length}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <MessageSquare size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Comments</div>
            <div className="summary-value">
              {posts.filter((p) => p.type === 'comment').length}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Target size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Avg Relevance</div>
            <div className="summary-value">
              {(
                posts.reduce((sum, p) => sum + (p.relevance_score || 0), 0) /
                posts.length
              ).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Posts by Subreddit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subredditStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="subreddit" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Post Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Content Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Relevance Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#10b981" name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Posts Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Posts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card wide">
          <h3>Average Scores by Subreddit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subredditStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="subreddit" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="avgRelevance" fill="#3b82f6" name="Avg Relevance" />
              <Bar dataKey="avgROI" fill="#10b981" name="Avg ROI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
