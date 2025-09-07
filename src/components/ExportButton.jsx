import React from 'react'
import { Download, FileText } from 'lucide-react'

const ExportButton = ({ variant, data, filename }) => {
  const exportData = () => {
    let content = ''
    let mimeType = ''
    let fileExtension = ''

    if (variant === 'csv') {
      // Convert to CSV
      const headers = ['Subreddit', 'Title', 'Author', 'Score', 'Created Date', 'Content']
      const csvRows = [headers.join(',')]
      
      data.forEach(item => {
        const row = [
          item.subreddit,
          `"${item.title.replace(/"/g, '""')}"`,
          item.author,
          item.score,
          item.created_date,
          `"${item.content.replace(/"/g, '""')}"`
        ]
        csvRows.push(row.join(','))
      })
      
      content = csvRows.join('\n')
      mimeType = 'text/csv'
      fileExtension = 'csv'
    } else if (variant === 'json') {
      content = JSON.stringify(data, null, 2)
      mimeType = 'application/json'
      fileExtension = 'json'
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportData}
      disabled={data.length === 0}
      className={`
        inline-flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-sm
        ${variant === 'csv' 
          ? 'bg-accent text-white hover:bg-accent/90' 
          : 'bg-primary text-white hover:bg-primary/90'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {variant === 'csv' ? (
        <FileText className="w-4 h-4 mr-2" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      Export {variant.toUpperCase()}
    </button>
  )
}

export default ExportButton