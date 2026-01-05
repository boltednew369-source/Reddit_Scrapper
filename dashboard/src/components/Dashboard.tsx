import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';
import { TrendingUp, FileText, Target, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

interface Stats {
  totalPosts: number;
  avgRelevance: number;
  highValuePosts: number;
  processedToday: number;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    avgRelevance: 0,
    highValuePosts: 0,
    processedToday: 0,
  });
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('roi_weight', { ascending: false });

      if (error) throw error;

      if (posts) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processedToday = posts.filter(
          (p) => new Date(p.processed_at) >= today
        ).length;

        const totalRelevance = posts.reduce(
          (sum, p) => sum + (p.relevance_score || 0),
          0
        );

        const highValue = posts.filter(
          (p) => p.relevance_score >= 7 && p.roi_weight >= 5
        ).length;

        setStats({
          totalPosts: posts.length,
          avgRelevance: posts.length > 0 ? totalRelevance / posts.length : 0,
          highValuePosts: highValue,
          processedToday,
        });

        setTopPosts(posts.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <p>Reddit scraper intelligence dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Posts</div>
            <div className="stat-value">{stats.totalPosts}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Relevance</div>
            <div className="stat-value">{stats.avgRelevance.toFixed(1)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">High Value</div>
            <div className="stat-value">{stats.highValuePosts}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Processed Today</div>
            <div className="stat-value">{stats.processedToday}</div>
          </div>
        </div>
      </div>

      <div className="top-posts-section">
        <h2>Top Posts by ROI</h2>
        <div className="posts-table">
          <div className="table-header">
            <div>Title</div>
            <div>Subreddit</div>
            <div>Scores</div>
            <div>ROI</div>
            <div>Posted</div>
          </div>
          {topPosts.map((post) => (
            <div key={post.id} className="table-row">
              <div className="post-title">
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.title || post.body?.substring(0, 80) + '...'}
                </a>
                <span className="post-type">{post.type}</span>
              </div>
              <div className="subreddit">r/{post.subreddit}</div>
              <div className="scores">
                <span
                  className="score-badge"
                  style={{ background: getScoreColor(post.relevance_score) }}
                >
                  R: {post.relevance_score?.toFixed(1)}
                </span>
                <span
                  className="score-badge"
                  style={{ background: getScoreColor(post.emotion_score) }}
                >
                  E: {post.emotion_score?.toFixed(1)}
                </span>
                <span
                  className="score-badge"
                  style={{ background: getScoreColor(post.pain_score) }}
                >
                  P: {post.pain_score?.toFixed(1)}
                </span>
              </div>
              <div className="roi-weight">{post.roi_weight}</div>
              <div className="post-date">
                {formatDistanceToNow(new Date(post.created_utc), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
