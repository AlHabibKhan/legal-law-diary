import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ProceedingList } from '@/components/ProceedingList'
import { CaseParties } from '@/components/CaseParties'
import { Documents } from '@/components/Documents'
import { ArrowLeft, Edit2, Save, X, Loader2, Download } from 'lucide-react'
import { formatDate, generateId } from '@/lib/utils'
import { db } from '@/lib/db'
import { exportCasePdf } from '@/lib/pdf-export'
import { getPakistaniCourts } from '@/lib/court-data'
import { CASE_STATUSES, DIVISIONS } from '@/types'
import type { Case, Proceeding, CaseParty, Document } from '@/types'

type Tab = 'info' | 'parties' | 'proceedings' | 'documents'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [editing, setEditing] = useState(false)

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [proceedings, setProceedings] = useState<Proceeding[]>([])
  const [parties, setParties] = useState<CaseParty[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [editForm, setEditForm] = useState<Case | null>(null)

  useEffect(() => {
    loadAll()
  }, [id])

  async function loadAll() {
    setLoading(true)
    const c = await db.getCase(id!)
    if (c) {
      setCaseData(c)
      setEditForm({ ...c })
    }
    const [proc, prt, docs] = await Promise.all([
      db.getProceedings(id!),
      db.getCaseParties(id!),
      db.getCaseDocuments(id!),
    ])
    setProceedings(proc)
    setParties(prt)
    setDocuments(docs)
    setLoading(false)
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'info', label: 'Case Info' },
    { key: 'parties', label: 'Parties', count: parties.length },
    { key: 'proceedings', label: 'Proceedings', count: proceedings.length },
    { key: 'documents', label: 'Documents', count: documents.length },
  ]

  function startEditing() {
    if (caseData) setEditForm({ ...caseData })
    setEditing(true)
  }

  async function saveEdit() {
    if (!editForm || !caseData) return
    await db.updateCase(editForm)
    setCaseData({ ...editForm })
    setEditing(false)
  }

  async function addProceeding(p: Proceeding) {
    await db.createProceeding(p)
    setProceedings((prev) => [p, ...prev])
  }

  async function deleteProceeding(proceedingId: string) {
    await db.deleteProceeding(proceedingId)
    setProceedings((prev) => prev.filter((p) => p.id !== proceedingId))
  }

  async function addParty(p: CaseParty) {
    await db.addCaseParty(p)
    setParties((prev) => [...prev, p])
  }

  async function removeParty(partyId: string) {
    await db.removeCaseParty(partyId)
    setParties((prev) => prev.filter((p) => p.id !== partyId))
  }

  async function addDocument(d: Document) {
    await db.saveDocument(d)
    setDocuments((prev) => [d, ...prev])
  }

  async function deleteDocument(docId: string) {
    await db.deleteDocument(docId)
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  async function handleExportPdf() {
    if (!caseData) return
    const courts = getPakistaniCourts()
    const court = courts.find((c) => c.id === caseData.court_id)
    const courtName = court ? `${court.name}${court.city ? `, ${court.city}` : ''}` : ''
    await exportCasePdf(caseData, proceedings, courtName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-500">Case not found</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {caseData.case_number}
            </h1>
            <Badge
              variant={
                caseData.status === 'Active'
                  ? 'success'
                  : caseData.status === 'Decided' || caseData.status === 'Disposed'
                    ? 'info'
                    : 'warning'
              }
            >
              {caseData.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{caseData.title}</p>
        </div>
        {activeTab === 'info' && (
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEdit}>
                  <Save size={14} className="mr-1" /> Save
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleExportPdf}>
                  <Download size={14} className="mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={startEditing}>
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && editForm ? (
                <>
                  <Input
                    label="Case Number"
                    value={editForm.case_number}
                    onChange={(e) => setEditForm({ ...editForm, case_number: e.target.value })}
                  />
                  <Input
                    label="Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                  <Select
                    label="Case Type"
                    options={[
                      { value: 'Civil', label: 'Civil' },
                      { value: 'Criminal', label: 'Criminal' },
                      { value: 'Family', label: 'Family' },
                      { value: 'Constitutional', label: 'Constitutional' },
                      { value: 'Tax', label: 'Tax' },
                      { value: 'Service', label: 'Service' },
                      { value: 'Anti-Terrorism', label: 'Anti-Terrorism' },
                      { value: 'Banking', label: 'Banking' },
                      { value: 'Labour', label: 'Labour' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={editForm.case_type || ''}
                    onChange={(e) => setEditForm({ ...editForm, case_type: e.target.value })}
                  />
                  <Select
                    label="Status"
                    options={CASE_STATUSES.map((s) => ({ value: s, label: s }))}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  />
                  <Input
                    label="Filing Date"
                    type="date"
                    value={editForm.filing_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, filing_date: e.target.value })}
                  />
                  <Select
                    label="Division"
                    options={[
                      { value: '', label: 'Not specified' },
                      ...DIVISIONS.map((d) => ({ value: d, label: d })),
                    ]}
                    value={editForm.division || ''}
                    onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>

                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Case Number</p>
                      <p className="text-sm font-medium text-slate-900">
                        {caseData.case_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm text-slate-700">
                        {caseData.case_type || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Filing Date</p>
                      <p className="text-sm text-slate-700">
                        {caseData.filing_date
                          ? formatDate(caseData.filing_date)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="text-sm text-slate-700">{caseData.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Division</p>
                      <p className="text-sm text-slate-700">
                        {caseData.division || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  {caseData.description && (
                    <div>
                      <p className="text-xs text-slate-500">Description</p>
                      <p className="text-sm text-slate-700">
                        {caseData.description}
                      </p>
                    </div>
                  )}

                  {caseData.remarks && (
                    <div>
                      <p className="text-xs text-slate-500">Remarks</p>
                      <p className="text-sm text-slate-700">{caseData.remarks}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Link a client to this case by adding them as a party with the
                "Client" flag.
              </p>
              {parties.filter((p) => p.is_client).length > 0 ? (
                <div className="mt-3 space-y-2">
                  {parties
                    .filter((p) => p.is_client)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border border-slate-100 p-3"
                      >
                        <a
                          href={`/clients/${p.client_id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {p.party_name}
                        </a>
                        <p className="text-xs text-slate-400">{p.party_type}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  Go to "Parties" tab to add a client.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'parties' && (
        <Card>
          <CardContent className="p-5">
            <CaseParties
              caseId={caseData.id}
              parties={parties}
              onAdd={addParty}
              onRemove={removeParty}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'proceedings' && (
        <Card>
          <CardContent className="p-5">
            <ProceedingList
              caseId={caseData.id}
              proceedings={proceedings}
              onAdd={addProceeding}
              onDelete={deleteProceeding}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardContent className="p-5">
            <Documents
              caseId={caseData.id}
              documents={documents}
              onAdd={addDocument}
              onDelete={deleteDocument}
            />
          </CardContent>
        </Card>
      )}

    </div>
  )
}
