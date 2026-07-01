import { useNavigate } from 'react-router-dom'
import {
  Scale, User, Building2, ArrowRight, Lock,
  BookOpen, CalendarCheck, Users, FileText, Gavel, BarChart3, ShieldCheck,
  Calculator, Clock, DollarSign, Calendar,
} from 'lucide-react'
import { AdBanner } from '@/components/ads/AdBanner'

const features = [
  { icon: BookOpen, title: 'Case Management', desc: 'Organize and track all your legal cases in one place' },
  { icon: CalendarCheck, title: 'Hearing Diary', desc: 'Never miss a court date with scheduled reminders' },
  { icon: Users, title: 'Client Directory', desc: 'Maintain detailed records of all your clients' },
  { icon: FileText, title: 'Document Storage', desc: 'Attach and manage case documents securely' },
  { icon: Gavel, title: 'Proceedings Log', desc: 'Record and review every court proceeding' },
  { icon: BarChart3, title: 'Dashboard Insights', desc: 'Get real-time stats on your practice performance' },
  { icon: ShieldCheck, title: 'Cloud Sync', desc: 'Access your data from any device, anywhere' },
  { icon: Lock, title: 'Secure & Encrypted', desc: 'Your data is protected at rest and in transit' },
]

const roles = [
  {
    key: 'individual',
    icon: User,
    label: 'Individual Lawyer',
    description: 'Manage your cases, diary, and clients',
    color: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    key: 'firm',
    icon: Building2,
    label: 'Law Firm',
    description: 'Multi-member firm management & collaboration',
    color: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-50 text-purple-600',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">Legal Law Diary</h1>
          <p className="mt-2 text-base text-slate-500">
            Complete practice management for Pakistan courts
          </p>
        </div>

        <AdBanner adKey="LANDING_MID" height={90} width={728} className="w-full max-w-2xl mx-auto" />

        {/* Benefits */}
        <div className="w-full">
          <h2 className="mb-6 text-center text-xl font-bold text-slate-900">Everything you need to run your practice</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tools Promo */}
        <div className="w-full rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Calculator className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Legal Tools & Calculators</h3>
              <p className="mt-1 text-sm text-blue-100">
                Limitation · Court Fee · Interest on Decree · Date Math · Case Age
              </p>
            </div>
            <button
              onClick={() => navigate('/tools')}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Explore Tools <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid w-full gap-5 sm:grid-cols-2">
          {roles.map((r) => {
            const Icon = r.icon
            return (
              <div
                key={r.key}
                className={`rounded-xl border-2 bg-white p-6 text-center shadow-sm transition-all ${r.color}`}
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${r.iconBg}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{r.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{r.description}</p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => navigate(`/login?role=${r.key}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Sign In <ArrowRight className="h-4 w-4" />
                  </button>

                  {r.key !== 'admin' && (
                    <button
                      onClick={() => navigate(`/register?role=${r.key}`)}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${r.btnColor}`}
                    >
                      {r.key === 'firm' ? 'Register Firm' : 'Create Account'} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {r.key === 'admin' && (
                    <p className="text-xs text-slate-400">Authorized personnel only</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <AdBanner adKey="LANDING_BANNER" height={90} width={728} className="w-full max-w-2xl mx-auto" />

        {/* Footer links */}
        <div className="text-center">
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
            <Lock size={14} className="mx-auto text-slate-400" />
            <p className="mt-1 text-xs text-slate-400">
              Data encrypted in transit and at rest
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              <a href="/legal" className="text-blue-600 underline hover:text-blue-800">Terms of Service</a>
              <span className="mx-1.5">|</span>
              <a href="/legal#privacy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
              <span className="mx-1.5">|</span>
              <a href="/legal#disclaimer" className="text-blue-600 underline hover:text-blue-800">Disclaimer</a>
            </p>
            <p className="mt-0.5 text-[10px] text-slate-300">
              Practice management tool — not a substitute for legal advice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
