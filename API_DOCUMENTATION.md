# Reddit Pulse API Documentation

## Overview

Reddit Pulse provides a comprehensive API for monitoring Reddit subreddits, analyzing sentiment, and exporting data. This documentation covers all available endpoints, data models, and integration examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Webhooks](#webhooks)
8. [SDKs](#sdks)

## Authentication

Reddit Pulse uses API key authentication for all requests.

### Getting Your API Key

1. Sign up for a Reddit Pulse account
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Include the key in all requests using the `Authorization` header

```bash
Authorization: Bearer your_api_key_here
```

### Authentication Example

```javascript
const headers = {
  'Authorization': 'Bearer your_api_key_here',
  'Content-Type': 'application/json'
}
```

## Data Models

### User

```typescript
interface User {
  userId: string
  email: string
  subscriptionTier: 'free' | 'pro' | 'business'
  monitoringPreferences: {
    maxSubreddits: number
    alertFrequency: 'realtime' | 'hourly' | 'daily'
    emailNotifications: boolean
  }
  createdAt: string
  lastActive: string
}
```

### SubredditMonitor

```typescript
interface SubredditMonitor {
  monitorId: string
  userId: string
  subredditName: string
  keywords: string[]
  alertFrequency: 'realtime' | 'hourly' | 'daily'
  lastChecked: string
  isActive: boolean
  createdAt: string
  settings: {
    includeComments: boolean
    minScore: number
    excludeAuthors: string[]
  }
}
```

### ExportQuery

```typescript
interface ExportQuery {
  queryId: string
  userId: string
  subredditName: string
  keywords: string[]
  startDate: string
  endDate: string
  exportFormat: 'csv' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  filters: {
    minScore: number
    maxResults: number
    includeComments: boolean
    sortBy: 'created' | 'score' | 'comments'
    sortOrder: 'asc' | 'desc'
  }
}
```

### SentimentAnalysis

```typescript
interface SentimentAnalysis {
  analysisId: string
  queryId: string
  topic: string
  sentimentScore: number // -1 to 1 (negative to positive)
  timestamp: string
  details: {
    totalPosts: number
    positiveCount: number
    negativeCount: number
    neutralCount: number
    averageConfidence: number
    method: 'openai' | 'simple'
  }
  subreddits: string[]
}
```

### TrendInsight

```typescript
interface TrendInsight {
  insightId: string
  topic: string
  trendScore: number
  detectionTimestamp: string
  relevantSubreddits: string[]
  details: {
    totalMentions: number
    dailyCounts: number[]
    isRising: boolean
    momentum: number
    timeWindow: number
    confidence: number
  }
  relatedKeywords: string[]
}
```

## API Endpoints

### Base URL

```
https://api.redditpulse.com/v1
```

### Monitors

#### Create Monitor

```http
POST /monitors
```

**Request Body:**
```json
{
  "subredditName": "technology",
  "keywords": ["AI", "artificial intelligence"],
  "alertFrequency": "realtime",
  "settings": {
    "includeComments": false,
    "minScore": 10,
    "excludeAuthors": ["AutoModerator"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monitorId": "mon_123456",
    "userId": "user_789",
    "subredditName": "technology",
    "keywords": ["AI", "artificial intelligence"],
    "alertFrequency": "realtime",
    "lastChecked": "2024-01-15T10:30:00Z",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "settings": {
      "includeComments": false,
      "minScore": 10,
      "excludeAuthors": ["AutoModerator"]
    }
  }
}
```

#### List Monitors

```http
GET /monitors
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "monitors": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### Get Monitor

```http
GET /monitors/{monitorId}
```

#### Update Monitor

```http
PUT /monitors/{monitorId}
```

#### Delete Monitor

```http
DELETE /monitors/{monitorId}
```

### Data Export

#### Create Export Query

```http
POST /exports
```

**Request Body:**
```json
{
  "subredditName": "technology",
  "keywords": ["AI", "machine learning"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-15",
  "exportFormat": "csv",
  "filters": {
    "minScore": 5,
    "maxResults": 1000,
    "includeComments": true,
    "sortBy": "score",
    "sortOrder": "desc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "exp_123456",
    "status": "pending",
    "estimatedTime": "2-5 minutes",
    "downloadUrl": null
  }
}
```

#### Get Export Status

```http
GET /exports/{queryId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "exp_123456",
    "status": "completed",
    "resultCount": 847,
    "downloadUrl": "https://api.redditpulse.com/v1/exports/exp_123456/download",
    "expiresAt": "2024-01-22T10:30:00Z"
  }
}
```

#### Download Export

```http
GET /exports/{queryId}/download
```

Returns the exported data file (CSV or JSON).

### Sentiment Analysis

#### Analyze Sentiment

```http
POST /sentiment/analyze
```

**Request Body:**
```json
{
  "text": "This new AI technology is absolutely amazing!",
  "method": "openai" // optional: "openai" or "simple"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 0.92,
    "score": 0.8,
    "method": "openai"
  }
}
```

#### Batch Sentiment Analysis

```http
POST /sentiment/batch
```

**Request Body:**
```json
{
  "texts": [
    "This is great!",
    "I hate this feature",
    "It's okay, nothing special"
  ],
  "method": "openai"
}
```

### Trend Analysis

#### Get Trending Topics

```http
GET /trends
```

**Query Parameters:**
- `subreddits` (optional): Comma-separated list of subreddits
- `timeWindow` (optional): Days to analyze (default: 7, max: 30)
- `minMentions` (optional): Minimum mentions required (default: 3)
- `limit` (optional): Number of trends to return (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "keyword": "ChatGPT",
        "totalMentions": 156,
        "trendScore": 2.4,
        "isRising": true,
        "momentum": 0.8,
        "relevantSubreddits": ["technology", "artificial"],
        "dailyCounts": [12, 18, 25, 31, 28, 22, 20]
      }
    ],
    "timeWindow": 7,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### User Management

#### Get User Profile

```http
GET /user/profile
```

#### Update User Profile

```http
PUT /user/profile
```

#### Get Usage Statistics

```http
GET /user/usage
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monitors": {
      "current": 8,
      "max": 25,
      "percentage": 32
    },
    "exports": {
      "today": 3,
      "max": 20,
      "percentage": 15
    },
    "features": {
      "sentimentAnalysis": true,
      "trendAnalysis": true,
      "realTimeAlerts": true,
      "apiAccess": false
    }
  }
}
```

## Rate Limiting

API requests are rate-limited based on your subscription tier:

- **Free**: 100 requests/hour
- **Pro**: 1,000 requests/hour  
- **Business**: 10,000 requests/hour

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SUBREDDIT",
    "message": "The specified subreddit does not exist",
    "details": {
      "subreddit": "nonexistentsubreddit"
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: Missing or invalid API key
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_SUBREDDIT`: Subreddit doesn't exist
- `INSUFFICIENT_PERMISSIONS`: Feature not available in current plan
- `VALIDATION_ERROR`: Invalid request parameters
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `INTERNAL_ERROR`: Server error

