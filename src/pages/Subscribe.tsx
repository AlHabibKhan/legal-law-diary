import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { supabaseDb } from '@/lib/db-supabase'
import type { SubscriptionPlan, PaymentMethod } from '@/types'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function Subscribe() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [form, setForm] = useState({ transaction_id: '', sender_name: '', sender_account: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    load()
  }, [planId])

  async function load() {
    if (!planId) return
    const { data: p } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()
    if (p) setPlan(p as SubscriptionPlan)
    const m = await supabaseDb.getActivePaymentMethods()
    setMethods(m)
    if (m.length > 0) setSelectedMethod(m[0].id)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!planId || !selectedMethod) return
    setSubmitting(true)
    try {
      await supabaseDb.createPaymentRequest({
        plan_id: planId,
        payment_method_id: selectedMethod,
        amount: plan?.price_pkr || 0,
        transaction_id: form.transaction_id,
        sender_name: form.sender_name,
        sender_account: form.sender_account || undefined,
        notes: form.notes || undefined,
      })
      setDone(true)
    } catch (e) { console.error(e) }
    setSubmitting(false)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  if (!plan) return <div className="flex min-h-screen items-center justify-center text-gray-500">Plan not found</div>

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Payment Submitted</h1>
        <p className="max-w-md text-gray-600">
          Your payment request has been submitted. The admin will verify it shortly.
          You'll be notified once your subscription is activated.
        </p>
        <button onClick={() => navigate('/payment-status')} className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Check Status
        </button>
      </div>
    )
  }

  const selectedMethodDetails = methods.find(m => m.id === selectedMethod)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <button onClick={() => navigate('/pricing')} className="mb-6 flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </button>

        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          <p className="mt-2 text-3xl font-bold">PKR {plan.price_pkr.toLocaleString()}/{plan.interval === 'year' ? 'year' : 'month'}</p>
          {plan.next_increase_at && (
            <p className="mt-1 text-xs text-gray-400">Price locked for 2 years. Next increase: {new Date(plan.next_increase_at).toLocaleDateString()}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">1. Select Payment Method</h2>
            <div className="space-y-3">
              {methods.map(m => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${selectedMethod === m.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="method" value={m.id} checked={selectedMethod === m.id}
                    onChange={e => setSelectedMethod(e.target.value)} className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{m.label}</p>
                    <p className="text-sm text-gray-500">{m.account_name} — {m.mobile_number || m.account_number}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedMethodDetails && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <strong>Send payment to:</strong><br />
              {selectedMethodDetails.account_name}<br />
              {selectedMethodDetails.mobile_number && <>Mobile: {selectedMethodDetails.mobile_number}<br /></>}
              {selectedMethodDetails.account_number && <>Account: {selectedMethodDetails.account_number}<br /></>}
              {selectedMethodDetails.iban && <>IBAN: {selectedMethodDetails.iban}</>}
              <p className="mt-2 font-medium">Amount: PKR {plan.price_pkr.toLocaleString()}</p>
            </div>
          )}

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">2. Confirm Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID *</label>
                <input value={form.transaction_id} onChange={e => setForm({ ...form, transaction_id: e.target.value })} required
                  placeholder="e.g., TAN123456789"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender Name (as per account) *</label>
                <input value={form.sender_name} onChange={e => setForm({ ...form, sender_name: e.target.value })} required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender Account/Mobile</label>
                <input value={form.sender_account} onChange={e => setForm({ ...form, sender_account: e.target.value })}
                  placeholder="Your account number or mobile number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.transaction_id || !form.sender_name}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Payment Proof
          </button>
        </form>
      </div>
    </div>
  )
}
