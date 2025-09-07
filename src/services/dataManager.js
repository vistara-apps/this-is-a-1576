// Data management system for Reddit Pulse
// Handles data persistence, caching, and state management

import redditAPI from './api.js'

class DataManager {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = new Map()
    this.defaultCacheDuration = 5 * 60 * 1000 // 5 minutes
  }

  // User Management
  createUser(userData) {
    const user = {
      userId: this.generateId(),
      email: userData.email,
      subscriptionTier: userData.subscriptionTier || 'free',
      monitoringPreferences: userData.monitoringPreferences || {
        maxSubreddits: 5,
        alertFrequency: 'realtime',
        emailNotifications: true
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    this.saveData('user', user)
    return user
  }

  getUser(userId) {
    return this.loadData('user') || null
  }

  updateUser(userId, updates) {
    const user = this.getUser(userId)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      lastActive: new Date().toISOString()
    }

    this.saveData('user', updatedUser)
    return updatedUser
  }

  // Subreddit Monitor Management
  createSubredditMonitor(monitorData) {
    const monitor = {
      monitorId: this.generateId(),
      userId: monitorData.userId,
      subredditName: monitorData.subredditName.toLowerCase(),
      keywords: Array.isArray(monitorData.keywords) ? monitorData.keywords : [monitorData.keywords],
      alertFrequency: monitorData.alertFrequency || 'realtime',
      lastChecked: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      settings: {
        includeComments: monitorData.includeComments || false,
        minScore: monitorData.minScore || 0,
        excludeAuthors: monitorData.excludeAuthors || []
      }
    }

    const monitors = this.getSubredditMonitors() || []
    monitors.push(monitor)
    this.saveData('subreddit_monitors', monitors)
    
    return monitor
  }

  getSubredditMonitors(userId = null) {
    const monitors = this.loadData('subreddit_monitors') || []
    return userId ? monitors.filter(m => m.userId === userId) : monitors
  }

  updateSubredditMonitor(monitorId, updates) {
    const monitors = this.getSubredditMonitors()
    const index = monitors.findIndex(m => m.monitorId === monitorId)
    
    if (index === -1) return null

    monitors[index] = {
      ...monitors[index],
      ...updates,
      lastChecked: new Date().toISOString()
    }

    this.saveData('subreddit_monitors', monitors)
    return monitors[index]
  }

  deleteSubredditMonitor(monitorId) {
    const monitors = this.getSubredditMonitors()
    const filteredMonitors = monitors.filter(m => m.monitorId !== monitorId)
    
    this.saveData('subreddit_monitors', filteredMonitors)
    return filteredMonitors.length < monitors.length
  }

  // Export Query Management
  createExportQuery(queryData) {
    const query = {
      queryId: this.generateId(),
      userId: queryData.userId,
      subredditName: queryData.subredditName,
      keywords: queryData.keywords || [],
      startDate: queryData.startDate,
      endDate: queryData.endDate,
      exportFormat: queryData.exportFormat || 'csv',
      status: 'pending',
      createdAt: new Date().toISOString(),
      filters: {
        minScore: queryData.minScore || 0,
        maxResults: queryData.maxResults || 1000,
        includeComments: queryData.includeComments || false,
        sortBy: queryData.sortBy || 'created',
        sortOrder: queryData.sortOrder || 'desc'
      }
    }

    const queries = this.getExportQueries() || []
    queries.push(query)
    this.saveData('export_queries', queries)
    
    return query
  }

  getExportQueries(userId = null) {
    const queries = this.loadData('export_queries') || []
    return userId ? queries.filter(q => q.userId === userId) : queries
  }

  updateExportQuery(queryId, updates) {
    const queries = this.getExportQueries()
    const index = queries.findIndex(q => q.queryId === queryId)
    
    if (index === -1) return null

    queries[index] = {
      ...queries[index],
      ...updates
    }

    this.saveData('export_queries', queries)
    return queries[index]
  }

  // Sentiment Analysis Management
  createSentimentAnalysis(analysisData) {
    const analysis = {
      analysisId: this.generateId(),
      queryId: analysisData.queryId,
      topic: analysisData.topic,
      sentimentScore: analysisData.sentimentScore,
      timestamp: new Date().toISOString(),
      details: {
        totalPosts: analysisData.totalPosts || 0,
        positiveCount: analysisData.positiveCount || 0,
        negativeCount: analysisData.negativeCount || 0,
        neutralCount: analysisData.neutralCount || 0,
        averageConfidence: analysisData.averageConfidence || 0,
        method: analysisData.method || 'simple'
      },
      subreddits: analysisData.subreddits || []
    }

    const analyses = this.getSentimentAnalyses() || []
    analyses.push(analysis)
    this.saveData('sentiment_analyses', analyses)
    
    return analysis
  }

  getSentimentAnalyses(queryId = null) {
    const analyses = this.loadData('sentiment_analyses') || []
    return queryId ? analyses.filter(a => a.queryId === queryId) : analyses
  }

  // Trend Insight Management
  createTrendInsight(insightData) {
    const insight = {
      insightId: this.generateId(),
      topic: insightData.topic,
      trendScore: insightData.trendScore,
      detectionTimestamp: new Date().toISOString(),
      relevantSubreddits: insightData.relevantSubreddits || [],
      details: {
        totalMentions: insightData.totalMentions || 0,
        dailyCounts: insightData.dailyCounts || [],
        isRising: insightData.isRising || false,
        momentum: insightData.momentum || 0,
        timeWindow: insightData.timeWindow || 7,
        confidence: insightData.confidence || 0.5
      },
      relatedKeywords: insightData.relatedKeywords || []
    }

    const insights = this.getTrendInsights() || []
    insights.push(insight)
    this.saveData('trend_insights', insights)
    
    return insight
  }

  getTrendInsights(limit = null) {
    const insights = this.loadData('trend_insights') || []
    const sortedInsights = insights.sort((a, b) => 
      new Date(b.detectionTimestamp) - new Date(a.detectionTimestamp)
    )
    
    return limit ? sortedInsights.slice(0, limit) : sortedInsights
  }

  // Alert Management
  createAlert(alertData) {
    const alert = {
      alertId: this.generateId(),
      monitorId: alertData.monitorId,
      type: alertData.type, // 'newPost', 'newComment', 'trendAlert'
      title: alertData.title,
      message: alertData.message,
      subreddit: alertData.subreddit,
      postId: alertData.postId,
      url: alertData.url,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: alertData.priority || 'normal', // 'low', 'normal', 'high'
      metadata: alertData.metadata || {}
    }

    const alerts = this.getAlerts() || []
    alerts.unshift(alert) // Add to beginning for chronological order
    
    // Keep only last 100 alerts to prevent storage bloat
    if (alerts.length > 100) {
      alerts.splice(100)
    }
    
    this.saveData('alerts', alerts)
    return alert
  }

  getAlerts(limit = null, unreadOnly = false) {
    const alerts = this.loadData('alerts') || []
    let filteredAlerts = alerts

    if (unreadOnly) {
      filteredAlerts = alerts.filter(a => !a.isRead)
    }

    return limit ? filteredAlerts.slice(0, limit) : filteredAlerts
  }

  markAlertAsRead(alertId) {
    const alerts = this.getAlerts()
    const alert = alerts.find(a => a.alertId === alertId)
    
    if (alert) {
      alert.isRead = true
      this.saveData('alerts', alerts)
      return alert
    }
    
    return null
  }

  markAllAlertsAsRead() {
    const alerts = this.getAlerts()
    alerts.forEach(alert => alert.isRead = true)
    this.saveData('alerts', alerts)
    return alerts
  }

  // Data Processing and Analysis
  async processMonitoringData(monitor) {
    try {
      const cacheKey = `monitor_${monitor.monitorId}_${Date.now()}`
      
      // Check if we have recent data
      if (this.isCacheValid(cacheKey)) {
        return this.getFromCache(cacheKey)
      }

      // Fetch new data from Reddit
      const posts = await redditAPI.getSubredditPosts(monitor.subredditName, {
        limit: 50,
        sort: 'new'
      })

      // Filter posts based on keywords
      const matchingPosts = posts.filter(post => {
        const text = `${post.title} ${post.content}`.toLowerCase()
        return monitor.keywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        )
      })

      // Apply additional filters
      const filteredPosts = matchingPosts.filter(post => {
        if (post.score < monitor.settings.minScore) return false
        if (monitor.settings.excludeAuthors.includes(post.author)) return false
        return true
      })

      // Cache the results
      this.setCache(cacheKey, filteredPosts)

      // Update monitor last checked time
      this.updateSubredditMonitor(monitor.monitorId, {
        lastChecked: new Date().toISOString()
      })

      return filteredPosts
    } catch (error) {
      console.error('Error processing monitoring data:', error)
      throw error
    }
  }

  async processExportQuery(query) {
    try {
      this.updateExportQuery(query.queryId, { status: 'processing' })

      let allPosts = []
      
      // Fetch posts based on query parameters
      if (query.keywords.length > 0) {
        // Search for specific keywords
        for (const keyword of query.keywords) {
          const posts = await redditAPI.searchRedditPosts(
            query.subredditName, 
            keyword,
            {
              limit: Math.ceil(query.filters.maxResults / query.keywords.length),
              sort: query.filters.sortBy,
              time: this.getTimeFilter(query.startDate, query.endDate)
            }
          )
          allPosts.push(...posts)
        }
      } else {
        // Get all posts from subreddit
        const posts = await redditAPI.getSubredditPosts(query.subredditName, {
          limit: query.filters.maxResults,
          sort: query.filters.sortBy
        })
        allPosts = posts
      }

      // Filter by date range
      const filteredPosts = allPosts.filter(post => {
        const postDate = new Date(post.created)
        const startDate = new Date(query.startDate)
        const endDate = new Date(query.endDate)
        return postDate >= startDate && postDate <= endDate
      })

      // Apply additional filters
      const finalPosts = filteredPosts
        .filter(post => post.score >= query.filters.minScore)
        .slice(0, query.filters.maxResults)

      // Include comments if requested
      if (query.filters.includeComments) {
        for (const post of finalPosts) {
          try {
            const comments = await redditAPI.getPostComments(
              post.subreddit, 
              post.id,
              { limit: 50 }
            )
            post.comments = comments
          } catch (error) {
            console.warn(`Failed to fetch comments for post ${post.id}:`, error)
            post.comments = []
          }
        }
      }

      // Export data
      const exportData = await redditAPI.exportData(finalPosts, query.exportFormat)
      
      this.updateExportQuery(query.queryId, { 
        status: 'completed',
        resultCount: finalPosts.length,
        completedAt: new Date().toISOString()
      })

      return {
        data: exportData,
        posts: finalPosts,
        query: query
      }
    } catch (error) {
      this.updateExportQuery(query.queryId, { 
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString()
      })
      throw error
    }
  }

  // Utility Methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getTimeFilter(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) return 'day'
    if (diffDays <= 7) return 'week'
    if (diffDays <= 30) return 'month'
    if (diffDays <= 365) return 'year'
    return 'all'
  }

  // Cache Management
  setCache(key, data, duration = this.defaultCacheDuration) {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + duration)
  }

  getFromCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)
    }
    return null
  }

  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key)
    return expiry && Date.now() < expiry
  }

  clearCache() {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Data Persistence
  saveData(key, data) {
    redditAPI.saveToLocalStorage(key, data)
  }

  loadData(key) {
    return redditAPI.loadFromLocalStorage(key)
  }

  removeData(key) {
    redditAPI.removeFromLocalStorage(key)
  }

  // Data Validation
  validateMonitorData(data) {
    const errors = []
    
    if (!data.subredditName || typeof data.subredditName !== 'string') {
      errors.push('Subreddit name is required and must be a string')
    }
    
    if (!data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
      errors.push('Keywords are required and must be a non-empty array')
    }
    
    return errors
  }

  validateExportQuery(data) {
    const errors = []
    
    if (!data.subredditName || typeof data.subredditName !== 'string') {
      errors.push('Subreddit name is required')
    }
    
    if (!data.startDate || !data.endDate) {
      errors.push('Start date and end date are required')
    }
    
    if (new Date(data.startDate) > new Date(data.endDate)) {
      errors.push('Start date must be before end date')
    }
    
    return errors
  }

  // Statistics and Analytics
  getMonitoringStats() {
    const monitors = this.getSubredditMonitors()
    const alerts = this.getAlerts()
    const analyses = this.getSentimentAnalyses()
    const insights = this.getTrendInsights()
    
    return {
      totalMonitors: monitors.length,
      activeMonitors: monitors.filter(m => m.isActive).length,
      totalAlerts: alerts.length,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
      totalAnalyses: analyses.length,
      totalInsights: insights.length,
      lastActivity: Math.max(
        ...monitors.map(m => new Date(m.lastChecked).getTime()),
        ...alerts.map(a => new Date(a.timestamp).getTime())
      )
    }
  }
}

export const dataManager = new DataManager()
export default dataManager
