import React, { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react'
import MetricCard from './MetricCard'
import { mockRedditData } from '../data/mockData'
import { analyzeSentiment } from '../utils/sentimentAnalysis'

const SentimentAnalysis = () => {
  const [selectedTopic, setSelectedTopic] = useState('')
  const [sentimentData, setSentimentData] = useState(null)
  const [loading, setLoading] = useState(false)

  const topics = [
    'artificial intelligence',
    'cryptocurrency',
    'climate change',
    'remote work',
    'electric vehicles'
  ]

  const runSentimentAnalysis = async () => {
    if (!selectedTopic) return

    setLoading(true)
    
    // Filter posts related to the topic
    const topicPosts = mockRedditData.filter(post =>
      post.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      post.content.toLowerCase().includes(selectedTopic.toLowerCase())
    )

    // Analyze sentiment for each post
    const analysisPromises = topicPosts.slice(0, 10).map(async post => {
      const sentiment = await analyzeSentiment(post.title + ' ' + post.content)
      return {
        ...post,
        sentiment
      }
    })

    try {
      const analyzedPosts = await Promise.all(analysisPromises)
      
      // Calculate aggregate sentiment
      const sentimentCounts = {
        positive: analyzedPosts.filter(p => p.sentiment === 'positive').length,
        negative: analyzedPosts.filter(p => p.sentiment === 'negative').length,
        neutral: analyzedPosts.filter(p => p.sentiment === 'neutral').length
      }

      const total = analyzedPosts.length
      const sentimentPercentages = {
        positive: Math.round((sentimentCounts.positive / total) * 100),
        negative: Math.round((sentimentCounts.negative / total) * 100),
        neutral: Math.round((sentimentCounts.neutral / total) * 100)
      }

      setSentimentData({
        topic: selectedTopic,
        total,
        counts: sentimentCounts,
        percentages: sentimentPercentages,
        posts: analyzedPosts,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Sentiment analysis failed:', error)
      // Fallback to mock data
      const mockSentiment = {
        topic: selectedTopic,
        total: topicPosts.length,
        counts: {
          positive: Math.floor(topicPosts.length * 0.4),
          negative: Math.floor(topicPosts.length * 0.3),
          neutral: Math.floor(topicPosts.length * 0.3)
        },
        percentages: { positive: 40, negative: 30, neutral: 30 },
        posts: topicPosts.slice(0, 10),
        timestamp: new Date().toISOString()
      }
      setSentimentData(mockSentiment)
    }

    setLoading(false)
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading text-text-primary">Sentiment Analysis</h1>
        <p className="mt-1 text-body text-text-secondary">
          Analyze the sentiment of discussions around specific topics
        </p>
      </div>

      {/* Topic Selection */}
      <div className="bg-surface p-6 rounded-lg shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Select Topic for Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-caption text-text-primary mb-2">Choose a topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Select a topic...</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runSentimentAnalysis}
              disabled={!selectedTopic || loading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </div>
              ) : (
                'Analyze Sentiment'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {sentimentData && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Posts Analyzed"
              value={sentimentData.total}
              icon={<BarChart3 className="w-5 h-5" />}
              variant="default"
            />
            <MetricCard
              title="Positive Sentiment"
              value={`${sentimentData.percentages.positive}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              variant="trendingUp"
            />
            <MetricCard
              title="Negative Sentiment"
              value={`${sentimentData.percentages.negative}%`}
              icon={<TrendingDown className="w-5 h-5" />}
              variant="trendingDown"
            />
            <MetricCard
              title="Neutral Sentiment"
              value={`${sentimentData.percentages.neutral}%`}
              icon={<Minus className="w-5 h-5" />}
              variant="default"
            />
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-surface p-6 rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Sentiment Breakdown for "{sentimentData.topic}"
            </h3>
            
            <div className="space-y-4">
              {/* Positive */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-text-primary">Positive</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${sentimentData.percentages.positive}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-12">
                    {sentimentData.percentages.positive}%
                  </span>
                </div>
              </div>

              {/* Negative */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-text-primary">Negative</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{ width: `${sentimentData.percentages.negative}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-12">
                    {sentimentData.percentages.negative}%
                  </span>
                </div>
              </div>

              {/* Neutral */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Minus className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-text-primary">Neutral</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gray-500 h-3 rounded-full" 
                      style={{ width: `${sentimentData.percentages.neutral}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-12">
                    {sentimentData.percentages.neutral}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Posts */}
          <div className="bg-surface rounded-lg shadow-card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-text-primary">Individual Post Analysis</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {sentimentData.posts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-text-secondary">r/{post.subreddit}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(post.sentiment || 'neutral')}`}>
                          {post.sentiment || 'neutral'}
                        </span>
                      </div>
                      <h4 className="font-medium text-text-primary mb-2">{post.title}</h4>
                      <p className="text-sm text-text-secondary line-clamp-2">{post.content}</p>
                      <div className="mt-2 text-xs text-text-secondary">
                        by u/{post.author} • {post.score} upvotes
                      </div>
                    </div>
                    <div className="ml-4">
                      {getSentimentIcon(post.sentiment || 'neutral')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!sentimentData && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-text-secondary" />
          <h3 className="mt-4 text-lg font-medium text-text-primary">No Analysis Yet</h3>
          <p className="mt-2 text-text-secondary">
            Select a topic and run sentiment analysis to see insights about public opinion.
          </p>
        </div>
      )}
    </div>
  )
}

export default SentimentAnalysis