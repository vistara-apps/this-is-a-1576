import React, { useState } from 'react'
import DashboardLayout from './components/DashboardLayout'
import SubredditMonitoring from './components/SubredditMonitoring'
import DataExport from './components/DataExport'
import SentimentAnalysis from './components/SentimentAnalysis'
import TrendIdentification from './components/TrendIdentification'
import { mockRedditData } from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState('monitoring')
  const [monitoredSubreddits, setMonitoredSubreddits] = useState([])
  const [alerts, setAlerts] = useState([])

  const addSubredditMonitor = (subreddit, keywords) => {
    const newMonitor = {
      monitorId: Date.now(),
      subredditName: subreddit,
      keywords: keywords,
      alertFrequency: 'realtime',
      lastChecked: new Date().toISOString()
    }
    setMonitoredSubreddits(prev => [...prev, newMonitor])
    
    // Simulate finding matching posts
    const matchingPosts = mockRedditData.filter(post => 
      post.subreddit.toLowerCase() === subreddit.toLowerCase() &&
      keywords.some(keyword => 
        post.title.toLowerCase().includes(keyword.toLowerCase()) ||
        post.content.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    
    if (matchingPosts.length > 0) {
      const newAlert = {
        id: Date.now(),
        type: 'newPost',
        subreddit,
        count: matchingPosts.length,
        timestamp: new Date().toISOString()
      }
      setAlerts(prev => [newAlert, ...prev])
    }
  }

  const removeSubredditMonitor = (monitorId) => {
    setMonitoredSubreddits(prev => prev.filter(m => m.monitorId !== monitorId))
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      alerts={alerts}
    >
      {activeTab === 'monitoring' && (
        <SubredditMonitoring 
          monitoredSubreddits={monitoredSubreddits}
          onAddMonitor={addSubredditMonitor}
          onRemoveMonitor={removeSubredditMonitor}
          alerts={alerts}
        />
      )}
      {activeTab === 'export' && <DataExport />}
      {activeTab === 'sentiment' && <SentimentAnalysis />}
      {activeTab === 'trends' && <TrendIdentification />}
    </DashboardLayout>
  )
}

export default App