import React, { useState } from 'react'
import { Plus, X, AlertCircle, ExternalLink } from 'lucide-react'
import MetricCard from './MetricCard'
import SubredditInput from './SubredditInput'
import KeywordInput from './KeywordInput'
import AlertNotification from './AlertNotification'

const SubredditMonitoring = ({ monitoredSubreddits, onAddMonitor, onRemoveMonitor, alerts }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [subreddit, setSubreddit] = useState('')
  const [keywords, setKeywords] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (subreddit && keywords.length > 0) {
      onAddMonitor(subreddit, keywords)
      setSubreddit('')
      setKeywords([])
      setShowAddForm(false)
    }
  }

  const totalPosts = monitoredSubreddits.reduce((acc, monitor) => acc + Math.floor(Math.random() * 50) + 10, 0)
  const totalAlerts = alerts.length
  const activeMonitors = monitoredSubreddits.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading text-text-primary">Subreddit Monitoring</h1>
          <p className="mt-1 text-body text-text-secondary">
            Monitor specific subreddits and get real-time alerts for relevant discussions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white text-caption rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Monitor
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Active Monitors"
          value={activeMonitors}
          icon={<AlertCircle className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          title="Total Posts Found"
          value={totalPosts}
          icon={<ExternalLink className="w-5 h-5" />}
          variant="trendingUp"
        />
        <MetricCard
          title="Recent Alerts"
          value={totalAlerts}
          icon={<AlertCircle className="w-5 h-5" />}
          variant={totalAlerts > 0 ? "trendingUp" : "default"}
        />
      </div>

      {/* Add Monitor Form */}
      {showAddForm && (
        <div className="bg-surface p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Add New Monitor</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <SubredditInput
              value={subreddit}
              onChange={setSubreddit}
              placeholder="Enter subreddit name (e.g., technology)"
            />
            
            <KeywordInput
              keywords={keywords}
              onChange={setKeywords}
              placeholder="Add keywords to monitor"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!subreddit || keywords.length === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Monitor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Monitors */}
      {monitoredSubreddits.length > 0 && (
        <div className="bg-surface rounded-lg shadow-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-text-primary">Active Monitors</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {monitoredSubreddits.map((monitor) => (
              <div key={monitor.monitorId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-text-primary">r/{monitor.subredditName}</span>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {monitor.keywords.map((keyword, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-text-secondary px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">
                      Last checked: {new Date(monitor.lastChecked).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveMonitor(monitor.monitorId)}
                    className="ml-4 p-1 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-surface rounded-lg shadow-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-text-primary">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map((alert) => (
              <AlertNotification key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {monitoredSubreddits.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-text-secondary" />
          <h3 className="mt-4 text-lg font-medium text-text-primary">No monitors set up yet</h3>
          <p className="mt-2 text-text-secondary">
            Get started by adding your first subreddit monitor to track relevant discussions.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Monitor
          </button>
        </div>
      )}
    </div>
  )
}

export default SubredditMonitoring