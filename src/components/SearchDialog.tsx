import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Briefcase, Users, BookOpen, Scale, X } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/lib/search'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

const iconMap: Record<string, typeof Briefcase> = {
  Briefcase,
  Users,
  BookOpen,
  Scale,
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const id = setTimeout(async () => {
      const res = await globalSearch(query)
      setResults(res)
      setSelectedIdx(0)
      setLoading(false)
    }, 200)

    return () => clearTimeout(id)
  }, [query])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose()
      navigate(result.href)
    },
    [navigate, onClose]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search cases, clients, diary entries..."
            className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && <span className="text-xs text-slate-400">Searching...</span>}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((r, i) => {
              const Icon = iconMap[r.icon] || Briefcase
              return (
                <button
                  key={`${r.type}-${i}`}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === selectedIdx
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelect(r)}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <Icon size={16} className="shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.label}</p>
                    <p className="truncate text-xs text-slate-500">{r.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase text-slate-400">
                    {r.type}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No results found for "{query}"
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">↑↓</kbd> Navigate{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">Enter</kbd> Open{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">Esc</kbd> Close
        </div>
      </div>
    </div>
  )
}
