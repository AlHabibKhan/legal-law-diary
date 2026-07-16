import { AdBanner } from './AdBanner'
import { BookOpen, CalendarCheck, Users, FileText, Gavel, BarChart3, ShieldCheck, Lock } from 'lucide-react'

const features = [
  { icon: BookOpen, label: 'Case Management', color: 'text-blue-600' },
  { icon: CalendarCheck, label: 'Hearing Diary', color: 'text-emerald-600' },
  { icon: Users, label: 'Client Directory', color: 'text-purple-600' },
  { icon: FileText, label: 'Document Storage', color: 'text-amber-600' },
  { icon: Gavel, label: 'Proceedings Log', color: 'text-rose-600' },
  { icon: BarChart3, label: 'Dashboard Insights', color: 'text-cyan-600' },
  { icon: ShieldCheck, label: 'Cloud Sync', color: 'text-indigo-600' },
  { icon: Lock, label: 'Secure & Encrypted', color: 'text-slate-600' },
]

interface SideAdPanelProps {
  side: 'left' | 'right'
}

export function SideAdPanel({ side }: SideAdPanelProps) {
  return (
    <aside
      className={`flex w-48 shrink-0 flex-col border-l border-slate-200 bg-white ${
        side === 'left' ? 'hidden lg:flex border-l-0 border-r' : 'hidden xl:flex'
      }`}
    >
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
          Advertisement
        </p>

        <AdBanner
          adKey="xpdt49gn"
          height={600}
          width={300}
          className="mb-3"
        />

        <div className="space-y-1.5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-slate-50"
              >
                <Icon size={14} className={`shrink-0 ${f.color}`} />
                <span className="text-[11px] font-medium leading-tight text-slate-500 group-hover:text-slate-700">
                  {f.label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="pt-2">
          <AdBanner adKey="xpdt49gn" height={250} width={300} />
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-300">
        Legal Law Diary Platform
      </div>
    </aside>
  )
}
