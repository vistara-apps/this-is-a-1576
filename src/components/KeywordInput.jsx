import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

const KeywordInput = ({ keywords, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('')

  const addKeyword = () => {
    if (inputValue.trim() && !keywords.includes(inputValue.trim())) {
      onChange([...keywords, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeKeyword = (index) => {
    onChange(keywords.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div>
      <label className="block text-caption text-text-primary mb-2">
        Keywords
      </label>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="ml-2 hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KeywordInput