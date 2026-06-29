import { useEffect, useState } from 'react'
import { supabaseDb } from '@/lib/db-supabase'
import type { PaymentRequest } from '@/types'
import { Loader2, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PaymentStatus() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await supabaseDb.getMyPaymentRequests()
      setRequests(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">&larr; Back to app</button>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Payment Status</h1>
        <p className="mb-8 text-gray-600">Track your subscription payment requests</p>

        <div className="space-y-4">
          {requests.length === 0 && (
            <div className="rounded-lg border bg-white py-12 text-center">
              <p className="text-gray-500">No payment requests yet</p>
              <button onClick={() => navigate('/pricing')} className="mt-4 text-blue-600 hover:underline">
                View plans &rarr;
              </button>
            </div>
          )}
          {requests.map(r => (
            <div key={r.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {r.status === 'pending' && <Clock className="h-6 w-6 text-yellow-500" />}
                  {r.status === 'verified' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {r.status === 'rejected' && <XCircle className="h-6 w-6 text-red-500" />}
                  <div>
                    <h3 className="font-semibold capitalize">{r.status}</h3>
                    <p className="text-sm text-gray-500">PKR {r.amount?.toLocaleString()} — {r.plan?.name || 'Plan'}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>Transaction: {r.transaction_id}</span>
                <span>Method: {r.payment_method?.label || '-'}</span>
                <span>Sender: {r.sender_name}</span>
                {r.admin_notes && (
                  <span className="col-span-full italic text-gray-400">
                    {r.status === 'rejected' ? 'Reason' : 'Note'}: {r.admin_notes}
                  </span>
                )}
              </div>
              {r.status === 'verified' && (
                <button onClick={() => navigate('/')} className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  Go to Dashboard <ArrowRight className="h-3 w-3" />
                </button>
              )}
              {r.status === 'rejected' && (
                <button onClick={() => navigate('/pricing')} className="mt-4 text-sm text-blue-600 hover:underline">
                  Try again &rarr;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
