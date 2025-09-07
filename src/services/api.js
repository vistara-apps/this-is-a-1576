// API service layer for Reddit Pulse
// Handles all external API calls and data management

class RedditPulseAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
    this.redditClientId = import.meta.env.VITE_REDDIT_CLIENT_ID
    this.redditClientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  }

  // Reddit API Integration
  async getRedditAccessToken() {
    try {
      const auth = btoa(`${this.redditClientId}:${this.redditClientSecret}`)
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RedditPulse/1.0.0'
        },
        body: 'grant_type=client_credentials'
      })
      
      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Failed to get Reddit access token:', error)
      throw error
    }
  }

  async searchRedditPosts(subreddit, query, options = {}) {
    try {
      const token = await this.getRedditAccessToken()
      const {
        sort = 'new',
        time = 'week',
        limit = 25,
        after = null
      } = options

      let url = `https://oauth.reddit.com/r/${subreddit}/search`
      const params = new URLSearchParams({
        q: query,
        sort,
        t: time,
        limit: limit.toString(),
        restrict_sr: 'true'
      })

      if (after) params.append('after', after)

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'RedditPulse/1.0.0'
        }
      })

      const data = await response.json()
      return this.formatRedditData(data.data.children)
    } catch (error) {
      console.error('Failed to search Reddit posts:', error)
      throw error
    }
  }

  async getSubredditPosts(subreddit, options = {}) {
    try {
      const token = await this.getRedditAccessToken()
      const {
        sort = 'new',
        time = 'week',
        limit = 25,
        after = null
      } = options

      let url = `https://oauth.reddit.com/r/${subreddit}/${sort}`
      const params = new URLSearchParams({
        limit: limit.toString()
      })

      if (sort === 'top') params.append('t', time)
      if (after) params.append('after', after)

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'RedditPulse/1.0.0'
        }
      })

      const data = await response.json()
      return this.formatRedditData(data.data.children)
    } catch (error) {
      console.error('Failed to get subreddit posts:', error)
      throw error
    }
  }

  async getPostComments(subreddit, postId, options = {}) {
    try {
      const token = await this.getRedditAccessToken()
      const { limit = 100, sort = 'best' } = options

      const url = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}`
      const params = new URLSearchParams({
        limit: limit.toString(),
        sort
      })

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'RedditPulse/1.0.0'
        }
      })

      const data = await response.json()
      return this.formatCommentsData(data[1].data.children)
    } catch (error) {
      console.error('Failed to get post comments:', error)
      throw error
    }
  }

  formatRedditData(children) {
    return children.map(child => ({
      id: child.data.id,
      title: child.data.title,
      content: child.data.selftext || '',
      author: child.data.author,
      subreddit: child.data.subreddit,
      score: child.data.score,
      upvoteRatio: child.data.upvote_ratio,
      numComments: child.data.num_comments,
      created: new Date(child.data.created_utc * 1000).toISOString(),
      url: child.data.url,
      permalink: `https://reddit.com${child.data.permalink}`,
      flair: child.data.link_flair_text,
      isVideo: child.data.is_video,
      thumbnail: child.data.thumbnail !== 'self' ? child.data.thumbnail : null
    }))
  }

  formatCommentsData(children) {
    return children
      .filter(child => child.data.body && child.data.body !== '[deleted]')
      .map(child => ({
        id: child.data.id,
        body: child.data.body,
        author: child.data.author,
        score: child.data.score,
        created: new Date(child.data.created_utc * 1000).toISOString(),
        parentId: child.data.parent_id,
        depth: child.data.depth || 0
      }))
  }

  // Sentiment Analysis Integration
  async analyzeSentiment(text) {
    if (!this.openaiApiKey) {
      return this.performSimpleSentimentAnalysis(text)
    }

    try {
      const { OpenAI } = await import('openai')
      
      const openai = new OpenAI({
        apiKey: this.openaiApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
      })

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of the given text. Respond with a JSON object containing 'sentiment' (positive/negative/neutral) and 'confidence' (0-1 score)."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 50,
        temperature: 0
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{"sentiment": "neutral", "confidence": 0.5}')
      return {
        sentiment: result.sentiment,
        confidence: result.confidence || 0.5,
        method: 'openai'
      }
    } catch (error) {
      console.warn('OpenAI sentiment analysis failed, using fallback:', error)
      return this.performSimpleSentimentAnalysis(text)
    }
  }

  performSimpleSentimentAnalysis(text) {
    const positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'positive', 
      'love', 'like', 'best', 'awesome', 'brilliant', 'perfect', 'outstanding',
      'impressive', 'remarkable', 'breakthrough', 'success', 'innovation', 'excited'
    ]
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'negative', 
      'disappointing', 'failure', 'problem', 'issue', 'concern', 'worry',
      'decline', 'drop', 'crisis', 'threat', 'risk', 'danger', 'frustrated'
    ]

    const words = text.toLowerCase().split(/\W+/)
    let positiveScore = 0
    let negativeScore = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++
      if (negativeWords.includes(word)) negativeScore++
    })
    
    const total = positiveScore + negativeScore
    const confidence = total > 0 ? Math.max(positiveScore, negativeScore) / total : 0.5
    
    let sentiment = 'neutral'
    if (positiveScore > negativeScore) sentiment = 'positive'
    else if (negativeScore > positiveScore) sentiment = 'negative'
    
    return {
      sentiment,
      confidence,
      method: 'simple'
    }
  }

  // Trend Analysis
  async identifyTrends(posts, options = {}) {
    const { timeWindow = 7, minMentions = 3 } = options
    
    // Extract keywords and phrases
    const keywords = this.extractKeywords(posts)
    
    // Group by time periods
    const timeGroups = this.groupPostsByTime(posts, timeWindow)
    
    // Calculate trend scores
    const trends = this.calculateTrendScores(keywords, timeGroups, minMentions)
    
    return trends.sort((a, b) => b.trendScore - a.trendScore)
  }

  extractKeywords(posts) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ])

    const keywordCounts = new Map()
    
    posts.forEach(post => {
      const text = `${post.title} ${post.content}`.toLowerCase()
      const words = text.match(/\b\w{3,}\b/g) || []
      
      words.forEach(word => {
        if (!stopWords.has(word) && word.length > 2) {
          keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1)
        }
      })
    })
    
    return keywordCounts
  }

  groupPostsByTime(posts, windowDays) {
    const now = new Date()
    const groups = []
    
    for (let i = 0; i < windowDays; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const postsInPeriod = posts.filter(post => {
        const postDate = new Date(post.created)
        return postDate >= date && postDate < nextDate
      })
      
      groups.push({
        date: date.toISOString(),
        posts: postsInPeriod,
        count: postsInPeriod.length
      })
    }
    
    return groups.reverse() // Oldest first
  }

  calculateTrendScores(keywords, timeGroups, minMentions) {
    const trends = []
    
    keywords.forEach((totalCount, keyword) => {
      if (totalCount < minMentions) return
      
      const dailyCounts = timeGroups.map(group => {
        return group.posts.reduce((count, post) => {
          const text = `${post.title} ${post.content}`.toLowerCase()
          return count + (text.includes(keyword) ? 1 : 0)
        }, 0)
      })
      
      // Calculate trend score (simple linear regression slope)
      const trendScore = this.calculateTrendSlope(dailyCounts)
      
      trends.push({
        keyword,
        totalMentions: totalCount,
        dailyCounts,
        trendScore,
        isRising: trendScore > 0,
        momentum: Math.abs(trendScore)
      })
    })
    
    return trends
  }

  calculateTrendSlope(values) {
    const n = values.length
    if (n < 2) return 0
    
    const xSum = (n * (n - 1)) / 2
    const ySum = values.reduce((sum, val) => sum + val, 0)
    const xySum = values.reduce((sum, val, i) => sum + (i * val), 0)
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum)
    return slope || 0
  }

  // Data Export
  async exportData(data, format = 'csv') {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(data)
      case 'json':
        return this.exportToJSON(data)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  exportToCSV(data) {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  exportToJSON(data) {
    return JSON.stringify(data, null, 2)
  }

  // Local Storage for Offline Functionality
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`reddit_pulse_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(`reddit_pulse_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(`reddit_pulse_${key}`)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }
}

export const redditAPI = new RedditPulseAPI()
export default redditAPI