## Code Examples

### JavaScript/Node.js

```javascript
const RedditPulseAPI = require('reddit-pulse-sdk')

const client = new RedditPulseAPI({
  apiKey: 'your_api_key_here'
})

// Create a monitor
const monitor = await client.monitors.create({
  subredditName: 'technology',
  keywords: ['AI', 'machine learning'],
  alertFrequency: 'realtime'
})

// Export data
const exportQuery = await client.exports.create({
  subredditName: 'technology',
  keywords: ['AI'],
  startDate: '2024-01-01',
  endDate: '2024-01-15',
  exportFormat: 'csv'
})

// Check export status
const status = await client.exports.getStatus(exportQuery.queryId)

// Download when ready
if (status.status === 'completed') {
  const data = await client.exports.download(exportQuery.queryId)
}
```

### Python

```python
from reddit_pulse import RedditPulseClient

client = RedditPulseClient(api_key='your_api_key_here')

# Create a monitor
monitor = client.monitors.create(
    subreddit_name='technology',
    keywords=['AI', 'machine learning'],
    alert_frequency='realtime'
)

# Analyze sentiment
sentiment = client.sentiment.analyze(
    text="This new AI technology is amazing!",
    method='openai'
)

print(f"Sentiment: {sentiment.sentiment} (confidence: {sentiment.confidence})")
```

### cURL

```bash
# Create a monitor
curl -X POST https://api.redditpulse.com/v1/monitors \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "subredditName": "technology",
    "keywords": ["AI", "machine learning"],
    "alertFrequency": "realtime"
  }'

# Get trending topics
curl -X GET "https://api.redditpulse.com/v1/trends?subreddits=technology,artificial&timeWindow=7" \
  -H "Authorization: Bearer your_api_key_here"
```

## Webhooks

Reddit Pulse can send real-time notifications to your endpoints when events occur.

### Webhook Events

- `monitor.new_post`: New post matches monitor criteria
- `monitor.new_comment`: New comment matches monitor criteria
- `export.completed`: Data export is ready for download
- `trend.detected`: New trending topic identified

### Webhook Payload

```json
{
  "event": "monitor.new_post",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "monitorId": "mon_123456",
    "post": {
      "id": "abc123",
      "title": "New AI breakthrough announced",
      "subreddit": "technology",
      "author": "tech_enthusiast",
      "score": 245,
      "url": "https://reddit.com/r/technology/comments/abc123",
      "created": "2024-01-15T10:25:00Z"
    }
  }
}
```

### Setting Up Webhooks

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/reddit-pulse",
  "events": ["monitor.new_post", "export.completed"],
  "secret": "your_webhook_secret"
}
```

## SDKs

Official SDKs are available for:

- **JavaScript/Node.js**: `npm install reddit-pulse-sdk`
- **Python**: `pip install reddit-pulse`
- **PHP**: `composer require reddit-pulse/sdk`
- **Ruby**: `gem install reddit_pulse`
- **Go**: `go get github.com/reddit-pulse/go-sdk`

### SDK Features

- Automatic authentication
- Rate limit handling
- Retry logic
- Type definitions
- Comprehensive error handling
- Webhook verification helpers

## Support

For API support, please:

1. Check this documentation
2. Visit our [FAQ](https://redditpulse.com/faq)
3. Contact support at api@redditpulse.com
4. Join our [Discord community](https://discord.gg/redditpulse)

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Monitor management endpoints
- Data export functionality
- Sentiment analysis
- Trend detection
- Webhook support
