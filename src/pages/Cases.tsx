import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Briefcase, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { DIVISIONS } from '@/types'
import type { Case } from '@/types'

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([])

  useEffect(() => {
    db.getCases().then(setCases)
  }, [])
  const [search, setSearch] = useState('')
  const [divisionFilter, setDivisionFilter] = useState('')

  const filtered = cases.filter(
    (c) =>
      (!divisionFilter || c.division === divisionFilter) &&
      (c.case_number.toLowerCase().includes(search.toLowerCase()) ||
       c.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
        <a href="/cases/new">
          <Button>
            <Plus size={16} className="mr-1" /> New Case
          </Button>
        </a>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search by case number or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          options={[
            { value: '', label: 'All divisions' },
            ...DIVISIONS.map((d) => ({ value: d, label: d })),
          ]}
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              {search ? 'No cases match your search' : 'No cases yet'}
            </p>
            <a href="/cases/new" className="mt-3">
              <Button variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Add First Case
              </Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <a key={c.id} href={`/cases/${c.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.case_number}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">{c.title}</p>
                    </div>
                    <Badge
                      variant={
                        c.status === 'Active'
                          ? 'success'
                          : c.status === 'Decided'
                            ? 'info'
                            : c.status === 'Disposed'
                              ? 'default'
                              : 'warning'
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-4 text-xs text-slate-500">
                    {c.case_type && <span>{c.case_type}</span>}
                    {c.division && <span>{c.division}</span>}
                    {c.filing_date && <span>Filed: {formatDate(c.filing_date)}</span>}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
