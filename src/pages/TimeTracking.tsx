import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { TimeEntry, Case } from '@/types'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Play, Square, Clock, Plus, Trash2, ArrowLeft, Timer } from 'lucide-react'

export default function TimeTracking() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [caseId, setCaseId] = useState('')
  const [billableRate, setBillableRate] = useState(1000)
  const [isBillable, setIsBillable] = useState(true)
  const [todayTotal, setTodayTotal] = useState(0)
  const [showManual, setShowManual] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - new Date(startTime!).getTime())
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, startTime])

  async function loadData() {
    const [casesData, timeEntries] = await Promise.all([
      db.getCases(),
      db.getTodaysTimeEntries(),
    ])
    setCases(casesData)
    setEntries(timeEntries)
    setTodayTotal(timeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0))
  }

  function formatElapsed(ms: number) {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function formatDuration(minutes: number | null) {
    if (!minutes) return '—'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  async function startTimer() {
    const now = new Date().toISOString()
    setStartTime(now)
    setRunning(true)
    setElapsed(0)
  }

  async function stopTimer() {
    if (!startTime) return
    const endTime = new Date().toISOString()
    const durationMs = Date.now() - new Date(startTime).getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    const today = new Date().toISOString().split('T')[0]

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      case_id: caseId || null,
      description: description || 'Unnamed time entry',
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      billable_rate: isBillable ? billableRate : null,
      is_billable: isBillable,
      date: today,
    }

    await db.createTimeEntry(entry)
    setRunning(false)
    setStartTime(null)
    setElapsed(0)
    setDescription('')
    loadData()
  }

  async function saveManual() {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const startTime = `${today}T00:00:00.000Z`

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      case_id: caseId || null,
      description: description || 'Manual entry',
      start_time: startTime,
      end_time: startTime,
      duration_minutes: billableRate > 0 ? 0 : null,
      billable_rate: isBillable ? billableRate : null,
      is_billable: isBillable,
      date: today,
    }

    await db.createTimeEntry(entry)
    setDescription('')
    setShowManual(false)
    loadData()
  }

  async function deleteEntry(id: string) {
    await db.deleteTimeEntry(id)
    loadData()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Time Tracking</h1>
        <p className="text-sm text-slate-500">
          Today: <span className="font-semibold text-blue-600">{formatDuration(todayTotal)}</span>
        </p>
      </div>

      <Card className={running ? 'border-blue-400 ring-2 ring-blue-100' : ''}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {running ? (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
                <Timer className="h-10 w-10 text-red-500 animate-pulse" />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
            )}

            <div className="text-center">
              <p className="text-4xl font-mono font-bold tabular-nums text-slate-900">
                {formatElapsed(elapsed)}
              </p>
              {running && <p className="mt-1 text-sm text-red-500">Recording...</p>}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3">
              <div className="flex gap-3">
                <Select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  options={[
                    { value: '', label: 'No case (General)' },
                    ...cases.map(c => ({ value: c.id, label: `${c.case_number} — ${c.title}` })),
                  ]}
                />
              </div>
              <Input
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={isBillable}
                    onChange={(e) => setIsBillable(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Billable
                </label>
                {isBillable && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Rs</span>
                    <input
                      type="number"
                      value={billableRate}
                      onChange={(e) => setBillableRate(Number(e.target.value))}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-slate-500">/hr</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {running ? (
                <Button onClick={stopTimer} variant="danger">
                  <Square size={16} className="mr-1" /> Stop
                </Button>
              ) : (
                <>
                  <Button onClick={startTimer}>
                    <Play size={16} className="mr-1" /> Start
                  </Button>
                  <Button variant="outline" onClick={() => setShowManual(!showManual)}>
                    <Plus size={16} className="mr-1" /> Manual
                  </Button>
                </>
              )}
            </div>
          </div>

          {showManual && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Manual Time Entry</h3>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={billableRate > 0 ? billableRate : ''}
                    onChange={(e) => setBillableRate(Number(e.target.value))}
                  />
                  <Button onClick={saveManual} size="sm">Save</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No time entries for today. Start the timer above.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{entry.description}</p>
                    <p className="text-xs text-slate-500">
                      {entry.is_billable && entry.billable_rate
                        ? `Billable · Rs ${entry.billable_rate}/hr`
                        : 'Non-billable'}
                      {entry.case_id && cases.find(c => c.id === entry.case_id) && (
                        <> · {cases.find(c => c.id === entry.case_id)!.case_number}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-slate-700">
                      {formatDuration(entry.duration_minutes)}
                    </span>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatDuration(todayTotal)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
