import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { trialDaysLeft, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAccess()
  }, [trialDaysLeft, isAuthenticated])

  async function checkAccess() {
    if (!isAuthenticated) { setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBlocked(false); setLoading(false); return }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sub?.status === 'active') {
      setBlocked(false)
      setLoading(false)
      return
    }

    if (trialDaysLeft !== null && trialDaysLeft <= 0) {
      setBlocked(true)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Trial Expired</h1>
        <p className="max-w-md text-gray-600">
          Your free trial has ended. Subscribe to continue using Legal Law Diary.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          View Plans & Subscribe
        </button>
      </div>
    )
  }

  return <>{children}</>
}
