import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { Task, Case } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Plus, CheckCircle2, Circle, AlertCircle, Clock, Trash2 } from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-amber-600 bg-amber-50 border-amber-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  low: 'text-slate-600 bg-slate-50 border-slate-200',
}

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [caseId, setCaseId] = useState('')

  useEffect(() => {
    loadData()
  }, [filter])

  async function loadData() {
    const [casesData, tasksData] = await Promise.all([
      db.getCases(),
      db.getTasks(filter === 'all' ? undefined : filter),
    ])
    setCases(casesData)
    setTasks(tasksData)
  }

  async function addTask() {
    if (!title.trim()) return
    const task: Task = {
      id: crypto.randomUUID(),
      case_id: caseId || null,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      status: 'pending',
      assigned_to: null,
    }
    await db.createTask(task)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setCaseId('')
    setShowAdd(false)
    loadData()
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await db.updateTask({ ...task, status: newStatus })
    loadData()
  }

  async function updateStatus(task: Task, status: Task['status']) {
    await db.updateTask({ ...task, status })
    loadData()
  }

  async function deleteTask(id: string) {
    await db.deleteTask(id)
    loadData()
  }

  function getFilteredTasks() {
    let filtered = [...tasks]
    filtered.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99))
    return filtered
  }

  const filtered = getFilteredTasks()
  const pendingCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">
            {pendingCount} pending · {tasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-1" /> Add Task
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'in_progress', 'completed'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showAdd && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <Select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  options={[
                    { value: '', label: 'No case' },
                    ...cases.map(c => ({ value: c.id, label: `${c.case_number} — ${c.title}` })),
                  ]}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addTask} size="sm">Save</Button>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                task.status === 'completed' ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <button
                onClick={() => toggleStatus(task)}
                className="mt-0.5 shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 hover:text-blue-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className={`mt-0.5 text-xs ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {task.description}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {task.due_date}
                    </span>
                  )}
                  {task.case_id && cases.find(c => c.id === task.case_id) && (
                    <span>{cases.find(c => c.id === task.case_id)!.case_number}</span>
                  )}
                  {task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task, e.target.value as Task['status'])}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
