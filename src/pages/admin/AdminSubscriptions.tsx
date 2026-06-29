import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SubRow {
  id: string
  user_email: string
  user_name: string
  plan_name: string
  status: string
  trial_end: string | null
  period_end: string | null
  created_at: string
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  trialing: 'default',
  past_due: 'warning',
  canceled: 'default',
  expired: 'danger',
}

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubs()
  }, [])

  async function loadSubs() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plan_id(name), user:user_id(id)')
      .order('created_at', { ascending: false })

    if (error || !data) {
      setLoading(false)
      return
    }

    const enriched: SubRow[] = []
    for (const s of data) {
      const { data: userData } = await supabase.auth.admin.getUserById(s.user_id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', s.user_id)
        .single()

      enriched.push({
        id: s.id,
        user_email: userData?.user?.email ?? 'unknown',
        user_name: profile?.full_name ?? 'Unknown',
        plan_name: (s.plan as unknown as { name: string })?.name ?? 'N/A',
        status: s.status,
        trial_end: s.trial_end,
        period_end: s.current_period_end,
        created_at: s.created_at,
      })
    }
    setSubs(enriched)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Trial End</th>
                <th className="px-4 py-3 font-medium">Period End</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{s.user_name}</p>
                    <p className="text-xs text-slate-500">{s.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.plan_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[s.status] ?? 'default'}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.trial_end ? new Date(s.trial_end).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.period_end ? new Date(s.period_end).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
