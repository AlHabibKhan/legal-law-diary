import { db } from './db'
import type { DiaryEntry } from '@/types'

const REMINDER_CHECK_INTERVAL = 30000

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: 'legal-diary-reminder',
    })
  } catch {
    // Notification may fail silently
  }
}

export interface UpcomingEntry {
  entry: DiaryEntry
  minutesUntil: number
}

export async function checkUpcomingEntries(): Promise<UpcomingEntry[]> {
  const all = await db.getDiaryEntries()
  const now = new Date()

  const upcoming: UpcomingEntry[] = []

  for (const entry of all) {
    if (entry.reminder_sent) continue
    if (!entry.reminder_minutes) continue
    if (entry.status === 'Completed' || entry.status === 'Cancelled') continue

    const entryDate = new Date(entry.date)
    if (isNaN(entryDate.getTime())) continue

    const reminderTime = new Date(entryDate.getTime() - entry.reminder_minutes * 60000)
    const msUntil = entryDate.getTime() - now.getTime()
    const minutesUntil = Math.round(msUntil / 60000)

    if (msUntil <= 0) continue

    const readyToRemind = now.getTime() >= reminderTime.getTime()

    if (readyToRemind) {
      upcoming.push({ entry, minutesUntil })
    }
  }

  return upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil)
}

export async function firePendingReminders(): Promise<void> {
  const upcoming = await checkUpcomingEntries()

  for (const { entry } of upcoming) {
    const caseData = await db.getCase(entry.case_id)
    const caseNum = caseData?.case_number ?? entry.case_id
    const purpose = entry.purpose || 'Hearing'

    showNotification(
      `Upcoming Hearing: ${caseNum}`,
      `${purpose} at ${entry.date.slice(0, 10)}`
    )

    await db.updateDiaryEntry({
      ...entry,
      reminder_sent: true,
    })
  }
}

export function startReminderChecker(): () => void {
  requestNotificationPermission()

  firePendingReminders()

  const interval = setInterval(() => {
    firePendingReminders()
  }, REMINDER_CHECK_INTERVAL)

  return () => clearInterval(interval)
}

export async function getTodaysHearings(): Promise<DiaryEntry[]> {
  const today = new Date().toISOString().slice(0, 10)
  const all = await db.getDiaryEntries()
  return all.filter(
    (e) =>
      e.date === today &&
      e.status !== 'Completed' &&
      e.status !== 'Cancelled'
  )
}
