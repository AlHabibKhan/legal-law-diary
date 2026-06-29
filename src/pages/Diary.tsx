import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/Calendar'
import { BookOpen, Plus, Download } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { db } from '@/lib/db'
import { exportDiaryPdf } from '@/lib/pdf-export'
import type { DiaryEntry } from '@/types'

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonthEntries()
  }, [currentMonth])

  async function loadMonthEntries() {
    setLoading(true)
    const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const to = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    const data = await db.getDiaryEntriesByDateRange(from, to)
    setEntries(data)
    setLoading(false)
  }

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  const dayEntries = useMemo(
    () => entries.filter((e) => e.date === selectedDateStr),
    [entries, selectedDateStr]
  )

  const highlightedDates = useMemo(
    () => [...new Set(entries.map((e) => e.date))],
    [entries]
  )

  function goToToday() {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  function isToday(date: Date) {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  }

  async function handleExportPdf() {
    const from = format(subMonths(currentMonth, 0), 'MMM yyyy')
    await exportDiaryPdf(entries, from)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case Diary</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a date to view or add diary entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download size={14} className="mr-1" /> PDF
          </Button>
          <a href="/diary/new">
            <Button size="sm">
              <Plus size={16} className="mr-1" /> New Entry
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <Calendar
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
              onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
              currentMonth={currentMonth}
              highlightedDates={highlightedDates}
            />
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Has entries
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border border-blue-400" /> Today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {dayEntries.length} hearing{dayEntries.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-slate-400">Loading...</p>
              </div>
            ) : dayEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  No entries for this date
                </p>
                <a href="/diary/new" className="mt-2">
                  <Button variant="outline" size="sm">
                    <Plus size={14} className="mr-1" /> Add Entry
                  </Button>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <a
                    key={entry.id}
                    href={`/diary/${entry.id}/edit`}
                    className="block rounded-lg border border-slate-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          {entry.purpose || 'Hearing'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Case: {entry.case_id}
                        </p>
                        {entry.division && (
                          <p className="text-xs text-slate-400">{entry.division} Division</p>
                        )}
                        {entry.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          entry.status === 'Completed'
                            ? 'success'
                            : entry.status === 'Adjourned'
                              ? 'warning'
                              : entry.status === 'Cancelled'
                                ? 'danger'
                                : 'info'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}
