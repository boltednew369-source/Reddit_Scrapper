import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PostsList from './components/PostsList';
import Analytics from './components/Analytics';
import CostTracking from './components/CostTracking';
import { BarChart3, FileText, DollarSign, TrendingUp } from 'lucide-react';

type View = 'dashboard' | 'posts' | 'analytics' | 'costs';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Reddit Scraper</h1>
          <p className="sidebar-subtitle">Intelligence Dashboard</p>
        </div>

        <div className="nav-items">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <TrendingUp size={20} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${currentView === 'posts' ? 'active' : ''}`}
            onClick={() => setCurrentView('posts')}
          >
            <FileText size={20} />
            <span>Posts</span>
          </button>

          <button
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>

          <button
            className={`nav-item ${currentView === 'costs' ? 'active' : ''}`}
            onClick={() => setCurrentView('costs')}
          >
            <DollarSign size={20} />
            <span>Cost Tracking</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'posts' && <PostsList />}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'costs' && <CostTracking />}
      </main>
    </div>
  );
}

export default App;
