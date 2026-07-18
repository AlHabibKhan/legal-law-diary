import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Trash2, Gavel } from 'lucide-react'
import { formatDate, generateId, getTodayDate } from '@/lib/utils'
import { SUMMONS_TYPES, CLERICAL_STATUSES } from '@/types'
import type { Summons } from '@/types'

interface ClericalSummonsProps {
  caseId: string
  summons: Summons[]
  onAdd: (s: Summons) => void
  onUpdate: (s: Summons) => void
  onDelete: (id: string) => void
}

export function ClericalSummons({ caseId, summons, onAdd, onUpdate, onDelete }: ClericalSummonsProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    summons_type: 'Witness' as Summons['summons_type'],
    issued_to: '',
    issued_date: getTodayDate(),
    return_date: '',
    hearing_date: '',
    status: 'Draft' as Summons['status'],
    remarks: '',
  })

  function resetForm() {
    setForm({
      summons_type: 'Witness',
      issued_to: '',
      issued_date: getTodayDate(),
      return_date: '',
      hearing_date: '',
      status: 'Draft',
      remarks: '',
    })
    setEditingId(null)
  }

  function openEdit(s: Summons) {
    setForm({
      summons_type: s.summons_type,
      issued_to: s.issued_to,
      issued_date: s.issued_date,
      return_date: s.return_date || '',
      hearing_date: s.hearing_date || '',
      status: s.status,
      remarks: s.remarks || '',
    })
    setEditingId(s.id)
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.issued_to.trim()) return

    const data: Summons = {
      id: editingId || generateId(),
      case_id: caseId,
      ...form,
      return_date: form.return_date || null,
      hearing_date: form.hearing_date || null,
      remarks: form.remarks || null,
    }

    if (editingId) {
      onUpdate(data)
    } else {
      onAdd(data)
    }
    resetForm()
    setShowModal(false)
  }

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    Draft: 'default',
    Issued: 'info',
    Served: 'warning',
    Returned: 'danger',
    Complied: 'success',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">
          Summons ({summons.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={14} className="mr-1" /> Add Summons
        </Button>
      </div>

      {summons.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Gavel className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No summons issued</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summons.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{s.summons_type}</Badge>
                    <Badge variant={statusVariant[s.status] || 'default'}>{s.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{s.issued_to}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Issued: {formatDate(s.issued_date)}</span>
                    {s.return_date && <span>Return: {formatDate(s.return_date)}</span>}
                    {s.hearing_date && <span>Hearing: {formatDate(s.hearing_date)}</span>}
                  </div>
                  {s.remarks && <p className="text-xs text-slate-400">{s.remarks}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { resetForm(); setShowModal(false) }} title={editingId ? 'Edit Summons' : 'Add Summons'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Summons Type"
            options={SUMMONS_TYPES.map(t => ({ value: t, label: t }))}
            value={form.summons_type}
            onChange={(e) => setForm(f => ({ ...f, summons_type: e.target.value as Summons['summons_type'] }))}
          />
          <Input
            label="Issued To"
            placeholder="Name of person"
            value={form.issued_to}
            onChange={(e) => setForm(f => ({ ...f, issued_to: e.target.value }))}
            required
          />
          <Input
            label="Issued Date"
            type="date"
            value={form.issued_date}
            onChange={(e) => setForm(f => ({ ...f, issued_date: e.target.value }))}
            required
          />
          <Input
            label="Return Date (optional)"
            type="date"
            value={form.return_date}
            onChange={(e) => setForm(f => ({ ...f, return_date: e.target.value }))}
          />
          <Input
            label="Hearing Date (optional)"
            type="date"
            value={form.hearing_date}
            onChange={(e) => setForm(f => ({ ...f, hearing_date: e.target.value }))}
          />
          <Select
            label="Status"
            options={CLERICAL_STATUSES.map(s => ({ value: s, label: s }))}
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Summons['status'] }))}
          />
          <Input
            label="Remarks (optional)"
            placeholder="Additional notes"
            value={form.remarks}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { resetForm(); setShowModal(false) }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
