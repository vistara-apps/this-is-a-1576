import React from 'react'
import { Monitor, Download, BarChart3, TrendingUp, Bell, Menu, X } from 'lucide-react'
import { cn } from '../utils/cn'

const DashboardLayout = ({ children, activeTab, setActiveTab, alerts }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navigation = [
    { id: 'monitoring', name: 'Monitoring', icon: Monitor },
    { id: 'export', name: 'Data Export', icon: Download },
    { id: 'sentiment', name: 'Sentiment Analysis', icon: BarChart3 },
    { id: 'trends', name: 'Trend Identification', icon: TrendingUp },
  ]

  const activeAlerts = alerts.filter(alert => {
    const alertTime = new Date(alert.timestamp)
    const now = new Date()
    return (now - alertTime) < 24 * 60 * 60 * 1000 // Last 24 hours
  })

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-card transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-heading text-text-primary">Reddit Pulse</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Subscription info */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-caption text-text-primary">Free Tier</span>
                <span className="text-xs bg-accent text-white px-2 py-1 rounded">Upgrade</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                2/5 subreddits monitored
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            {/* Alerts */}
            <div className="relative">
              <button className="relative p-2 rounded-md hover:bg-gray-100">
                <Bell className="w-5 h-5 text-text-secondary" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
            </div>
            
            {/* User menu */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout