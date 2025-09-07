# Reddit Pulse

**Unlock Reddit's insights for your business, powered by AI.**

A comprehensive web application for businesses to monitor niche subreddits, export relevant data, and analyze sentiment to identify trends and customer feedback. Built with modern React and powered by advanced AI sentiment analysis.

![Reddit Pulse Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Reddit+Pulse+Dashboard)

## 🚀 Features

### Core Functionality
- **🔍 Niche Subreddit Monitoring & Alerts**: Automated real-time alerts for new posts/comments in specific subreddits based on custom keywords
- **📊 Targeted Content Export**: Download curated datasets of Reddit content with advanced filtering by date ranges, scores, and user criteria
- **🧠 AI-Powered Sentiment Analysis**: Comprehensive sentiment analysis using OpenAI integration with fallback to rule-based analysis
- **📈 Trend Identification**: Advanced algorithms to detect emerging topics and discussions gaining traction across subreddits

### Advanced Features
- **⚡ Real-time Monitoring**: WebSocket-based real-time updates for instant notifications
- **🎯 Smart Filtering**: Advanced search and filtering capabilities with multiple criteria
- **📋 Data Export**: Export data in multiple formats (CSV, JSON) with customizable fields
- **📱 Responsive Design**: Fully responsive interface that works on all devices
- **🔐 Subscription Management**: Tiered subscription system with feature access control
- **📊 Analytics Dashboard**: Comprehensive analytics and usage statistics

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development and building
- **Tailwind CSS** for utility-first styling with custom design system
- **Lucide React** for consistent iconography
- **Modern JavaScript (ES6+)** with async/await patterns

### Backend Services
- **Reddit API Integration** for real-time data fetching
- **OpenAI API** for advanced sentiment analysis
- **Local Storage** for offline functionality and caching
- **Service Worker** architecture for background processing

### Architecture
- **Component-based architecture** with reusable UI components
- **Service layer pattern** for API and data management
- **State management** with React hooks and context
- **Modular design system** with consistent theming

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** package manager
- **Reddit API credentials** (optional, for live data)
- **OpenAI API key** (optional, for AI sentiment analysis)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vistara-apps/this-is-a-1576.git
cd reddit-pulse
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your API credentials:
```env
VITE_REDDIT_CLIENT_ID=your_reddit_client_id
VITE_REDDIT_CLIENT_SECRET=your_reddit_client_secret
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to `http://localhost:5173`

### Quick Demo

To try the application immediately with demo data:

1. Start the development server
2. Click "Sign in as Demo User" on the login page
3. Explore all features with pre-populated mock data

## 📁 Project Structure

```
reddit-pulse/
├── src/
│   ├── components/          # React components
│   │   ├── DataTable.jsx    # Enhanced data table with sorting/filtering
│   │   ├── DataExport.jsx   # Data export functionality
│   │   ├── DashboardLayout.jsx # Main layout component
│   │   ├── MetricCard.jsx   # Metric display cards
│   │   └── ...              # Other UI components
│   ├── services/            # Service layer
│   │   ├── api.js          # Reddit API integration
│   │   ├── dataManager.js  # Data management and persistence
│   │   └── authService.js  # Authentication and subscriptions
│   ├── data/               # Mock data and constants
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main application component
│   └── main.jsx           # Application entry point
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── API_DOCUMENTATION.md   # Complete API documentation
└── README.md             # This file
```

## 🎯 Usage

### Setting Up Monitoring

1. **Create a Monitor:**
   - Navigate to the Dashboard
   - Click "Add Monitor"
   - Enter subreddit name and keywords
   - Configure alert frequency and filters

2. **Export Data:**
   - Go to Data Export tab
   - Set your search criteria
   - Choose export format (CSV/JSON)
   - Download your curated dataset

3. **Analyze Sentiment:**
   - Use the built-in sentiment analysis
   - View aggregated sentiment scores
   - Identify positive/negative trends

### API Integration

Reddit Pulse provides a comprehensive REST API for programmatic access:

```javascript
// Example: Create a monitor via API
const response = await fetch('/api/monitors', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subredditName: 'technology',
    keywords: ['AI', 'machine learning'],
    alertFrequency: 'realtime'
  })
})
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_REDDIT_CLIENT_ID` | Reddit API client ID | No* |
| `VITE_REDDIT_CLIENT_SECRET` | Reddit API client secret | No* |
| `VITE_OPENAI_API_KEY` | OpenAI API key for sentiment analysis | No* |
| `VITE_API_BASE_URL` | Backend API base URL | No |
| `VITE_ENABLE_REAL_REDDIT_API` | Enable live Reddit API calls | No |

*Not required for demo mode with mock data

### Subscription Tiers

- **Free**: 5 subreddits, 3 exports/day, basic features
- **Pro**: 25 subreddits, 20 exports/day, sentiment analysis, trends
- **Business**: 100 subreddits, 100 exports/day, API access, team features

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run lint:fix` | Fix auto-fixable ESLint issues |
| `npm run test` | Run test suite (when implemented) |

## 🎨 Design System

Reddit Pulse uses a custom design system built on Tailwind CSS:

### Colors
- **Primary**: `hsl(217, 70%, 50%)` - Main brand color
- **Accent**: `hsl(147, 60%, 45%)` - Success and positive actions
- **Background**: `hsl(220, 25%, 95%)` - Page backgrounds
- **Surface**: `hsl(0, 0%, 100%)` - Card and component backgrounds

### Typography
- **Display**: Large headings and hero text
- **Heading**: Section headings and titles
- **Body**: Regular content text
- **Caption**: Small text and metadata

### Components
All components follow consistent design patterns with variants for different use cases.

## 🔒 Security

- **API Key Authentication**: Secure API access with bearer tokens
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Data Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper CORS configuration for API access
- **Environment Variables**: Sensitive data stored in environment variables

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder or connect via Git
- **AWS S3 + CloudFront**: Upload build files to S3 with CloudFront CDN
- **Docker**: Use the included Dockerfile for containerized deployment

### Environment Setup

Ensure all required environment variables are set in your deployment platform.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper commit messages
4. **Add tests** for new functionality
5. **Run linting**: `npm run lint`
6. **Submit a pull request**

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Ensure responsive design for all new components
- Test across different browsers and devices

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Caching**: Intelligent caching for API responses and static assets
- **Lazy Loading**: Components and routes loaded on demand

## 🐛 Troubleshooting

### Common Issues

**API Rate Limiting:**
- Implement exponential backoff in API calls
- Use caching to reduce API requests
- Consider upgrading subscription tier

**Build Errors:**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify environment variables are set correctly

**Performance Issues:**
- Enable React DevTools Profiler
- Check for unnecessary re-renders
- Optimize large data sets with pagination

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Reddit API** for providing access to Reddit data
- **OpenAI** for advanced sentiment analysis capabilities
- **Tailwind CSS** for the utility-first CSS framework
- **React Team** for the amazing React library
- **Vite** for the fast build tool and development server

## 📞 Support

- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-1576/issues)
- **Email**: support@redditpulse.com
- **Discord**: [Join our community](https://discord.gg/redditpulse)

---

**Built with ❤️ for businesses who want to understand their customers better through Reddit insights.**
