import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';
import { Search, Filter, ExternalLink, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './PostsList.css';

function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minRelevance, setMinRelevance] = useState(0);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedSubreddit, selectedType, minRelevance]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('processed_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data);
        const uniqueSubreddits = Array.from(
          new Set(data.map((p) => p.subreddit).filter(Boolean))
        );
        setSubreddits(uniqueSubreddits);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.body?.toLowerCase().includes(query) ||
          p.subreddit?.toLowerCase().includes(query)
      );
    }

    if (selectedSubreddit !== 'all') {
      filtered = filtered.filter((p) => p.subreddit === selectedSubreddit);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    if (minRelevance > 0) {
      filtered = filtered.filter((p) => p.relevance_score >= minRelevance);
    }

    setFilteredPosts(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="posts-list">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="posts-list">
      <div className="posts-header">
        <div>
          <h1>All Posts</h1>
          <p>
            Showing {filteredPosts.length} of {posts.length} posts
          </p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={selectedSubreddit}
              onChange={(e) => setSelectedSubreddit(e.target.value)}
            >
              <option value="all">All Subreddits</option>
              {subreddits.map((sub) => (
                <option key={sub} value={sub}>
                  r/{sub}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Relevance: {minRelevance}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={minRelevance}
              onChange={(e) => setMinRelevance(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="posts-grid">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="post-card"
            onClick={() => setSelectedPost(post)}
          >
            <div className="post-card-header">
              <div className="post-meta">
                <span className="subreddit-badge">r/{post.subreddit}</span>
                <span className="type-badge">{post.type}</span>
              </div>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="external-link"
              >
                <ExternalLink size={16} />
              </a>
            </div>

            <h3 className="post-title">
              {post.title || post.body?.substring(0, 100) + '...'}
            </h3>

            <p className="post-excerpt">
              {post.body?.substring(0, 150)}
              {post.body && post.body.length > 150 ? '...' : ''}
            </p>

            <div className="post-scores">
              <div className="score-item">
                <span className="score-label">Relevance</span>
                <span
                  className="score-value"
                  style={{ color: getScoreColor(post.relevance_score) }}
                >
                  {post.relevance_score?.toFixed(1)}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Emotion</span>
                <span
                  className="score-value"
                  style={{ color: getScoreColor(post.emotion_score) }}
                >
                  {post.emotion_score?.toFixed(1)}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Pain</span>
                <span
                  className="score-value"
                  style={{ color: getScoreColor(post.pain_score) }}
                >
                  {post.pain_score?.toFixed(1)}
                </span>
              </div>
              <div className="score-item roi">
                <span className="score-label">ROI</span>
                <span className="score-value">{post.roi_weight}</span>
              </div>
            </div>

            {post.tags && (
              <div className="post-tags">
                {post.tags.split(',').slice(0, 3).map((tag, i) => (
                  <span key={i} className="tag">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="post-footer">
              <span className="post-date">
                <Calendar size={14} />
                {formatDistanceToNow(new Date(post.created_utc), {
                  addSuffix: true,
                })}
              </span>
              {post.lead_type && (
                <span className="lead-type">{post.lead_type}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost.title || 'Post Details'}</h2>
              <button
                className="close-button"
                onClick={() => setSelectedPost(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span className="subreddit-badge">
                  r/{selectedPost.subreddit}
                </span>
                <span className="type-badge">{selectedPost.type}</span>
                <a
                  href={selectedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-on-reddit"
                >
                  View on Reddit <ExternalLink size={14} />
                </a>
              </div>

              <div className="modal-scores-grid">
                <div className="modal-score">
                  <span>Relevance</span>
                  <strong
                    style={{
                      color: getScoreColor(selectedPost.relevance_score),
                    }}
                  >
                    {selectedPost.relevance_score?.toFixed(1)}
                  </strong>
                </div>
                <div className="modal-score">
                  <span>Emotion</span>
                  <strong
                    style={{ color: getScoreColor(selectedPost.emotion_score) }}
                  >
                    {selectedPost.emotion_score?.toFixed(1)}
                  </strong>
                </div>
                <div className="modal-score">
                  <span>Pain</span>
                  <strong
                    style={{ color: getScoreColor(selectedPost.pain_score) }}
                  >
                    {selectedPost.pain_score?.toFixed(1)}
                  </strong>
                </div>
                <div className="modal-score">
                  <span>ROI Weight</span>
                  <strong>{selectedPost.roi_weight}</strong>
                </div>
              </div>

              <div className="modal-body-text">
                <h4>Content</h4>
                <p>{selectedPost.body}</p>
              </div>

              {selectedPost.tags && (
                <div className="modal-tags">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {selectedPost.tags.split(',').map((tag, i) => (
                      <span key={i} className="tag">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.lead_type && (
                <div className="modal-lead-type">
                  <h4>Lead Type</h4>
                  <p>{selectedPost.lead_type}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsList;
