// Authentication and subscription management service
// Handles user authentication, subscription tiers, and access control

import { dataManager } from './dataManager.js'

class AuthService {
  constructor() {
    this.currentUser = null
    this.subscriptionTiers = {
      free: {
        name: 'Free',
        maxSubreddits: 5,
        maxKeywords: 10,
        maxExportsPerDay: 3,
        maxResultsPerExport: 100,
        sentimentAnalysis: false,
        trendAnalysis: false,
        realTimeAlerts: false,
        apiAccess: false,
        price: 0
      },
      pro: {
        name: 'Pro',
        maxSubreddits: 25,
        maxKeywords: 50,
        maxExportsPerDay: 20,
        maxResultsPerExport: 5000,
        sentimentAnalysis: true,
        trendAnalysis: true,
        realTimeAlerts: true,
        apiAccess: false,
        price: 29
      },
      business: {
        name: 'Business',
        maxSubreddits: 100,
        maxKeywords: 200,
        maxExportsPerDay: 100,
        maxResultsPerExport: 25000,
        sentimentAnalysis: true,
        trendAnalysis: true,
        realTimeAlerts: true,
        apiAccess: true,
        teamAccess: true,
        customIntegrations: true,
        price: 99
      }
    }
    
    // Load user from localStorage on initialization
    this.loadUserFromStorage()
  }

