import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getTodayDate } from '@/lib/utils'
import { db } from '@/lib/db'
import {
  Briefcase,
  BookOpen,
  Users,
  Calendar,
  ArrowUpRight,
  X,
  AlertTriangle,
} from 'lucide-react'
import type { DashboardStats, DiaryEntry } from '@/types'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_cases: 0,
    active_cases: 0,
    today_hearings: 0,
    upcoming_hearings: 0,
    total_clients: 0,
  })
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([])
  const [showBackupBanner, setShowBackupBanner] = useState(false)

  useEffect(() => {
    loadStats()
    const dismissed = localStorage.getItem('backup_banner_dismissed')
    if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
      setShowBackupBanner(true)
    }
  }, [])

  function dismissBackupBanner() {
    setShowBackupBanner(false)
    localStorage.setItem('backup_banner_dismissed', String(Date.now()))
  }

  async function loadStats() {
    const s = await db.getDashboardStats()
    setStats(s)
    const entries = await db.getDiaryEntries(getTodayDate())
    setTodayEntries(entries)
  }

  const statCards = [
    {
      label: 'Total Cases',
      value: stats.total_cases,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Active Cases',
      value: stats.active_cases,
      icon: ArrowUpRight,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: "Today's Hearings",
      value: stats.today_hearings,
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Total Clients',
      value: stats.total_clients,
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      {showBackupBanner && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium">Regular backups recommended</p>
            <p className="mt-0.5 text-amber-700">
              Export your data frequently to prevent loss. Go to{' '}
              <a href="/settings" className="font-medium underline">Settings → Data Backup</a> to download your backup file.
            </p>
          </div>
          <button onClick={dismissBackupBanner} className="shrink-0 rounded p-1 text-amber-500 hover:bg-amber-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        {profile && (
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {profile.full_name}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Today's Hearings</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  No hearings scheduled for today
                </p>
                <p className="text-xs text-slate-400">{getTodayDate()}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {entry.purpose || 'Hearing'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(entry.date)}
                      </p>
                      {entry.division && (
                        <p className="text-xs text-slate-400">{entry.division}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        entry.status === 'Completed'
                          ? 'success'
                          : entry.status === 'Adjourned'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/diary/new"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <BookOpen size={18} className="text-blue-600" />
              Add Diary Entry
            </Link>
            <Link
              to="/cases/new"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Briefcase size={18} className="text-blue-600" />
              New Case
            </Link>
            <Link
              to="/clients/new"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Users size={18} className="text-blue-600" />
              Register Client
            </Link>
            <Link
              to="/courts"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Calendar size={18} className="text-blue-600" />
              Browse Courts
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
