import { useState, useEffect } from 'react'
import { startReminderChecker, getTodaysHearings } from '@/lib/reminder'
import type { DiaryEntry } from '@/types'

export function useReminders() {
  const [todaysHearings, setTodaysHearings] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodaysHearings()

    const interval = setInterval(loadTodaysHearings, 60000)

    const stop = startReminderChecker()

    return () => {
      clearInterval(interval)
      stop()
    }
  }, [])

  async function loadTodaysHearings() {
    const entries = await getTodaysHearings()
    setTodaysHearings(entries)
    setLoading(false)
  }

  return {
    todaysHearings,
    count: todaysHearings.length,
    loading,
  }
}