  // User Authentication
  async signUp(userData) {
    try {
      // Validate user data
      const validationErrors = this.validateUserData(userData)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Check if user already exists
      const existingUser = this.getUserByEmail(userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Create new user
      const user = dataManager.createUser({
        email: userData.email,
        name: userData.name,
        subscriptionTier: userData.subscriptionTier || 'free',
        monitoringPreferences: {
          maxSubreddits: this.subscriptionTiers[userData.subscriptionTier || 'free'].maxSubreddits,
          alertFrequency: 'realtime',
          emailNotifications: true,
          slackIntegration: false,
          webhookUrl: ''
        }
      })

      // Set as current user
      this.currentUser = user
      this.saveUserToStorage(user)

      return {
        success: true,
        user,
        message: 'Account created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async signIn(email, password) {
    try {
      // In a real app, this would validate against a backend
      // For demo purposes, we'll simulate authentication
      const user = this.getUserByEmail(email)
      
      if (!user) {
        throw new Error('User not found')
      }

      // Update last active
      const updatedUser = dataManager.updateUser(user.userId, {
        lastActive: new Date().toISOString()
      })

      this.currentUser = updatedUser
      this.saveUserToStorage(updatedUser)

      return {
        success: true,
        user: updatedUser,
        message: 'Signed in successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  signOut() {
    this.currentUser = null
    localStorage.removeItem('reddit_pulse_user')
    return {
      success: true,
      message: 'Signed out successfully'
    }
  }

  // Demo sign in for development
  signInAsDemo() {
    const demoUser = {
      userId: 'demo-user',
      email: 'demo@redditpulse.com',
      name: 'Demo User',
      subscriptionTier: 'pro',
      monitoringPreferences: {
        maxSubreddits: 25,
        alertFrequency: 'realtime',
        emailNotifications: true,
        slackIntegration: false,
        webhookUrl: ''
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    this.currentUser = demoUser
    this.saveUserToStorage(demoUser)
    
    return {
      success: true,
      user: demoUser,
      message: 'Signed in as demo user'
    }
  }

  // Subscription Management
  getSubscriptionTier(tierName) {
    return this.subscriptionTiers[tierName] || this.subscriptionTiers.free
  }

  getCurrentUserTier() {
    if (!this.currentUser) return this.subscriptionTiers.free
    return this.getSubscriptionTier(this.currentUser.subscriptionTier)
  }

  async upgradeSubscription(newTier) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    if (!this.subscriptionTiers[newTier]) {
      throw new Error('Invalid subscription tier')
    }

    try {
      // In a real app, this would process payment
      const updatedUser = dataManager.updateUser(this.currentUser.userId, {
        subscriptionTier: newTier,
        monitoringPreferences: {
          ...this.currentUser.monitoringPreferences,
          maxSubreddits: this.subscriptionTiers[newTier].maxSubreddits
        }
      })

      this.currentUser = updatedUser
      this.saveUserToStorage(updatedUser)

      return {
        success: true,
        user: updatedUser,
        message: `Upgraded to ${this.subscriptionTiers[newTier].name} plan`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Access Control
  canCreateMonitor() {
    if (!this.currentUser) return false
    
    const currentMonitors = dataManager.getSubredditMonitors(this.currentUser.userId)
    const tier = this.getCurrentUserTier()
    
    return currentMonitors.length < tier.maxSubreddits
  }

  canExportData() {
    if (!this.currentUser) return false
    
    const tier = this.getCurrentUserTier()
    const today = new Date().toISOString().split('T')[0]
    const todayExports = dataManager.getExportQueries(this.currentUser.userId)
      .filter(query => query.createdAt.startsWith(today))
    
    return todayExports.length < tier.maxExportsPerDay
  }

  canUseSentimentAnalysis() {
    const tier = this.getCurrentUserTier()
    return tier.sentimentAnalysis
  }

  canUseTrendAnalysis() {
    const tier = this.getCurrentUserTier()
    return tier.trendAnalysis
  }

  canUseRealTimeAlerts() {
    const tier = this.getCurrentUserTier()
    return tier.realTimeAlerts
  }

  canUseApiAccess() {
    const tier = this.getCurrentUserTier()
    return tier.apiAccess
  }

  getMaxResultsPerExport() {
    const tier = this.getCurrentUserTier()
    return tier.maxResultsPerExport
  }

  // Usage Statistics
  getUsageStats() {
    if (!this.currentUser) return null

    const monitors = dataManager.getSubredditMonitors(this.currentUser.userId)
    const queries = dataManager.getExportQueries(this.currentUser.userId)
    const today = new Date().toISOString().split('T')[0]
    const todayExports = queries.filter(query => query.createdAt.startsWith(today))
    const tier = this.getCurrentUserTier()

    return {
      monitors: {
        current: monitors.length,
        max: tier.maxSubreddits,
        percentage: Math.round((monitors.length / tier.maxSubreddits) * 100)
      },
      exports: {
        today: todayExports.length,
        max: tier.maxExportsPerDay,
        percentage: Math.round((todayExports.length / tier.maxExportsPerDay) * 100)
      },
      features: {
        sentimentAnalysis: tier.sentimentAnalysis,
        trendAnalysis: tier.trendAnalysis,
        realTimeAlerts: tier.realTimeAlerts,
        apiAccess: tier.apiAccess
      }
    }
  }

  // User Management
  getCurrentUser() {
    return this.currentUser
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  getUserByEmail(email) {
    // In a real app, this would query a database
    // For demo purposes, we'll check localStorage
    const user = dataManager.getUser()
    return user && user.email === email ? user : null
  }

  async updateUserProfile(updates) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const updatedUser = dataManager.updateUser(this.currentUser.userId, updates)
      this.currentUser = updatedUser
      this.saveUserToStorage(updatedUser)

      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Validation
  validateUserData(userData) {
    const errors = []

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required')
    }

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long')
    }

    if (userData.subscriptionTier && !this.subscriptionTiers[userData.subscriptionTier]) {
      errors.push('Invalid subscription tier')
    }

    return errors
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Storage Management
  saveUserToStorage(user) {
    try {
      localStorage.setItem('reddit_pulse_user', JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save user to storage:', error)
    }
  }

  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('reddit_pulse_user')
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      localStorage.removeItem('reddit_pulse_user')
    }
  }

  // Subscription Helpers
  getSubscriptionOptions() {
    return Object.entries(this.subscriptionTiers).map(([key, tier]) => ({
      id: key,
      ...tier,
      isCurrentTier: this.currentUser?.subscriptionTier === key,
      canUpgrade: this.currentUser && this.canUpgradeToTier(key)
    }))
  }

  canUpgradeToTier(tierName) {
    if (!this.currentUser) return false
    
    const currentTier = this.currentUser.subscriptionTier
    const tierOrder = ['free', 'pro', 'business']
    
    return tierOrder.indexOf(tierName) > tierOrder.indexOf(currentTier)
  }

  // Feature Flags
  hasFeature(featureName) {
    const tier = this.getCurrentUserTier()
    return tier[featureName] === true
  }

  // Demo Data Setup
  setupDemoData() {
    if (!this.currentUser) return

    // Create some demo monitors
    const demoMonitors = [
      {
        userId: this.currentUser.userId,
        subredditName: 'technology',
        keywords: ['AI', 'artificial intelligence', 'machine learning'],
        alertFrequency: 'realtime'
      },
      {
        userId: this.currentUser.userId,
        subredditName: 'startups',
        keywords: ['funding', 'venture capital', 'IPO'],
        alertFrequency: 'daily'
      }
    ]

    demoMonitors.forEach(monitor => {
      dataManager.createSubredditMonitor(monitor)
    })

    // Create some demo export queries
    const demoQuery = {
      userId: this.currentUser.userId,
      subredditName: 'technology',
      keywords: ['AI'],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      exportFormat: 'csv',
      minScore: 10,
      maxResults: 100
    }

    dataManager.createExportQuery(demoQuery)
  }
}

export const authService = new AuthService()
export default authService
