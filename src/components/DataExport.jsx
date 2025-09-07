import React, { useState, useEffect } from 'react'
import { Download, Calendar, Filter, Search, FileText, Database, Loader, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import SubredditInput from './SubredditInput'
import KeywordInput from './KeywordInput'
import ExportButton from './ExportButton'
import DataTable from './DataTable'
import MetricCard from './MetricCard'
import { dataManager } from '../services/dataManager'
import { mockRedditData } from '../data/mockData'

const DataExport = () => {
  const [subreddit, setSubreddit] = useState('')
  const [keywords, setKeywords] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [maxResults, setMaxResults] = useState(1000)
  const [includeComments, setIncludeComments] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [filteredData, setFilteredData] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [error, setError] = useState('')
  const [exportQueries, setExportQueries] = useState([])

  useEffect(() => {
    // Load previous export queries
    const queries = dataManager.getExportQueries()
    setExportQueries(queries.slice(0, 5)) // Show last 5 queries
  }, [])

  const handleFilter = async () => {
    if (!subreddit) {
      setError('Please enter a subreddit name')
      return
    }

    setIsFiltering(true)
    setError('')
    
    try {
      // Create export query
      const queryData = {
        userId: 'demo-user', // In real app, get from auth context
        subredditName: subreddit,
        keywords,
        startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        exportFormat,
        minScore,
        maxResults,
        includeComments,
        sortBy: 'created',
        sortOrder: 'desc'
      }

      // Validate query data
      const validationErrors = dataManager.validateExportQuery(queryData)
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '))
        setIsFiltering(false)
        return
      }

      const query = dataManager.createExportQuery(queryData)
      
      // For demo purposes, use mock data with filtering
      // In production, this would call dataManager.processExportQuery(query)
      let filtered = mockRedditData
      
      // Filter by subreddit
      if (subreddit) {
        filtered = filtered.filter(post => 
          post.subreddit.toLowerCase() === subreddit.toLowerCase()
        )
      }
      
      // Filter by keywords
      if (keywords.length > 0) {
        filtered = filtered.filter(post =>
          keywords.some(keyword =>
            post.title.toLowerCase().includes(keyword.toLowerCase()) ||
            post.content.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      }
      
      // Filter by date range
      if (startDate) {
        filtered = filtered.filter(post => 
          new Date(post.created_date) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filtered = filtered.filter(post => 
          new Date(post.created_date) <= new Date(endDate)
        )
      }
      
      // Filter by minimum score
      if (minScore > 0) {
        filtered = filtered.filter(post => post.score >= minScore)
      }

      // Limit results
      filtered = filtered.slice(0, maxResults)
      
      setFilteredData(filtered)
      
      // Update query status
      dataManager.updateExportQuery(query.queryId, {
        status: 'completed',
        resultCount: filtered.length,
        completedAt: new Date().toISOString()
      })

      // Refresh queries list
      const updatedQueries = dataManager.getExportQueries()
      setExportQueries(updatedQueries.slice(0, 5))
      
    } catch (err) {
      setError('Failed to filter data: ' + err.message)
    } finally {
      setIsFiltering(false)
    }
  }

  const clearFilters = () => {
    setSubreddit('')
    setKeywords([])
    setStartDate('')
    setEndDate('')
    setMinScore(0)
    setMaxResults(1000)
    setIncludeComments(false)
    setFilteredData([])
    setError('')
  }

  const loadPreviousQuery = (query) => {
    setSubreddit(query.subredditName)
    setKeywords(query.keywords)
    setStartDate(query.startDate.split('T')[0])
    setEndDate(query.endDate.split('T')[0])
    setMinScore(query.filters.minScore)
    setMaxResults(query.filters.maxResults)
    setIncludeComments(query.filters.includeComments)
    setExportFormat(query.exportFormat)
  }

  // Table columns configuration
  const tableColumns = [
    {
      key: 'title',
      label: 'Title',
      width: '40%',
      render: (value) => (
        <div className="max-w-md">
          <p className="font-medium text-text-primary truncate">{value}</p>
        </div>
      )
    },
    {
      key: 'subreddit',
      label: 'Subreddit',
      type: 'badge',
      badgeColors: {
        'technology': 'bg-blue-100 text-blue-800',
        'programming': 'bg-green-100 text-green-800',
        'startups': 'bg-purple-100 text-purple-800',
        'cryptocurrency': 'bg-yellow-100 text-yellow-800',
        'climate': 'bg-emerald-100 text-emerald-800',
        'business': 'bg-gray-100 text-gray-800'
      }
    },
    {
      key: 'author',
      label: 'Author',
      width: '15%'
    },
    {
      key: 'score',
      label: 'Score',
      type: 'number',
      width: '10%'
    },
    {
      key: 'comments',
      label: 'Comments',
      type: 'number',
      width: '10%'
    },
    {
      key: 'created_date',
      label: 'Created',
      type: 'date',
      width: '15%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading text-text-primary">Data Export</h1>
        <p className="mt-1 text-body text-text-secondary">
          Search, filter, and export Reddit data for comprehensive analysis
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Available"
          value={mockRedditData.length}
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          title="Filtered Results"
          value={filteredData.length}
          icon={<Filter className="w-5 h-5" />}
        />
        <MetricCard
          title="Export Queries"
          value={exportQueries.length}
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          title="Ready to Export"
          value={filteredData.length > 0 ? 1 : 0}
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      {/* Filter Panel */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Search & Filter</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Subreddit *
            </label>
            <SubredditInput
              value={subreddit}
              onChange={setSubreddit}
              placeholder="e.g., technology"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Keywords
            </label>
            <KeywordInput
              keywords={keywords}
              onChange={setKeywords}
              placeholder="Add keywords..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Min Score
            </label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Max Results
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Include Comments
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFilter}
            disabled={isFiltering || !subreddit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFiltering ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isFiltering ? 'Filtering...' : 'Apply Filters'}
          </button>

          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-text-primary rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>

          {filteredData.length > 0 && (
            <ExportButton
              data={filteredData}
              filename={`reddit-export-${subreddit}-${new Date().toISOString().split('T')[0]}`}
              variant={exportFormat}
            />
          )}
        </div>
      </div>

      {/* Previous Queries */}
      {exportQueries.length > 0 && (
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Export Queries</h2>
          <div className="space-y-3">
            {exportQueries.map((query) => (
              <div
                key={query.queryId}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">r/{query.subredditName}</span>
                    {query.keywords.length > 0 && (
                      <span className="text-sm text-text-secondary">
                        • {query.keywords.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {new Date(query.createdAt).toLocaleDateString()} • {query.status} • {query.resultCount || 0} results
                  </div>
                </div>
                <button
                  onClick={() => loadPreviousQuery(query)}
                  className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-md"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      {filteredData.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Export Results ({filteredData.length} posts)
          </h2>
          <DataTable
            data={filteredData}
            columns={tableColumns}
            variant="hover"
            searchable={true}
            sortable={true}
            exportable={true}
            pagination={true}
            pageSize={20}
            onRowClick={(row) => window.open(`https://reddit.com/r/${row.subreddit}/comments/${row.id}`, '_blank')}
          />
        </div>
      )}

      {filteredData.length === 0 && !isFiltering && subreddit && (
        <div className="bg-surface rounded-lg shadow-card p-8 text-center">
          <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Results Found</h3>
          <p className="text-text-secondary">
            Try adjusting your filters or search criteria to find more posts.
          </p>
        </div>
      )}
    </div>
  )
}

export default DataExport
