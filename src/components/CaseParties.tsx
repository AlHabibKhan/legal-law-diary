import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Trash2 } from 'lucide-react'
import { PARTY_TYPES } from '@/types'
import { generateId } from '@/lib/utils'
import type { CaseParty } from '@/types'

interface CasePartiesProps {
  caseId: string
  parties: CaseParty[]
  onAdd: (p: CaseParty) => void
  onRemove: (id: string) => void
}

export function CaseParties({ caseId, parties, onAdd, onRemove }: CasePartiesProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    party_type: 'Petitioner',
    party_name: '',
    client_id: '',
  })

  const grouped = PARTY_TYPES.map((type) => ({
    type,
    parties: parties.filter((p) => p.party_type === type),
  })).filter((g) => g.parties.length > 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.party_name.trim()) return
    onAdd({
      id: generateId(),
      case_id: caseId,
      party_type: form.party_type,
      party_name: form.party_name,
      client_id: form.client_id || null,
      is_client: !!form.client_id,
    })
    setForm({ party_type: 'Petitioner', party_name: '', client_id: '' })
    setShowModal(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">
          Parties ({parties.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" /> Add Party
        </Button>
      </div>

      {parties.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Users className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No parties added</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((g) => (
            <div key={g.type}>
              <p className="mb-1 text-xs font-medium text-slate-400 uppercase">
                {g.type}
              </p>
              {g.parties.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900">{p.party_name}</span>
                    {p.is_client && <Badge variant="success">Client</Badge>}
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Party">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="party_type"
            label="Party Type"
            options={PARTY_TYPES.map((t) => ({ value: t, label: t }))}
            value={form.party_type}
            onChange={(e) => setForm((p) => ({ ...p, party_type: e.target.value }))}
          />
          <Input
            id="party_name"
            label="Party Name"
            placeholder="Name of the party"
            value={form.party_name}
            onChange={(e) => setForm((p) => ({ ...p, party_name: e.target.value }))}
            required
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
