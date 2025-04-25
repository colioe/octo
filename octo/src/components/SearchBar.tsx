'use client'
import { useAppContext } from '../context/AppContext'
import { useEffect, useRef, useState } from 'react'
import { Search, Command } from 'lucide-react'

const SearchBar = () => {
  const { searchEngine, setSearchEngine } = useAppContext()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchEngines = {
    google: { url: 'https://www.google.com/search?q=', color: 'bg-blue-500' },
    bing: { url: 'https://www.bing.com/search?q=', color: 'bg-green-500' },
    duckduckgo: { url: 'https://duckduckgo.com/?q=', color: 'bg-yellow-500' }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.open(
        `${searchEngines[searchEngine as keyof typeof searchEngines].url}${encodeURIComponent(query)}`,
        '_blank'
      )
    }
  }

  // Keyboard shortcut: Cmd+K or / to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey && e.key === 'k') || e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        {/* Search Input */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            className={`w-full h-14 pl-14 pr-24 rounded-xl bg-white/5 backdrop-blur-lg border-2 transition-all duration-300 ${
              focused 
                ? 'border-blue-400/80 shadow-lg shadow-blue-500/10' 
                : 'border-white/10 hover:border-white/20'
            } text-white placeholder-white/40 outline-none text-lg`}
            placeholder="Search the web..."
          />
          
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
          
          {/* Keyboard Shortcut Hint */}
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs ${
            focused ? 'opacity-0' : 'opacity-60'
          } transition-opacity`}>
            {navigator.platform.includes('Mac') ? (
              <>
                <kbd className="flex items-center px-2 py-1 rounded bg-white/10 text-white/80">
                  <Command size={12} />
                </kbd>
                <kbd className="px-2 py-1 rounded bg-white/10 text-white/80">K</kbd>
              </>
            ) : (
              <kbd className="px-2 py-1 rounded bg-white/10 text-white/80">/</kbd>
            )}
          </div>
        </div>

        {/* Search Engine Selector */}
        <div className="absolute right-2 top-2 bottom-2 flex overflow-hidden rounded-lg">
          {Object.entries(searchEngines).map(([key, engine]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSearchEngine(key)}
              className={`px-3 flex items-center justify-center transition-all ${
                searchEngine === key 
                  ? `${engine.color} text-white` 
                  : 'bg-white/5 hover:bg-white/10 text-white/60'
              }`}
              title={`Search with ${key.charAt(0).toUpperCase() + key.slice(1)}`}
            >
              <span className="font-medium text-sm">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </form>

      {/* Suggestions Dropdown (optional) */}
      {focused && query && (
        <div className="mt-2 w-full bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-white/60">Recent searches</div>
            <button className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3">
              <Search size={16} className="text-white/40" />
              <span className="text-white">{query}</span>
              <span className="ml-auto text-xs text-white/40">Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar