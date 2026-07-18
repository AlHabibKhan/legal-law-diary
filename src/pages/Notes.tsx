import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { NoteEditor } from '@/components/NoteEditor'
import { StickyNote, Plus, Pin, Trash2, Edit3, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { NOTE_CATEGORIES } from '@/types'
import type { PersonalNote, Case } from '@/types'

export default function Notes() {
  const [notes, setNotes] = useState<PersonalNote[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [n, c] = await Promise.all([
      db.getPersonalNotes(),
      db.getCases(),
    ])
    setNotes(n)
    setCases(c)
  }

  const filtered = notes.filter((note) => {
    const matchCategory = !categoryFilter || note.category === categoryFilter
    const q = search.toLowerCase()
    const matchSearch = !search ||
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      (note.tags && note.tags.some((t) => t.toLowerCase().includes(q)))
    return matchCategory && matchSearch
  })

  function openNew() {
    setEditingNote(null)
    setShowEditor(true)
  }

  function openEdit(note: PersonalNote) {
    setEditingNote(note)
    setShowEditor(true)
  }

  async function handleSave(note: PersonalNote) {
    if (editingNote) {
      await db.updatePersonalNote({ ...note, updated_at: new Date().toISOString() })
    } else {
      await db.createPersonalNote({ ...note, created_at: new Date().toISOString() })
    }
    await loadData()
  }

  async function togglePin(note: PersonalNote) {
    await db.updatePersonalNote({ ...note, pinned: !note.pinned, updated_at: new Date().toISOString() })
    await loadData()
  }

  async function handleDelete(id: string) {
    await db.deletePersonalNote(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Personal Notes</h1>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-1" /> New Note
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          options={[
            { value: '', label: 'All categories' },
            ...NOTE_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-44"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <StickyNote className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              {search || categoryFilter ? 'No notes match your filters' : 'No notes yet'}
            </p>
            {!search && !categoryFilter && (
              <Button variant="outline" size="sm" className="mt-3" onClick={openNew}>
                <Plus size={14} className="mr-1" /> Create First Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <Card
              key={note.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${note.pinned ? 'border-amber-300 bg-amber-50/30' : ''}`}
              onClick={() => openEdit(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {note.pinned && <Pin size={14} className="shrink-0 text-amber-500" />}
                      <h3 className="truncate text-sm font-semibold text-slate-900">{note.title}</h3>
                    </div>
                    {note.category && (
                      <Badge variant="default" className="mt-1">{note.category}</Badge>
                    )}
                  </div>
                </div>
                {note.content && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {note.content}
                  </p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{note.updated_at ? formatDate(note.updated_at) : ''}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(note) }}
                      className={`rounded p-1 ${note.pinned ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
      )}

      <NoteEditor
        open={showEditor}
        onClose={() => { setShowEditor(false); setEditingNote(null) }}
        onSave={handleSave}
        editNote={editingNote}
        cases={cases}
      />
    </div>
  )
}
