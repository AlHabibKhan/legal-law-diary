import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { AdBanner } from '@/components/ads/AdBanner'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Building2,
  Download,
  Scale,
  ArrowLeft,
} from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/plans', icon: FileText, label: 'Plans' },
  { to: '/admin/firms', icon: Building2, label: 'Law Firms' },
  { to: '/admin/payment-methods', icon: CreditCard, label: 'Payment Methods' },
  { to: '/admin/payment-requests', icon: FileText, label: 'Payment Requests' },
  { to: '/admin/backup', icon: Download, label: 'Backup' },
]

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <aside className="flex w-64 flex-col border-r border-slate-700 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
          <Scale className="h-7 w-7 text-amber-400" />
          <div>
            <h1 className="text-base font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft size={16} />
            Back to App
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <Outlet />
        <AdBanner adKey="ADMIN_BANNER" height={90} width={728} className="mt-6 mx-auto" />
      </main>
    </div>
  )
}
