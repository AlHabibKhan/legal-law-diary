import { useNavigate } from 'react-router-dom'
import { Bell, BellRing } from 'lucide-react'
import { useReminders } from '@/hooks/useReminders'

export function ReminderBell() {
  const { todaysHearings, count, loading } = useReminders()
  const navigate = useNavigate()

  if (loading) return null

  return (
    <button
      onClick={() => navigate('/diary')}
      className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      title={`${count} hearing${count !== 1 ? 's' : ''} today`}
    >
      {count > 0 ? (
        <BellRing size={18} className="text-amber-500" />
      ) : (
        <Bell size={18} />
      )}
      <span>Reminders</span>
      {count > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}
