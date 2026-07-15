import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ReminderBell } from '@/components/ReminderBell'

import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Users,
  Building2,
  Calculator,
  Settings,
  Scale,
  Search,
  Shield,
  CreditCard,
  Download,
  Clock,
  CheckSquare,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/diary', icon: BookOpen, label: 'Case Diary' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/time', icon: Clock, label: 'Time Tracking' },
  { to: '/cases', icon: Briefcase, label: 'Cases' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/courts', icon: Building2, label: 'Court Directory' },
  { to: '/tools', icon: Calculator, label: 'Tools' },
  { to: '/pricing', icon: CreditCard, label: 'Subscription' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/settings', icon: Download, label: 'Data Backup' },
]

interface SidebarProps {
  onSearchOpen: () => void
}

export function Sidebar({ onSearchOpen }: SidebarProps) {
  const { isAdmin } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <Scale className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-base font-bold text-slate-900">Legal Law Diary</h1>
          <p className="text-xs text-slate-500">Pakistan Courts</p>
        </div>
      </div>

      <div className="border-b border-slate-100 px-3 py-2">
        <button
          onClick={onSearchOpen}
          className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-500"
        >
          <Search size={16} />
          <span>Search...</span>
          <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Shield size={18} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 px-3 py-2">
        <ReminderBell />
      </div>

      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">v1.0.0 | Cloud Sync</p>
      </div>
    </aside>
  )
}
