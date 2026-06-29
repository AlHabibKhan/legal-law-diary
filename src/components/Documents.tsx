import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Trash2, Download } from 'lucide-react'
import { generateId } from '@/lib/utils'
import type { Document } from '@/types'

interface DocumentsProps {
  caseId: string
  documents: Document[]
  onAdd: (d: Document) => void
  onDelete: (id: string) => void
}

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export function Documents({ caseId, documents, onAdd, onDelete }: DocumentsProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    doc_type: '',
    notes: '',
  })

  function handleFileSelect() {
    // In Tauri: use dialog plugin to open file picker
    // const file = await open({ multiple: false })
    // if (file) {
    //   const path = file as string
    //   const name = path.split('\\').pop() || path.split('/').pop() || 'file'
    //   const ext = name.split('.').pop()?.toLowerCase() || ''
    //   setForm({ name, doc_type: ext, notes: '' })
    // }
    const ext = 'pdf'
    setForm({ name: `document.${ext}`, doc_type: ext, notes: '' })
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    const ext = form.doc_type.toLowerCase()
    onAdd({
      id: generateId(),
      case_id: caseId,
      name: form.name,
      type: form.doc_type || null,
      file_path: `documents/${caseId}/${form.name}`,
      file_size: 0,
      mime_type: MIME_TYPES[ext] || 'application/octet-stream',
      notes: form.notes || null,
    })
    setForm({ name: '', doc_type: '', notes: '' })
    setShowModal(false)
  }

  function getFileIcon(doc: Document) {
    const type = (doc.type || '').toLowerCase()
    if (['jpg', 'jpeg', 'png'].includes(type)) return '🖼️'
    if (['pdf'].includes(type)) return '📄'
    if (['doc', 'docx'].includes(type)) return '📝'
    return '📎'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">
          Documents ({documents.length})
        </h3>
        <Button size="sm" variant="outline" onClick={handleFileSelect}>
          <Plus size={14} className="mr-1" /> Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <FileText className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No documents attached</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getFileIcon(doc)}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {doc.type && <Badge variant="default">{doc.type.toUpperCase()}</Badge>}
                    {doc.file_size ? (
                      <span>{Math.round(doc.file_size / 1024)} KB</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  title="Download"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="doc_name"
            label="File Name"
            value={form.name}
            onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <Input
            id="doc_type"
            label="File Type"
            placeholder="e.g., pdf, docx, jpg"
            value={form.doc_type}
            onChange={(e) => setForm((d) => ({ ...d, doc_type: e.target.value }))}
          />
          <Input
            id="doc_notes"
            label="Notes (optional)"
            placeholder="Description of this document"
            value={form.notes}
            onChange={(e) => setForm((d) => ({ ...d, notes: e.target.value }))}
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
