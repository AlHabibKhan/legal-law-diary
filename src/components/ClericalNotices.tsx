import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Trash2, FileText } from 'lucide-react'
import { formatDate, generateId, getTodayDate } from '@/lib/utils'
import { NOTICE_TYPES, CLERICAL_STATUSES } from '@/types'
import type { Notice } from '@/types'

interface ClericalNoticesProps {
  caseId: string
  notices: Notice[]
  onAdd: (n: Notice) => void
  onUpdate: (n: Notice) => void
  onDelete: (id: string) => void
}

export function ClericalNotices({ caseId, notices, onAdd, onUpdate, onDelete }: ClericalNoticesProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    notice_type: 'Legal Notice' as Notice['notice_type'],
    issued_to: '',
    issued_date: getTodayDate(),
    served_date: '',
    status: 'Draft' as Notice['status'],
    content: '',
    remarks: '',
  })

  function resetForm() {
    setForm({
      notice_type: 'Legal Notice',
      issued_to: '',
      issued_date: getTodayDate(),
      served_date: '',
      status: 'Draft',
      content: '',
      remarks: '',
    })
    setEditingId(null)
  }

  function openEdit(n: Notice) {
    setForm({
      notice_type: n.notice_type,
      issued_to: n.issued_to,
      issued_date: n.issued_date,
      served_date: n.served_date || '',
      status: n.status,
      content: n.content || '',
      remarks: n.remarks || '',
    })
    setEditingId(n.id)
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.issued_to.trim()) return

    const data: Notice = {
      id: editingId || generateId(),
      case_id: caseId,
      ...form,
      served_date: form.served_date || null,
      content: form.content || null,
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
          Notices ({notices.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={14} className="mr-1" /> Add Notice
        </Button>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <FileText className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No notices issued</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{n.notice_type}</Badge>
                    <Badge variant={statusVariant[n.status] || 'default'}>{n.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{n.issued_to}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Issued: {formatDate(n.issued_date)}</span>
                    {n.served_date && <span>Served: {formatDate(n.served_date)}</span>}
                  </div>
                  {n.content && <p className="text-sm text-slate-700">{n.content}</p>}
                  {n.remarks && <p className="text-xs text-slate-400">{n.remarks}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(n)}
                    className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(n.id)}
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

      <Modal open={showModal} onClose={() => { resetForm(); setShowModal(false) }} title={editingId ? 'Edit Notice' : 'Add Notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Notice Type"
            options={NOTICE_TYPES.map(t => ({ value: t, label: t }))}
            value={form.notice_type}
            onChange={(e) => setForm(f => ({ ...f, notice_type: e.target.value as Notice['notice_type'] }))}
          />
          <Input
            label="Issued To"
            placeholder="Name of recipient"
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
            label="Served Date (optional)"
            type="date"
            value={form.served_date}
            onChange={(e) => setForm(f => ({ ...f, served_date: e.target.value }))}
          />
          <Select
            label="Status"
            options={CLERICAL_STATUSES.map(s => ({ value: s, label: s }))}
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Notice['status'] }))}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Content (optional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>
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
