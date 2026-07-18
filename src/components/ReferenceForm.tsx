import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'
import { REFERENCE_TYPES } from '@/types'
import type { LegalReference } from '@/types'

interface ReferenceFormProps {
  open: boolean
  onClose: () => void
  onSave: (ref: LegalReference) => void
  editRef?: LegalReference | null
}

export function ReferenceForm({ open, onClose, onSave, editRef }: ReferenceFormProps) {
  const [title, setTitle] = useState(editRef?.title || '')
  const [referenceType, setReferenceType] = useState(editRef?.reference_type || 'Act')
  const [jurisdiction, setJurisdiction] = useState(editRef?.jurisdiction || '')
  const [year, setYear] = useState(editRef?.year?.toString() || '')
  const [description, setDescription] = useState(editRef?.description || '')
  const [contentText, setContentText] = useState(editRef?.content_text || '')
  const [tagsInput, setTagsInput] = useState(editRef?.tags?.join(', ') || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSave({
      id: editRef?.id || generateId(),
      title: title.trim(),
      reference_type: referenceType as LegalReference['reference_type'],
      jurisdiction: jurisdiction || null,
      year: year ? parseInt(year) : null,
      description: description || null,
      content_text: contentText || null,
      tags: tags.length > 0 ? tags : null,
    })
    handleReset()
    onClose()
  }

  function handleReset() {
    setTitle('')
    setReferenceType('Act')
    setJurisdiction('')
    setYear('')
    setDescription('')
    setContentText('')
    setTagsInput('')
  }

  return (
    <Modal open={open} onClose={onClose} title={editRef ? 'Edit Reference' : 'Add Reference'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Name of statute, act, or regulation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={REFERENCE_TYPES.map(t => ({ value: t, label: t }))}
            value={referenceType}
            onChange={(e) => setReferenceType(e.target.value)}
          />
          <Input
            label="Year"
            type="number"
            placeholder="e.g., 1973"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <Input
          label="Jurisdiction"
          placeholder="e.g., Pakistan, Punjab, Federal"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this reference"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Content Text</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Paste or type key sections, provisions, or full text..."
          />
        </div>
        <Input
          label="Tags (comma-separated)"
          placeholder="e.g., criminal, procedure, evidence"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => { handleReset(); onClose() }}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">{editRef ? 'Save' : 'Add'}</Button>
        </div>
      </form>
    </Modal>
  )
}
