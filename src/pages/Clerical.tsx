import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ScrollText, FileText, Gavel, Copy } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { CLERICAL_STATUSES, ORDER_COPY_STATUSES, NOTICE_TYPES, SUMMONS_TYPES } from '@/types'
import type { Case, Notice, Summons, OrderCopyRequest } from '@/types'

type Tab = 'notices' | 'summons' | 'order_copies'

export default function Clerical() {
  const [activeTab, setActiveTab] = useState<Tab>('notices')
  const [notices, setNotices] = useState<Notice[]>([])
  const [summons, setSummons] = useState<Summons[]>([])
  const [orderCopies, setOrderCopies] = useState<OrderCopyRequest[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [c, n, s, o] = await Promise.all([
      db.getCases(),
      db.getAllNotices(),
      db.getAllSummons(),
      db.getAllOrderCopies(),
    ])
    setCases(c)
    setNotices(n)
    setSummons(s)
    setOrderCopies(o)
  }

  const caseMap = new Map(cases.map((c) => [c.id, c]))

  function getCaseLabel(caseId: string): string {
    const c = caseMap.get(caseId)
    return c ? `${c.case_number} - ${c.title}` : caseId
  }

  const tabs: { key: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'notices', label: 'Notices', count: notices.length, icon: FileText },
    { key: 'summons', label: 'Summons', count: summons.length, icon: Gavel },
    { key: 'order_copies', label: 'Order Copies', count: orderCopies.length, icon: Copy },
  ]

  function statusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    if (status === 'Draft') return 'default'
    if (status === 'Issued' || status === 'Applied' || status === 'Ready') return 'info'
    if (status === 'Served' || status === 'Processing') return 'warning'
    if (status === 'Returned') return 'danger'
    if (status === 'Complied' || status === 'Received') return 'success'
    return 'default'
  }

  const filteredNotices = notices.filter((n) => {
    const matchSearch = !search || n.issued_to.toLowerCase().includes(search.toLowerCase()) || getCaseLabel(n.case_id).toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || n.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredSummons = summons.filter((s) => {
    const matchSearch = !search || s.issued_to.toLowerCase().includes(search.toLowerCase()) || getCaseLabel(s.case_id).toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredOrderCopies = orderCopies.filter((o) => {
    const matchSearch = !search || getCaseLabel(o.case_id).toLowerCase().includes(search.toLowerCase()) || (o.order_summary || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Case Administration</h1>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(''); setStatusFilter('') }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          options={[
            { value: '', label: 'All statuses' },
            ...(activeTab === 'order_copies' ? ORDER_COPY_STATUSES : CLERICAL_STATUSES).map(s => ({ value: s, label: s })),
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {activeTab === 'notices' && (
        filteredNotices.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center">
            <ScrollText className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{search ? 'No notices match your search' : 'No notices issued yet'}</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{n.notice_type}</Badge>
                        <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{n.issued_to}</p>
                      <p className="text-xs text-slate-500">
                        <a href={`/cases/${n.case_id}`} className="text-blue-600 hover:underline">{getCaseLabel(n.case_id)}</a>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Issued: {formatDate(n.issued_date)}</span>
                        {n.served_date && <span>Served: {formatDate(n.served_date)}</span>}
                      </div>
                      {n.remarks && <p className="text-xs text-slate-400">{n.remarks}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'summons' && (
        filteredSummons.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center">
            <ScrollText className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{search ? 'No summons match your search' : 'No summons issued yet'}</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredSummons.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{s.summons_type}</Badge>
                        <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{s.issued_to}</p>
                      <p className="text-xs text-slate-500">
                        <a href={`/cases/${s.case_id}`} className="text-blue-600 hover:underline">{getCaseLabel(s.case_id)}</a>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Issued: {formatDate(s.issued_date)}</span>
                        {s.return_date && <span>Return: {formatDate(s.return_date)}</span>}
                        {s.hearing_date && <span>Hearing: {formatDate(s.hearing_date)}</span>}
                      </div>
                      {s.remarks && <p className="text-xs text-slate-400">{s.remarks}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'order_copies' && (
        filteredOrderCopies.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center">
            <ScrollText className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{search ? 'No order copy requests match your search' : 'No order copy requests yet'}</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredOrderCopies.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Order: {formatDate(o.order_date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        <a href={`/cases/${o.case_id}`} className="text-blue-600 hover:underline">{getCaseLabel(o.case_id)}</a>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Applied: {formatDate(o.applied_date)}</span>
                        {o.received_date && <span>Received: {formatDate(o.received_date)}</span>}
                      </div>
                      {o.order_summary && <p className="text-sm text-slate-700">{o.order_summary}</p>}
                      {o.remarks && <p className="text-xs text-slate-400">{o.remarks}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}
