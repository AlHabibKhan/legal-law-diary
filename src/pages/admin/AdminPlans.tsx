import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2 } from 'lucide-react'
import type { SubscriptionPlan } from '@/types'

export default function AdminPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_usd', { ascending: true })

    if (error) {
      console.error(error)
      return
    }
    setPlans(data || [])
    setLoading(false)
  }

  async function togglePlan(planId: string, currentActive: boolean) {
    await supabase
      .from('subscription_plans')
      .update({ is_active: !currentActive })
      .eq('id', planId)
    loadPlans()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
        <Button size="sm">
          <Plus size={14} className="mr-1" /> Add Plan
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.is_active ? 'success' : 'default'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="font-medium text-slate-900">${plan.price_usd}/{plan.interval}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="capitalize text-slate-900">{plan.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Max Members</p>
                  <p className="text-slate-900">{plan.max_members}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Storage</p>
                  <p className="text-slate-900">{plan.max_storage_mb} MB</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => togglePlan(plan.id, plan.is_active)}>
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
