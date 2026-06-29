import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Clock, Trash2 } from 'lucide-react'
import { formatDate, generateId, getTodayDate } from '@/lib/utils'
import type { Proceeding } from '@/types'

interface ProceedingListProps {
  caseId: string
  proceedings: Proceeding[]
  onAdd: (p: Proceeding) => void
  onDelete: (id: string) => void
}

export function ProceedingList({ caseId, proceedings, onAdd, onDelete }: ProceedingListProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    date: getTodayDate(),
    proceeding_type: 'Hearing',
    order_summary: '',
    next_date: '',
    remarks: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: generateId(),
      case_id: caseId,
      ...form,
      order_summary: form.order_summary || null,
      next_date: form.next_date || null,
      remarks: form.remarks || null,
    })
    setForm({ date: getTodayDate(), proceeding_type: 'Hearing', order_summary: '', next_date: '', remarks: '' })
    setShowModal(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">
          Proceedings ({proceedings.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" /> Add Proceeding
        </Button>
      </div>

      {proceedings.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Clock className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No proceedings recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proceedings.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-slate-100 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {formatDate(p.date)}
                    </span>
                    <Badge variant="info">{p.proceeding_type || 'Hearing'}</Badge>
                  </div>
                  {p.order_summary && (
                    <p className="text-sm text-slate-700">{p.order_summary}</p>
                  )}
                  {p.next_date && (
                    <p className="text-xs text-blue-600">
                      Next: {formatDate(p.next_date)}
                    </p>
                  )}
                  {p.remarks && (
                    <p className="text-xs text-slate-400">{p.remarks}</p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Proceeding">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="proc_date"
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
          />
          <Select
            id="proc_type"
            label="Proceeding Type"
            options={[
              { value: 'Hearing', label: 'Hearing' },
              { value: 'Cross Examination', label: 'Cross Examination' },
              { value: 'Arguments', label: 'Arguments' },
              { value: 'Judgment', label: 'Judgment' },
              { value: 'Bail Hearing', label: 'Bail Hearing' },
              { value: 'Case Management', label: 'Case Management' },
              { value: 'Mediation', label: 'Mediation' },
              { value: 'Order', label: 'Order' },
              { value: 'Other', label: 'Other' },
            ]}
            value={form.proceeding_type}
            onChange={(e) => setForm((p) => ({ ...p, proceeding_type: e.target.value }))}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Order Summary</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.order_summary}
              onChange={(e) => setForm((p) => ({ ...p, order_summary: e.target.value }))}
            />
          </div>
          <Input
            id="next_date"
            label="Next Date (optional)"
            type="date"
            value={form.next_date}
            onChange={(e) => setForm((p) => ({ ...p, next_date: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
