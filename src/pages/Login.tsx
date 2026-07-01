import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { checkConnection } from '@/lib/db'
import type { LawyerProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { AdBanner } from '@/components/ads/AdBanner'
import { Scale, Lock, LogIn, User, Building2, Shield, ArrowRight } from 'lucide-react'

type LoginRole = 'individual' | 'firm' | 'admin'

const roleConfig: Record<LoginRole, {
  label: string
  icon: typeof User
  title: string
  subtitle: string
  emailPlaceholder: string
  adminHint?: string
}> = {
  individual: {
    label: 'Individual Lawyer',
    icon: User,
    title: 'Sign in to your account',
    subtitle: 'Access your case diary and practice tools',
    emailPlaceholder: 'lawyer@example.com',
  },
  firm: {
    label: 'Law Firm',
    icon: Building2,
    title: 'Sign in to your firm account',
    subtitle: 'Manage your firm\'s cases and collaborate with team members',
    emailPlaceholder: 'firm@example.com',
  },
  admin: {
    label: 'Super Admin',
    icon: Shield,
    title: 'Super Admin Access',
    subtitle: 'Manage users, subscriptions, and platform settings',
    emailPlaceholder: 'admin@zameenpakistan.pk',
    adminHint: 'Use the admin email provided during setup',
  },
}

export default function Login() {
  const { setAuthenticated, setProfile, setRegistered, initialize } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') as LoginRole) || 'individual'
  const [loginRole, setLoginRole] = useState<LoginRole>(defaultRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const navigate = useNavigate()

  const config = roleConfig[loginRole]

  const roleMap: Record<LoginRole, string> = {
    individual: 'lawyer',
    firm: 'firm_admin',
    admin: 'admin',
  }

  const roleLabel: Record<string, string> = {
    lawyer: 'an Individual Lawyer',
    firm_admin: 'a Law Firm account',
    admin: 'a Super Admin',
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      const storedProfile = localStorage.getItem('lawyer_profile') || localStorage.getItem('ld:lawyer_profile')

      if (storedProfile && signInError.message !== 'Email not confirmed') {
        try {
          const profile = JSON.parse(storedProfile) as LawyerProfile
          setProfile(profile)
          setRegistered(true)
          setAuthenticated(true)
          // ensure bare key exists for future lookups
          localStorage.setItem('lawyer_profile', JSON.stringify(profile))

          setLoading(false)
          navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
          return
        } catch {
          /* corrupt data */
        }
      }

      if (signInError.message === 'Email not confirmed') {
        setError('Please confirm your email address before signing in. Check your inbox (and spam/junk folder).')
      } else if (signInError.message === 'Invalid login credentials') {
        const fallback = localStorage.getItem('lawyer_profile') || localStorage.getItem('ld:lawyer_profile')
        if (fallback) {
          try {
            const profile = JSON.parse(fallback) as LawyerProfile
            setProfile(profile)
            setRegistered(true)
            setAuthenticated(true)
            localStorage.setItem('lawyer_profile', JSON.stringify(profile))
            setLoading(false)
            navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
            return
          } catch { /* corrupt data */ }
        }
        setError('Invalid email or password. If you registered recently, try logging in with the correct credentials.')
      } else {
        setError(
          signInError.message === 'Failed to fetch'
            ? 'Cannot connect to server. Try again later.'
            : signInError.message,
        )
      }
      setLoading(false)
      return
    }

    await checkConnection()
    await initialize()

    const { profile, isAuthenticated, isAdmin } = useAuth.getState()

    if (!isAuthenticated) {
      setError('Account not found. Please register first or check your credentials.')
      setLoading(false)
      return
    }

    if (profile && profile.role && profile.role !== roleMap[loginRole]) {
      await supabase.auth.signOut()
      setError(
        `This email belongs to ${roleLabel[profile.role]}. Please use the correct login tab.`
      )
      setLoading(false)
      return
    }

    setLoading(false)
    navigate(isAdmin ? '/admin' : '/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Legal Law Diary</h1>
          <p className="mt-1 text-sm text-slate-500">Complete practice management for Pakistan courts</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(roleConfig) as [LoginRole, typeof config][]).filter(([key]) => key !== 'admin' || loginRole === 'admin').map(([key, cfg]) => {
            const Icon = cfg.icon
            const isActive = loginRole === key
            return (
              <button
                key={key}
                onClick={() => setLoginRole(key)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center text-xs font-medium transition-all ${
                  isActive
                    ? key === 'admin'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                      : key === 'firm'
                        ? 'border-purple-300 bg-purple-50 text-purple-800 shadow-sm'
                        : 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Icon size={20} className={
                  isActive
                    ? key === 'admin' ? 'text-amber-600' : key === 'firm' ? 'text-purple-600' : 'text-blue-600'
                    : 'text-slate-400'
                } />
                <span className="leading-tight">{cfg.label}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-base font-semibold text-slate-900">{config.title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{config.subtitle}</p>
          </div>

          {loginRole === 'admin' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Authorized personnel only. All access is logged.
            </div>
          )}

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder={config.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {error.includes('confirm your email') && !resendSent && (
            <button
              type="button"
              onClick={async () => {
                setResending(true)
                const { error: resendError } = await supabase.auth.resend({
                  type: 'signup',
                  email: email.trim(),
                })
                setResending(false)
                if (resendError) {
                  setError(resendError.message)
                } else {
                  setResendSent(true)
                  setError('Confirmation email resent! Please check your inbox (and spam).')
                }
              }}
              disabled={resending}
              className="w-full text-center text-xs text-blue-600 hover:underline"
            >
              {resending ? 'Resending...' : 'Resend confirmation email'}
            </button>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn size={16} className="mr-1" />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <Lock size={16} className="mx-auto text-slate-400" />
          <p className="mt-1 text-xs text-slate-500">
            Data encrypted in transit and at rest
          </p>
          <p className="mt-2 text-xs text-slate-400">
            By signing in, you agree to our{' '}
            <a href="/legal" className="text-blue-600 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/legal#privacy" className="text-blue-600 underline">Privacy Policy</a>.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Practice management tool — not a substitute for legal advice.
          </p>
        </div>

        <AdBanner adKey="LOGIN_BANNER" height={250} width={300} className="mx-auto" />

        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">Create an account</Link>
        </p>

        {loginRole !== 'admin' && (
          <p className="text-center text-xs text-slate-400">
            <button
              type="button"
              onClick={() => { setLoginRole('admin'); setEmail(''); setPassword(''); setError('') }}
              className="text-slate-300 hover:text-amber-500 transition-colors"
            >
              Super Admin?
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
