import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CaseSelector } from '@/components/ui/CaseSelector'
import { CourtPicker } from '@/components/ui/CourtPicker'
import { db } from '@/lib/db'
import { generateId, getTodayDate } from '@/lib/utils'
import { DIVISIONS } from '@/types'

export default function NewEntry() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    case_id: '',
    case_number: '',
    date: getTodayDate(),
    court_id: '',
    division: '',
    purpose: 'Hearing',
    description: '',
    status: 'Scheduled',
    remarks: '',
    reminder_minutes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.case_id) e.case_id = 'Please select a case'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    db.createDiaryEntry({
      id: generateId(),
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">New Diary Entry</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CaseSelector
              value={form.case_id}
              onChange={(caseId, caseNumber) =>
                setForm((prev) => ({ ...prev, case_id: caseId, case_number: caseNumber }))
              }
              error={errors.case_id}
            />

            <Input
              id="date"
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              error={errors.date}
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
                className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the purpose or any notes for this entry..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Remarks
              </label>
              <textarea
                className="flex min-h-[60px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional remarks..."
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
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
                Create Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
