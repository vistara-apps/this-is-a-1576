import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, Download, ExternalLink } from 'lucide-react'
import { cn } from '../utils/cn'
import ExportButton from './ExportButton'

const DataTable = ({ 
  data = [], 
  columns = [], 
  variant = 'default',
  searchable = true,
  sortable = true,
  filterable = false,
  exportable = false,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick = null,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})

  // Process data with search, filter, and sort
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Apply search
    if (searchTerm && searchable) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    if (filterable) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter(row => {
            const rowValue = row[key]
            if (typeof value === 'string') {
              return rowValue && rowValue.toString().toLowerCase().includes(value.toLowerCase())
            }
            return rowValue === value
          })
        }
      })
    }

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, filters, columns, searchable, sortable, filterable])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData

  const handleSort = (key) => {
    if (!sortable) return
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const formatCellValue = (value, column) => {
    if (column.render) {
      return column.render(value)
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString()
    }

    if (column.type === 'datetime') {
      return new Date(value).toLocaleString()
    }

    if (column.type === 'number') {
      return typeof value === 'number' ? value.toLocaleString() : value
    }

    if (column.type === 'url') {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          Link <ExternalLink className="w-3 h-3" />
        </a>
      )
    }

    if (column.type === 'badge') {
      const badgeClass = column.badgeColors?.[value] || 'bg-gray-100 text-gray-800'
      return (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badgeClass)}>
          {value}
        </span>
      )
    }

    return value
  }

  const getRowClassName = (row, index) => {
    let baseClass = 'border-b border-gray-200 transition-colors duration-150'
    
    if (variant === 'hover') {
      baseClass += ' hover:bg-gray-50'
    }
    
    if (variant === 'striped' && index % 2 === 1) {
      baseClass += ' bg-gray-50'
    }
    
    if (onRowClick) {
      baseClass += ' cursor-pointer hover:bg-blue-50'
    }
    
    return baseClass
  }

  if (loading) {
    return (
      <div className={cn('bg-surface rounded-lg shadow-card overflow-hidden', className)}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-surface rounded-lg shadow-card overflow-hidden', className)}>
      {/* Header with search and controls */}
      {(searchable || exportable) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {filterable && (
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              )}
              
              {exportable && (
                <ExportButton 
                  data={processedData}
                  filename="table-data"
                  variant="csv"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider',
                    sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                  )}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={getRowClassName(row, index)}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"
                    >
                      {formatCellValue(row[column.key], column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'px-3 py-1 text-sm border rounded-md',
                      currentPage === pageNum
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
