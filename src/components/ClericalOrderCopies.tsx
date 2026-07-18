import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Trash2, Copy } from 'lucide-react'
import { formatDate, generateId, getTodayDate } from '@/lib/utils'
import { ORDER_COPY_STATUSES } from '@/types'
import type { OrderCopyRequest } from '@/types'

interface ClericalOrderCopiesProps {
  caseId: string
  orderCopies: OrderCopyRequest[]
  onAdd: (o: OrderCopyRequest) => void
  onUpdate: (o: OrderCopyRequest) => void
  onDelete: (id: string) => void
}

export function ClericalOrderCopies({ caseId, orderCopies, onAdd, onUpdate, onDelete }: ClericalOrderCopiesProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    order_date: getTodayDate(),
    order_summary: '',
    applied_date: getTodayDate(),
    status: 'Draft' as OrderCopyRequest['status'],
    court_fee: '',
    estimated_cost: '',
    received_date: '',
    remarks: '',
  })

  function resetForm() {
    setForm({
      order_date: getTodayDate(),
      order_summary: '',
      applied_date: getTodayDate(),
      status: 'Draft',
      court_fee: '',
      estimated_cost: '',
      received_date: '',
      remarks: '',
    })
    setEditingId(null)
  }

  function openEdit(o: OrderCopyRequest) {
    setForm({
      order_date: o.order_date,
      order_summary: o.order_summary || '',
      applied_date: o.applied_date,
      status: o.status,
      court_fee: o.court_fee?.toString() || '',
      estimated_cost: o.estimated_cost?.toString() || '',
      received_date: o.received_date || '',
      remarks: o.remarks || '',
    })
    setEditingId(o.id)
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.order_date) return

    const data: OrderCopyRequest = {
      id: editingId || generateId(),
      case_id: caseId,
      order_date: form.order_date,
      order_summary: form.order_summary || null,
      applied_date: form.applied_date,
      status: form.status,
      court_fee: form.court_fee ? Number(form.court_fee) : null,
      estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      received_date: form.received_date || null,
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
    Applied: 'info',
    Processing: 'warning',
    Ready: 'info',
    Received: 'success',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">
          Order Copy Requests ({orderCopies.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={14} className="mr-1" /> Add Request
        </Button>
      </div>

      {orderCopies.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Copy className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No order copy requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderCopies.map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[o.status] || 'default'}>{o.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    Order: {formatDate(o.order_date)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Applied: {formatDate(o.applied_date)}</span>
                    {o.received_date && <span>Received: {formatDate(o.received_date)}</span>}
                  </div>
                  {o.order_summary && <p className="text-sm text-slate-700">{o.order_summary}</p>}
                  {(o.court_fee || o.estimated_cost) && (
                    <p className="text-xs text-slate-500">
                      {o.court_fee ? `Fee: PKR ${o.court_fee.toLocaleString()}` : ''}
                      {o.court_fee && o.estimated_cost ? ' | ' : ''}
                      {o.estimated_cost ? `Est. Cost: PKR ${o.estimated_cost.toLocaleString()}` : ''}
                    </p>
                  )}
                  {o.remarks && <p className="text-xs text-slate-400">{o.remarks}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(o)}
                    className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(o.id)}
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

      <Modal open={showModal} onClose={() => { resetForm(); setShowModal(false) }} title={editingId ? 'Edit Order Copy Request' : 'Add Order Copy Request'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Order Date"
            type="date"
            value={form.order_date}
            onChange={(e) => setForm(f => ({ ...f, order_date: e.target.value }))}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Order Summary (optional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.order_summary}
              onChange={(e) => setForm(f => ({ ...f, order_summary: e.target.value }))}
            />
          </div>
          <Input
            label="Applied Date"
            type="date"
            value={form.applied_date}
            onChange={(e) => setForm(f => ({ ...f, applied_date: e.target.value }))}
            required
          />
          <Select
            label="Status"
            options={ORDER_COPY_STATUSES.map(s => ({ value: s, label: s }))}
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value as OrderCopyRequest['status'] }))}
          />
          <Input
            label="Court Fee (PKR, optional)"
            type="number"
            placeholder="e.g., 500"
            value={form.court_fee}
            onChange={(e) => setForm(f => ({ ...f, court_fee: e.target.value }))}
          />
          <Input
            label="Estimated Cost (PKR, optional)"
            type="number"
            placeholder="e.g., 2000"
            value={form.estimated_cost}
            onChange={(e) => setForm(f => ({ ...f, estimated_cost: e.target.value }))}
          />
          <Input
            label="Received Date (optional)"
            type="date"
            value={form.received_date}
            onChange={(e) => setForm(f => ({ ...f, received_date: e.target.value }))}
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
