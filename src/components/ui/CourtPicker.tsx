import { useState, useEffect, useRef } from 'react'
import { Search, Building2 } from 'lucide-react'
import { getPakistaniCourts } from '@/lib/court-data'
import type { Court } from '@/types'

interface CourtPickerProps {
  value: string
  onChange: (courtId: string) => void
  error?: string
}

const allCourts = getPakistaniCourts()

function getCourtLabel(court: Court): string {
  return court.city ? `${court.name}, ${court.city}` : court.name
}

export function CourtPicker({ value, onChange, error }: CourtPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const filtered = allCourts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.province?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const selectedCourt = allCourts.find((c) => c.id === value)

  return (
    <div className="space-y-1" ref={ref}>
      <label className="block text-sm font-medium text-slate-700">
        Court
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedCourt ? (
            <span className="text-slate-900">
              {getCourtLabel(selectedCourt)}
            </span>
          ) : (
            <span className="text-slate-400">Select court...</span>
          )}
          <Building2 size={16} className="shrink-0 text-slate-400" />
        </button>

        {open && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1">
                <Search size={14} className="text-slate-400" />
                <input
                  className="w-full text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search courts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No courts found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"
                  onClick={() => {
                    onChange(c.id)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div>
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.city ? `${c.city}, ${c.province}` : c.province || c.type}
                    </p>
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
