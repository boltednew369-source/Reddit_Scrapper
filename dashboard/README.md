# Reddit Scraper Dashboard

A modern, real-time dashboard for monitoring and analyzing your Reddit scraping operations.

## Features

### Overview Dashboard
- Real-time statistics on total posts, average relevance, high-value posts, and daily processing
- Top 10 posts ranked by ROI weight
- Quick access to post details and Reddit links
- Score indicators for relevance, emotion, and pain point analysis

### Posts Management
- Comprehensive list of all scraped posts and comments
- Advanced filtering by subreddit, content type, and relevance score
- Real-time search across titles, content, and subreddits
- Detailed post view with full content, tags, and analysis scores
- Direct links to original Reddit content

### Analytics
- Visual insights across multiple dimensions
- Post distribution by subreddit
- Content type breakdown (posts vs comments)
- Relevance score distribution
- Timeline view of scraping activity
- Comparative analysis of subreddit performance

### Cost Tracking
- Real-time OpenAI API usage monitoring
- Monthly budget tracking with visual indicators
- Token usage analytics (input/output breakdown)
- Historical cost trends and projections
- Budget alerts and status indicators

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd dashboard
npm install
```

2. Environment variables are already configured in `.env`

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Overview page
│   │   ├── PostsList.tsx       # Posts listing and filtering
│   │   ├── Analytics.tsx       # Data visualization
│   │   └── CostTracking.tsx    # API cost monitoring
│   ├── lib/
│   │   └── supabase.ts         # Supabase client and types
│   ├── App.tsx                 # Main app with navigation
│   ├── App.css                 # App-level styles
│   └── index.css               # Global styles
└── ...
```

## Database Schema

### Posts Table
Stores all scraped Reddit content with GPT analysis:
- Post metadata (title, URL, subreddit)
- Timestamps (created, processed)
- AI scores (relevance, emotion, pain)
- Classification (type, lead type, tags)
- ROI weight for prioritization

### Cost Tracking Table
Monitors OpenAI API usage:
- Monthly cost breakdown
- Token usage (input/output)
- Budget tracking and alerts
- Model information

## Key Features Explained

### Score System
- **Relevance Score (0-10)**: How relevant the post is to your business
- **Emotion Score (0-10)**: Emotional intensity of the content
- **Pain Score (0-10)**: Severity of pain points mentioned
- **ROI Weight**: Combined priority score for lead qualification

### Filtering Options
- Filter by subreddit community
- Filter by content type (posts/comments)
- Adjustable minimum relevance threshold
- Real-time search across all content

### Visual Indicators
- Color-coded scores (green: high, yellow: medium, red: low)
- Budget usage indicators (green: safe, yellow: warning, red: critical)
- Activity timeline charts
- Distribution visualizations

## Navigation

The sidebar provides quick access to all sections:
- **Overview**: Dashboard with key metrics and top posts
- **Posts**: Complete list with filtering and search
- **Analytics**: Visual insights and trends
- **Cost Tracking**: API usage and budget monitoring

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Performance

- Efficient data fetching with Supabase
- Optimized React components
- Lazy loading for large datasets
- Production build under 800KB

## Support

For issues or questions about the dashboard, check the main project README or review the database schema in the Supabase console.
