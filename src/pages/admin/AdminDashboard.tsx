import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Briefcase,
  Building2,
  DollarSign,
  CreditCard,
} from 'lucide-react'
import type { AdminStats } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    active_users: 0,
    total_firms: 0,
    total_cases: 0,
    total_clients: 0,
    monthly_revenue: 0,
    subscriptions_by_plan: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'active')

    const { count: totalFirms } = await supabase
      .from('firms')
      .select('*', { count: 'exact', head: true })

    const { count: totalCases } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })

    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'paid')

    const monthlyRevenue = (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0)

    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('name')

    const subsByPlan: { plan_name: string; count: number }[] = []
    if (plans) {
      for (const plan of plans) {
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.name)
        subsByPlan.push({ plan_name: plan.name, count: count ?? 0 })
      }
    }

    setStats({
      total_users: totalUsers ?? 0,
      active_users: activeUsers ?? 0,
      total_firms: totalFirms ?? 0,
      total_cases: totalCases ?? 0,
      total_clients: totalClients ?? 0,
      monthly_revenue: monthlyRevenue,
      subscriptions_by_plan: subsByPlan,
    })
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Users', value: stats.active_users, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Total Cases', value: stats.total_cases, icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Clients', value: stats.total_clients, icon: Building2, color: 'text-amber-600 bg-amber-50' },
    { label: 'Law Firms', value: stats.total_firms, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Revenue (USD)', value: `$${stats.monthly_revenue}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.subscriptions_by_plan.length === 0 ? (
              <p className="text-sm text-slate-500">No subscription data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.subscriptions_by_plan.map((s) => (
                  <div key={s.plan_name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="text-sm text-slate-700">{s.plan_name}</span>
                    <span className="text-sm font-medium text-slate-900">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Monitor user registrations, subscriptions, and data usage here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
