import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'
import { NOTE_CATEGORIES } from '@/types'
import type { PersonalNote, Case } from '@/types'

interface NoteEditorProps {
  open: boolean
  onClose: () => void
  onSave: (note: PersonalNote) => void
  editNote?: PersonalNote | null
  cases: Case[]
}

export function NoteEditor({ open, onClose, onSave, editNote, cases }: NoteEditorProps) {
  const [title, setTitle] = useState(editNote?.title || '')
  const [content, setContent] = useState(editNote?.content || '')
  const [category, setCategory] = useState(editNote?.category || '')
  const [caseId, setCaseId] = useState(editNote?.case_id || '')
  const [tagsInput, setTagsInput] = useState(editNote?.tags?.join(', ') || '')
  const [pinned, setPinned] = useState(editNote?.pinned || false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSave({
      id: editNote?.id || generateId(),
      title: title.trim(),
      content,
      category: category || null,
      case_id: caseId || null,
      tags: tags.length > 0 ? tags : null,
      pinned,
    })
    handleReset()
    onClose()
  }

  function handleReset() {
    setTitle('')
    setContent('')
    setCategory('')
    setCaseId('')
    setTagsInput('')
    setPinned(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={editNote ? 'Edit Note' : 'New Note'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Content</label>
          <textarea
            className="flex min-h-[150px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            options={[
              { value: '', label: 'None' },
              ...NOTE_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            label="Link to Case (optional)"
            options={[
              { value: '', label: 'No case' },
              ...cases.map((c) => ({ value: c.id, label: `${c.case_number} - ${c.title}` })),
            ]}
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
          />
        </div>
        <Input
          label="Tags (comma-separated)"
          placeholder="e.g., evidence, argument, research"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Pin this note
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => { handleReset(); onClose() }}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">{editNote ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}
