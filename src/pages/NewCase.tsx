import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CASE_STATUSES, DIVISIONS } from '@/types'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'

export default function NewCase() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    case_number: '',
    title: '',
    case_type: 'Civil',
    court_id: '',
    division: '',
    filing_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    description: '',
    remarks: '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await db.createCase({
      id: generateId(),
      case_number: form.case_number,
      title: form.title,
      case_type: form.case_type,
      court_id: form.court_id || null,
      division: form.division || null,
      judge_id: null,
      filing_date: form.filing_date || null,
      status: form.status,
      description: form.description || null,
      remarks: form.remarks || null,
    } as any)
    navigate('/cases')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">New Case</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="case_number"
              label="Case Number"
              placeholder="e.g., 123/2024"
              value={form.case_number}
              onChange={(e) => updateField('case_number', e.target.value)}
              required
            />

            <Input
              id="title"
              label="Case Title"
              placeholder="e.g., State vs. Muhammad Ali"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />

            <Select
              id="case_type"
              label="Case Type"
              options={[
                { value: 'Civil', label: 'Civil' },
                { value: 'Criminal', label: 'Criminal' },
                { value: 'Family', label: 'Family' },
                { value: 'Constitutional', label: 'Constitutional' },
                { value: 'Tax', label: 'Tax' },
                { value: 'Service', label: 'Service' },
                { value: 'Anti-Terrorism', label: 'Anti-Terrorism' },
                { value: 'Banking', label: 'Banking' },
                { value: 'Customs', label: 'Customs' },
                { value: 'Labour', label: 'Labour' },
                { value: 'Other', label: 'Other' },
              ]}
              value={form.case_type}
              onChange={(e) => updateField('case_type', e.target.value)}
            />

            <Select
              id="status"
              label="Status"
              options={CASE_STATUSES.map((s) => ({ value: s, label: s }))}
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            />

            <Input
              id="filing_date"
              label="Filing Date"
              type="date"
              value={form.filing_date}
              onChange={(e) => updateField('filing_date', e.target.value)}
            />

            <Input
              id="court_id"
              label="Court"
              placeholder="Select or search court"
              value={form.court_id}
              onChange={(e) => updateField('court_id', e.target.value)}
            />

            <Select
              id="division"
              label="Division"
              options={[
                { value: '', label: 'Not specified' },
                ...DIVISIONS.map((d) => ({ value: d, label: d })),
              ]}
              value={form.division}
              onChange={(e) => updateField('division', e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the case"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Remarks
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional remarks"
                value={form.remarks}
                onChange={(e) => updateField('remarks', e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/cases')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Case
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
