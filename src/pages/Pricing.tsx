import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { SubscriptionPlan } from '@/types'
import { Check, Loader2, ArrowRight } from 'lucide-react'

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  useAuth()
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_pkr')
    if (data) setPlans(data as SubscriptionPlan[])
    setLoading(false)
  }

  const filtered = plans.filter(p => p.interval === interval && p.type === 'individual')

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">&larr; Back to app</button>
        </div>
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-2 text-gray-600">Subscribe to continue using Legal Law Diary after your trial</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border bg-white p-1">
            <button
              onClick={() => setInterval('month')}
              className={`rounded-md px-4 py-2 text-sm font-medium ${interval === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >Monthly</button>
            <button
              onClick={() => setInterval('year')}
              className={`rounded-md px-4 py-2 text-sm font-medium ${interval === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >Yearly <span className="text-xs opacity-75">(2 mo free)</span></button>
          </div>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {filtered.map(plan => {
            const monthlyEquiv = interval === 'year' ? Math.round(plan.price_pkr / 10) : plan.price_pkr
            return (
              <div key={plan.id} className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">PKR {plan.price_pkr.toLocaleString()}</span>
                  <span className="text-gray-500">/{interval === 'year' ? 'year' : 'month'}</span>
                  {interval === 'year' && (
                    <p className="mt-1 text-sm text-green-600">PKR {monthlyEquiv.toLocaleString()}/month — 2 months free</p>
                  )}
                </div>
                {plan.next_increase_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    Price increases every 2 years. Next: {new Date(plan.next_increase_at).toLocaleDateString()}
                  </p>
                )}
                <ul className="mt-6 space-y-2">
                  {(plan.features as string[])?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/subscribe/${plan.id}`)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                >
                  Subscribe <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">No plans available</div>
          )}
        </div>

        <div className="mt-12 rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold">Firm Plans</h3>
          <p className="mt-1 text-sm text-gray-600">For law firms with multiple members.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {plans.filter(p => p.interval === interval && p.type === 'firm').map(plan => (
              <div key={plan.id} className="rounded-lg border bg-gray-50 p-4">
                <h4 className="font-semibold">{plan.name}</h4>
                <p className="text-2xl font-bold">PKR {plan.price_pkr.toLocaleString()}/{interval === 'year' ? 'year' : 'month'}</p>
                <button
                  onClick={() => navigate(`/subscribe/${plan.id}`)}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >Subscribe</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
