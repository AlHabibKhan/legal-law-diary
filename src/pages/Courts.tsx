import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Building2, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { getPakistaniCourts } from '@/lib/court-data'
import type { Court } from '@/types'

const courts = getPakistaniCourts()

function getLevelLabel(level: string): string {
  switch (level) {
    case 'apex': return 'Supreme Court'
    case 'high': return 'High Court'
    case 'district': return 'District Court'
    case 'special': return 'Special Court'
    default: return level
  }
}

function getLevelBadge(level: string) {
  const variant = level === 'apex' ? 'danger' : level === 'high' ? 'info' : level === 'district' ? 'default' : 'warning'
  return <Badge variant={variant as any}>{getLevelLabel(level)}</Badge>
}

export default function Courts() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return courts
    const q = search.toLowerCase()
    return courts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city?.toLowerCase().includes(q) ?? false) ||
        (c.province?.toLowerCase().includes(q) ?? false)
    )
  }, [search])

  const topLevel = filtered.filter((c) => !c.parent_id)
  const children = filtered.filter((c) => c.parent_id)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Court Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          All courts in Pakistan — Supreme, High Courts, District Courts & Special Courts
        </p>
      </div>

      <Input
        placeholder="Search by name, city, or province..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-3">
        {topLevel.map((court) => {
          const hasChildren = children.some((c) => c.parent_id === court.id)
          const isExpanded = expanded.has(court.id)

          return (
            <Card key={court.id}>
              <CardHeader>
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => hasChildren && toggleExpand(court.id)}
                >
                  <div className="flex items-center gap-3">
                    {hasChildren && (
                      isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
                    )}
                    {!hasChildren && <div className="w-4" />}
                    <Building2 size={18} className="text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{court.name}</CardTitle>
                      {court.city && (
                        <p className="text-xs text-slate-500">
                          {court.city}, {court.province}
                        </p>
                      )}
                    </div>
                  </div>
                  {getLevelBadge(court.level)}
                </button>
              </CardHeader>

              {isExpanded && hasChildren && (
                <CardContent className="pt-0">
                  <div className="ml-7 space-y-2">
                    {children
                      .filter((c) => c.parent_id === court.id)
                      .map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {child.name}
                            </p>
                            {child.city && (
                              <p className="text-xs text-slate-400">
                                {child.city}, {child.province}
                              </p>
                            )}
                          </div>
                          {getLevelBadge(child.level)}
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {topLevel.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Search className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">
                No courts found for "{search}"
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        Showing {filtered.length} of {courts.length} courts
      </p>
    </div>
  )
}
