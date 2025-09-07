import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Hash, Eye } from 'lucide-react'
import MetricCard from './MetricCard'
import { mockRedditData } from '../data/mockData'

const TrendIdentification = () => {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate trend detection
    const detectTrends = () => {
      // Extract keywords and topics from mock data
      const keywords = {}
      
      mockRedditData.forEach(post => {
        // Simple keyword extraction (in real app, this would be more sophisticated)
        const words = (post.title + ' ' + post.content)
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'make', 'more', 'like', 'time', 'very', 'when', 'come', 'here', 'just', 'than', 'only', 'other', 'also', 'after', 'first', 'well', 'year', 'work', 'such', 'through', 'where', 'before', 'never', 'same', 'much', 'while'].includes(word))

        words.forEach(word => {
          keywords[word] = (keywords[word] || 0) + 1
        })
      })

      // Get top trending keywords
      const trendingKeywords = Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count], index) => ({
          id: index + 1,
          topic: keyword,
          trendScore: Math.min(95, count * 5 + Math.random() * 20),
          postsCount: count,
          detectionTimestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          relevantSubreddits: ['technology', 'programming', 'startups', 'business'].slice(0, Math.floor(Math.random() * 3) + 1),
          growth: Math.floor(Math.random() * 200) + 10,
          velocity: ['Rising Fast', 'Steady Growth', 'Accelerating', 'Peak Interest'][Math.floor(Math.random() * 4)]
        }))

      setTrends(trendingKeywords)
      setLoading(false)
    }

    const timer = setTimeout(detectTrends, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getTrendIcon = (velocity) => {
    return <TrendingUp className="w-4 h-4 text-accent" />
  }

  const getTrendColor = (score) => {
    if (score >= 80) return 'bg-red-100 text-red-800'
    if (score >= 60) return 'bg-orange-100 text-orange-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Hot'
    if (score >= 60) return 'Trending'
    if (score >= 40) return 'Rising'
    return 'Emerging'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading text-text-primary">Trend Identification</h1>
          <p className="mt-1 text-body text-text-secondary">
            AI-powered detection of emerging trends and topics
          </p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Analyzing trends...</p>
        </div>
      </div>
    )
  }

  const topTrends = trends.slice(0, 3)
  const hotTrends = trends.filter(t => t.trendScore >= 80).length
  const risingTrends = trends.filter(t => t.trendScore >= 60 && t.trendScore < 80).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading text-text-primary">Trend Identification</h1>
        <p className="mt-1 text-body text-text-secondary">
          AI-powered detection of emerging trends and topics gaining traction
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Trends Detected"
          value={trends.length}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          title="Hot Trends"
          value={hotTrends}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="trendingUp"
        />
        <MetricCard
          title="Rising Trends"
          value={risingTrends}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          title="Last Updated"
          value="Now"
          icon={<Calendar className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Top Trends */}
      <div className="bg-surface p-6 rounded-lg shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Top Trending Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topTrends.map((trend, index) => (
            <div key={trend.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(trend.trendScore)}`}>
                  #{index + 1} {getScoreLabel(trend.trendScore)}
                </span>
                <span className="text-xs text-text-secondary">
                  {trend.trendScore.toFixed(0)}%
                </span>
              </div>
              <h4 className="font-medium text-text-primary capitalize mb-1">{trend.topic}</h4>
              <p className="text-sm text-text-secondary mb-2">{trend.postsCount} mentions</p>
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <span className="bg-accent/10 text-accent px-2 py-1 rounded">+{trend.growth}%</span>
                <span>{trend.velocity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Trends */}
      <div className="bg-surface rounded-lg shadow-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary">All Detected Trends</h3>
          <p className="text-text-secondary">Sorted by trend score and velocity</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Trend Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Mentions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Velocity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Subreddits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trends.map((trend, index) => (
                <tr key={trend.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.velocity)}
                      <span className="capitalize font-medium">{trend.topic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${trend.trendScore}%` }}
                        />
                      </div>
                      <span className="text-xs">{trend.trendScore.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {trend.postsCount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs">
                      {trend.velocity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    <div className="flex flex-wrap gap-1">
                      {trend.relevantSubreddits.slice(0, 2).map(sub => (
                        <span key={sub} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          r/{sub}
                        </span>
                      ))}
                      {trend.relevantSubreddits.length > 2 && (
                        <span className="text-xs text-text-secondary">
                          +{trend.relevantSubreddits.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(trend.detectionTimestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TrendIdentification