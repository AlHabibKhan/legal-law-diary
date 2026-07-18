import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ReferenceForm } from '@/components/ReferenceForm'
import { Library, Plus, Trash2, Edit3, BookText, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { REFERENCE_TYPES } from '@/types'
import type { LegalReference } from '@/types'

export default function LawsLibrary() {
  const [references, setReferences] = useState<LegalReference[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRef, setEditingRef] = useState<LegalReference | null>(null)
  const [selectedRef, setSelectedRef] = useState<LegalReference | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const data = await db.getLegalReferences()
    setReferences(data)
  }

  const filtered = references.filter((ref) => {
    const matchType = !typeFilter || ref.reference_type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !search ||
      ref.title.toLowerCase().includes(q) ||
      (ref.description || '').toLowerCase().includes(q) ||
      (ref.content_text || '').toLowerCase().includes(q) ||
      (ref.jurisdiction || '').toLowerCase().includes(q) ||
      (ref.tags && ref.tags.some((t) => t.toLowerCase().includes(q)))
    return matchType && matchSearch
  })

  function openNew() {
    setEditingRef(null)
    setShowForm(true)
  }

  function openEdit(ref: LegalReference) {
    setEditingRef(ref)
    setShowForm(true)
  }

  async function handleSave(ref: LegalReference) {
    if (editingRef) {
      await db.updateLegalReference({ ...ref, updated_at: new Date().toISOString() })
    } else {
      await db.createLegalReference({ ...ref, created_at: new Date().toISOString() })
    }
    await loadData()
  }

  async function handleDelete(id: string) {
    await db.deleteLegalReference(id)
    setReferences((prev) => prev.filter((r) => r.id !== id))
    if (selectedRef?.id === id) setSelectedRef(null)
  }

  const typeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    Statute: 'info',
    Act: 'success',
    Ordinance: 'warning',
    Rules: 'default',
    Regulation: 'info',
    Treaty: 'danger',
    Other: 'default',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Laws & Statutes</h1>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-1" /> Add Reference
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search statutes, acts, regulations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          options={[
            { value: '', label: 'All types' },
            ...REFERENCE_TYPES.map((t) => ({ value: t, label: t })),
          ]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Library className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              {search || typeFilter ? 'No references match your filters' : 'No references yet'}
            </p>
            {!search && !typeFilter && (
              <Button variant="outline" size="sm" className="mt-3" onClick={openNew}>
                <Plus size={14} className="mr-1" /> Add First Reference
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {filtered.map((ref) => (
              <Card
                key={ref.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  selectedRef?.id === ref.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRef(ref)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={typeVariant[ref.reference_type] || 'default'}>
                          {ref.reference_type}
                        </Badge>
                        {ref.year && (
                          <span className="text-xs text-slate-400">{ref.year}</span>
                        )}
                      </div>
                      <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {ref.title}
                      </h3>
                      {ref.jurisdiction && (
                        <p className="text-xs text-slate-500">{ref.jurisdiction}</p>
                      )}
                      {ref.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {ref.description}
                        </p>
                      )}
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ref.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(ref)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Edit"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(ref.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            {selectedRef ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookText size={18} className="text-blue-600" />
                    {selectedRef.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <Badge variant={typeVariant[selectedRef.reference_type] || 'default'}>
                        {selectedRef.reference_type}
                      </Badge>
                    </div>
                    {selectedRef.year && (
                      <div>
                        <p className="text-xs text-slate-500">Year</p>
                        <p className="font-medium text-slate-900">{selectedRef.year}</p>
                      </div>
                    )}
                    {selectedRef.jurisdiction && (
                      <div>
                        <p className="text-xs text-slate-500">Jurisdiction</p>
                        <p className="font-medium text-slate-900">{selectedRef.jurisdiction}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500">Added</p>
                      <p className="font-medium text-slate-900">
                        {selectedRef.created_at ? formatDate(selectedRef.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedRef.description && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Description</p>
                      <p className="mt-1 text-sm text-slate-700">{selectedRef.description}</p>
                    </div>
                  )}

                  {selectedRef.tags && selectedRef.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Tags</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedRef.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRef.content_text && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Content</p>
                      <pre className="mt-1 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                        {selectedRef.content_text}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <BookText className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    Select a reference to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <ReferenceForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingRef(null) }}
        onSave={handleSave}
        editRef={editingRef}
      />
    </div>
  )
}
