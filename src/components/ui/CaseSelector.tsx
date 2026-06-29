import { useState, useEffect, useRef } from 'react'
import { Search, Briefcase } from 'lucide-react'
import { db } from '@/lib/db'
import type { Case } from '@/types'

interface CaseSelectorProps {
  value: string
  onChange: (caseId: string, caseNumber: string) => void
  error?: string
}

export function CaseSelector({ value, onChange, error }: CaseSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cases, setCases] = useState<Case[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    db.getCases('Active').then(setCases)
  }, [])

  const filtered = cases.filter(
    (c) =>
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCase = cases.find((c) => c.id === value)

  return (
    <div className="space-y-1" ref={ref}>
      <label className="block text-sm font-medium text-slate-700">
        Case Number
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedCase ? (
            <span className="text-slate-900">
              {selectedCase.case_number} — {selectedCase.title}
            </span>
          ) : (
            <span className="text-slate-400">Select a case...</span>
          )}
          <Briefcase size={16} className="shrink-0 text-slate-400" />
        </button>

        {open && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1">
                <Search size={14} className="text-slate-400" />
                <input
                  className="w-full text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No cases found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"
                  onClick={() => {
                    onChange(c.id, c.case_number)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {c.case_number}
                    </p>
                    <p className="text-xs text-slate-500">{c.title}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
