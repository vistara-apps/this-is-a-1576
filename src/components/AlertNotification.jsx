import React from 'react'
import { MessageCircle, FileText, TrendingUp, ExternalLink } from 'lucide-react'

const AlertNotification = ({ alert }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'newPost':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'newComment':
        return <MessageCircle className="w-5 h-5 text-green-500" />
      case 'trendAlert':
        return <TrendingUp className="w-5 h-5 text-orange-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getTitle = () => {
    switch (alert.type) {
      case 'newPost':
        return `${alert.count} new posts found`
      case 'newComment':
        return `${alert.count} new comments found`
      case 'trendAlert':
        return 'Trending topic detected'
      default:
        return 'New activity'
    }
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              {getTitle()}
            </p>
            <p className="text-xs text-text-secondary">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            in r/{alert.subreddit}
          </p>
          <button className="inline-flex items-center text-xs text-primary hover:text-primary/80 mt-2">
            View on Reddit
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertNotification