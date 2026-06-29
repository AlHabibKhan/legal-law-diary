import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Briefcase, Mail, Phone, MapPin, IdCard, Loader2 } from 'lucide-react'
import { db } from '@/lib/db'
import type { Client, Case } from '@/types'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const [c, clientCases] = await Promise.all([
      db.getClient(id!),
      db.getClientCases(id!),
    ])
    if (c) setClient(c)
    setCases(clientCases)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-500">Client not found</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <IdCard size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">CNIC</p>
                <p className="text-sm text-slate-900">{client.cnic || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-900">{client.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-900">{client.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Address</p>
                <p className="text-sm text-slate-900">
                  {client.address || 'N/A'}
                </p>
              </div>
            </div>
            {client.notes && (
              <div>
                <p className="text-xs text-slate-500">Notes</p>
                <p className="text-sm text-slate-700">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Briefcase className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  No cases linked to this client
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cases.map((c) => (
                  <a
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {c.case_number}
                      </p>
                      <p className="text-xs text-slate-500">{c.title}</p>
                    </div>
                    <Badge
                      variant={
                        c.status === 'Active' ? 'success' : 'info'
                      }
                    >
                      {c.status}
                    </Badge>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
