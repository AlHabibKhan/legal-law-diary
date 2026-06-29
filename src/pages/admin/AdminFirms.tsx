import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users } from 'lucide-react'
import type { Firm, FirmMember } from '@/types'

interface FirmWithDetails extends Firm {
  owner_name: string
  member_count: number
}

export default function AdminFirms() {
  const [firms, setFirms] = useState<FirmWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFirm, setExpandedFirm] = useState<string | null>(null)
  const [members, setMembers] = useState<Record<string, FirmMember[]>>({})

  useEffect(() => {
    loadFirms()
  }, [])

  async function loadFirms() {
    const { data, error } = await supabase
      .from('firms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      setLoading(false)
      return
    }

    const enriched: FirmWithDetails[] = []
    for (const f of data) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', f.owner_id)
        .single()

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', f.id)

      enriched.push({
        ...f,
        owner_name: owner?.full_name ?? 'Unknown',
        member_count: count ?? 0,
      })
    }
    setFirms(enriched)
    setLoading(false)
  }

  async function loadMembers(firmId: string) {
    if (members[firmId]) {
      setExpandedFirm(expandedFirm === firmId ? null : firmId)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('firm_id', firmId)

    if (error) return

    setMembers((prev) => ({ ...prev, [firmId]: data as unknown as FirmMember[] }))
    setExpandedFirm(firmId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Law Firms</h1>

      <div className="space-y-3">
        {firms.map((firm) => (
          <Card key={firm.id}>
            <CardHeader>
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => loadMembers(firm.id)}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-blue-600" />
                  <div>
                    <CardTitle className="text-base">{firm.name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      Owner: {firm.owner_name} · {firm.member_count} member{firm.member_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge variant={firm.is_active ? 'success' : 'default'}>
                  {firm.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </button>
            </CardHeader>

            {expandedFirm === firm.id && members[firm.id] && (
              <CardContent className="border-t border-slate-100 pt-4">
                <h4 className="mb-2 text-sm font-medium text-slate-700">Members</h4>
                {members[firm.id].length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet</p>
                ) : (
                  <div className="space-y-2">
                    {members[firm.id].map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <Users size={16} className="text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {(m as unknown as { full_name: string }).full_name}
                          </p>
                        </div>
                        <Badge variant="default">
                          {(m as unknown as { role: string }).role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {firms.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">No law firms registered yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
