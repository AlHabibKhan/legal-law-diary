import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CaseSelector } from '@/components/ui/CaseSelector'
import { CourtPicker } from '@/components/ui/CourtPicker'
import { db } from '@/lib/db'
import { DIVISIONS } from '@/types'
import type { DiaryEntry } from '@/types'

export default function EditEntry() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    case_id: '',
    date: '',
    court_id: '',
    division: '',
    purpose: 'Hearing',
    description: '',
    status: 'Scheduled',
    remarks: '',
    reminder_minutes: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntry()
  }, [id])

  async function loadEntry() {
    const all = await db.getDiaryEntries()
    const entry = all.find((e) => e.id === id)
    if (entry) {
      setForm({
        case_id: entry.case_id,
        date: entry.date,
        court_id: entry.court_id || '',
        division: entry.division || '',
        purpose: entry.purpose || 'Hearing',
        description: entry.description || '',
        status: entry.status,
        remarks: entry.remarks || '',
        reminder_minutes: entry.reminder_minutes ? String(entry.reminder_minutes) : '',
      })
    }
    setLoading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    db.updateDiaryEntry({
      id: id!,
      case_id: form.case_id,
      date: form.date,
      court_id: form.court_id || null,
      division: form.division || null,
      judge_id: null,
      purpose: form.purpose,
      description: form.description || null,
      status: form.status,
      remarks: form.remarks || null,
      reminder_minutes: form.reminder_minutes ? Number(form.reminder_minutes) : null,
      reminder_sent: false,
    })
    navigate('/diary')
  }

  async function handleDelete() {
    if (!window.confirm('Delete this diary entry?')) return
    await db.deleteDiaryEntry(id!)
    navigate('/diary')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Diary Entry</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CaseSelector
              value={form.case_id}
              onChange={(caseId) =>
                setForm((prev) => ({ ...prev, case_id: caseId }))
              }
            />

            <Input
              id="date"
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />

            <Select
              id="purpose"
              label="Purpose"
              options={[
                { value: 'Hearing', label: 'Hearing' },
                { value: 'Filing', label: 'Filing' },
                { value: 'Cross Examination', label: 'Cross Examination' },
                { value: 'Arguments', label: 'Arguments' },
                { value: 'Judgment', label: 'Judgment' },
                { value: 'Bail Hearing', label: 'Bail Hearing' },
                { value: 'Case Management', label: 'Case Management' },
                { value: 'Mediation', label: 'Mediation' },
                { value: 'Other', label: 'Other' },
              ]}
              value={form.purpose}
              onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
            />

            <CourtPicker
              value={form.court_id}
              onChange={(courtId) => setForm((prev) => ({ ...prev, court_id: courtId }))}
            />

            <Select
              id="division"
              label="Division"
              options={[
                { value: '', label: 'Not specified' },
                ...DIVISIONS.map((d) => ({ value: d, label: d })),
              ]}
              value={form.division}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, division: e.target.value }))
              }
            />

            <Select
              id="status"
              label="Status"
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Adjourned', label: 'Adjourned' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Rescheduled', label: 'Rescheduled' },
              ]}
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            />

            <Select
              id="reminder"
              label="Set Reminder"
              options={[
                { value: '', label: 'No Reminder' },
                { value: '15', label: '15 minutes before' },
                { value: '30', label: '30 minutes before' },
                { value: '60', label: '1 hour before' },
                { value: '120', label: '2 hours before' },
                { value: '1440', label: '1 day before' },
              ]}
              value={form.reminder_minutes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reminder_minutes: e.target.value }))
              }
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Description / Notes
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/diary')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Delete Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
