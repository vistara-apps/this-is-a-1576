import React from 'react'

const SubredditInput = ({ value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-caption text-text-primary mb-2">
        Subreddit
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
          r/
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
        />
      </div>
    </div>
  )
}

export default SubredditInput