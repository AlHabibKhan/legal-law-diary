import { useEffect, useState } from 'react'
import { supabaseDb } from '@/lib/db-supabase'
import type { PaymentRequest } from '@/types'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    try {
      const data = await supabaseDb.getPaymentRequests(filter ? { status: filter } : {})
      setRequests(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleVerify(id: string) {
    const note = prompt('Admin notes (optional):')
    try {
      await supabaseDb.verifyPaymentRequest(id, 'verified', note || undefined)
      load()
    } catch (e) { console.error(e) }
  }

  async function handleReject(id: string) {
    const note = prompt('Reason for rejection:')
    if (!note) return
    try {
      await supabaseDb.verifyPaymentRequest(id, 'rejected', note)
      load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Requests</h1>
        <div className="flex gap-2">
          {['pending', 'verified', 'rejected', ''].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{r.sender_name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === 'verified' ? 'bg-green-100 text-green-800' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{r.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                  <span>Amount: <strong>PKR {r.amount?.toLocaleString()}</strong></span>
                  <span>Transaction ID: {r.transaction_id}</span>
                  <span>Method: {r.payment_method?.label || r.payment_method_id}</span>
                  <span>Plan: {r.plan?.name || r.plan_id}</span>
                  <span>Sender Account: {r.sender_account || '-'}</span>
                  <span>Date: {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.notes && <p className="mt-2 text-sm text-gray-500">Notes: {r.notes}</p>}
                {r.admin_notes && (
                  <p className="mt-1 text-sm italic text-gray-400">
                    {r.status === 'verified' ? 'Admin note' : 'Rejection reason'}: {r.admin_notes}
                  </p>
                )}
              </div>
              {r.status === 'pending' && (
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleVerify(r.id)}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" /> Verify
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">
            No {filter} payment requests
          </div>
        )}
      </div>
    </div>
  )
}
