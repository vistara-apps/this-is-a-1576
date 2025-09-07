import React, { useState } from 'react'
import { Download, Calendar, Filter, FileText } from 'lucide-react'
import MetricCard from './MetricCard'
import ExportButton from './ExportButton'
import { mockRedditData } from '../data/mockData'

const DataExport = () => {
  const [filters, setFilters] = useState({
    subreddit: '',
    keywords: '',
    startDate: '',
    endDate: '',
    author: '',
    minScore: ''
  })

  const [filteredData, setFilteredData] = useState(mockRedditData)

  const applyFilters = () => {
    let filtered = mockRedditData

    if (filters.subreddit) {
      filtered = filtered.filter(post => 
        post.subreddit.toLowerCase().includes(filters.subreddit.toLowerCase())
      )
    }

    if (filters.keywords) {
      const keywords = filters.keywords.split(',').map(k => k.trim().toLowerCase())
      filtered = filtered.filter(post =>
        keywords.some(keyword =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword)
        )
      )
    }

    if (filters.startDate) {
      filtered = filtered.filter(post => 
        new Date(post.created_date) >= new Date(filters.startDate)
      )
    }

    if (filters.endDate) {
      filtered = filtered.filter(post => 
        new Date(post.created_date) <= new Date(filters.endDate)
      )
    }

    if (filters.author) {
      filtered = filtered.filter(post => 
        post.author.toLowerCase().includes(filters.author.toLowerCase())
      )
    }

    if (filters.minScore) {
      filtered = filtered.filter(post => 
        post.score >= parseInt(filters.minScore)
      )
    }

    setFilteredData(filtered)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  React.useEffect(() => {
    applyFilters()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading text-text-primary">Data Export</h1>
        <p className="mt-1 text-body text-text-secondary">
          Search, filter, and export Reddit data for analysis
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Posts Available"
          value={mockRedditData.length}
          icon={<FileText className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          title="Filtered Results"
          value={filteredData.length}
          icon={<Filter className="w-5 h-5" />}
          variant={filteredData.length > 0 ? "trendingUp" : "default"}
        />
        <MetricCard
          title="Ready for Export"
          value={filteredData.length}
          icon={<Download className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface p-6 rounded-lg shadow-card">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-text-secondary mr-2" />
          <h3 className="text-lg font-semibold text-text-primary">Search Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-caption text-text-primary mb-2">Subreddit</label>
            <input
              type="text"
              placeholder="e.g., technology"
              value={filters.subreddit}
              onChange={(e) => handleFilterChange('subreddit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-primary mb-2">Keywords</label>
            <input
              type="text"
              placeholder="keyword1, keyword2"
              value={filters.keywords}
              onChange={(e) => handleFilterChange('keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-primary mb-2">Author</label>
            <input
              type="text"
              placeholder="username"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-primary mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-primary mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-primary mb-2">Min Score</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-surface p-6 rounded-lg shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Export Options</h3>
          <div className="flex space-x-2">
            <ExportButton 
              variant="csv" 
              data={filteredData}
              filename={`reddit-export-${new Date().toISOString().split('T')[0]}`}
            />
            <ExportButton 
              variant="json" 
              data={filteredData}
              filename={`reddit-export-${new Date().toISOString().split('T')[0]}`}
            />
          </div>
        </div>
        
        <p className="text-text-secondary">
          Export {filteredData.length} posts and comments matching your criteria
        </p>
      </div>

      {/* Preview */}
      <div className="bg-surface rounded-lg shadow-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary">Data Preview</h3>
          <p className="text-text-secondary">Showing {Math.min(5, filteredData.length)} of {filteredData.length} results</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Subreddit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.slice(0, 5).map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-text-primary">
                    r/{post.subreddit}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    u/{post.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {post.score}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(post.created_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-secondary">No data matches your current filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataExport