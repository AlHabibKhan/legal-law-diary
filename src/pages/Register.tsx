import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select } from '@/components/ui/select'
import { AdBanner } from '@/components/ads/AdBanner'
import {
  Scale,
  BookOpen,
  CalendarCheck,
  Users,
  FileText,
  Gavel,
  BarChart3,
  ShieldCheck,
  Lock,
  Building2,
  User,
  ArrowRight,
  Smartphone,
  Mail,
} from 'lucide-react'
import { BAR_COUNCILS } from '@/types'
import { db } from '@/lib/db'
import { checkConnection } from '@/lib/db'
import {
  validateLicenseNumber,
  validateMobileNumber,
  generateId,
} from '@/lib/utils'
import type { LawyerProfile } from '@/types'

type RegisterRole = 'individual' | 'firm'

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

export default function Register() {
  const { setProfile, setRegistered, setAuthenticated, initialize } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const defaultRole = (searchParams.get('role') as RegisterRole) || 'individual'
  const [registerRole, setRegisterRole] = useState<RegisterRole>(defaultRole)
  const [step, setStep] = useState(1)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    bar_council: 'PBC',
    license_number: '',
    mobile_number: '',
    cnic: '',
    chamber_address: '',
    practice_areas: '',
  })
  const [firmForm, setFirmForm] = useState({
    firm_name: '',
    firm_email: '',
    firm_phone: '',
    firm_address: '',
    your_name: '',
    your_mobile: '',
    firm_cnic: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function updateFirmField(key: string, value: string) {
    setFirmForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {}

    if (registerRole === 'individual') {
      if (!form.full_name.trim()) e.full_name = 'Full name is required'
      const licenseCheck = validateLicenseNumber(form.bar_council, form.license_number)
      if (!licenseCheck.valid) e.license_number = licenseCheck.error!
      const mobileCheck = validateMobileNumber(form.mobile_number)
      if (!mobileCheck.valid) e.mobile_number = mobileCheck.error!
    } else {
      if (!firmForm.firm_name.trim()) e.firm_name = 'Firm name is required'
      if (!firmForm.firm_email.trim()) e.firm_email = 'Firm email is required'
      if (!firmForm.your_name.trim()) e.your_name = 'Your name is required'
      const mobileCheck = validateMobileNumber(firmForm.your_mobile)
      if (!mobileCheck.valid) e.your_mobile = mobileCheck.error!
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {}
    if (authMethod === 'email') {
      if (!email.trim()) e.email = 'Email is required'
    } else {
      if (!phone.trim()) e.email = 'Phone number is required'
    }
    if (password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {}
    if (pin.length < 4) e.pin = 'PIN must be at least 4 digits'
    if (pin !== confirmPin) e.confirmPin = 'PINs do not match'
    if (!agreedToTerms) e.pin = 'You must agree to the terms and disclaimer'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (step === 1 && registerRole === 'individual' && !validateStep1()) return
    if (step === 1 && registerRole === 'firm' && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return

    if (step === 1) { setStep(2); return }
    if (step === 2) { setStep(3); return }

    setSubmitting(true)

    try {
      await checkConnection()
      const authIdentifier = authMethod === 'email' ? { email: email.trim() } : { phone: phone.trim() }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        ...authIdentifier,
        password,
      })

      // Sign in immediately to establish the real Supabase session
      await supabase.auth.signInWithPassword({ ...authIdentifier, password }).catch(() => {})

      const userId = authData?.user?.id || generateId()
      let profile: LawyerProfile

      if (registerRole === 'individual') {
        profile = {
          id: userId,
          ...form,
          cnic: form.cnic || null,
          chamber_address: form.chamber_address || null,
          practice_areas: form.practice_areas || null,
        }
        if (!authError && authData?.user) {
          await db.registerLawyer(profile)
        } else {
          await db.registerLawyer(profile)
        }
        setProfile(profile)
      } else {
        profile = {
          id: userId,
          full_name: firmForm.your_name,
          bar_council: 'PBC',
          license_number: '',
          mobile_number: firmForm.your_mobile,
          cnic: firmForm.firm_cnic || null,
          chamber_address: firmForm.firm_address || null,
          practice_areas: null,
        }
        if (!authError && authData?.user) {
          await db.registerLawyer(profile)
        } else {
          await db.registerLawyer(profile)
        }
        setProfile(profile)
      }

      db.setPin(pin)
      localStorage.setItem('app_password', password)
      localStorage.setItem('lawyer_profile', JSON.stringify(profile))
      localStorage.setItem('is_registered', 'true')
      setRegistered(true)
      setAuthenticated(true)
      db.syncOnLogin().catch(() => {})
    } catch (err) {
      console.error(err)
    }

    setSubmitting(false)
  }

  function renderStep1() {
    if (registerRole === 'individual') {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Lawyer Details</h2>

          <Input
            id="full_name"
            label="Full Name"
            placeholder="e.g., Muhammad Ali"
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            error={errors.full_name}
          />

          <Select
            id="bar_council"
            label="Bar Council"
            options={BAR_COUNCILS.map((bc) => ({ value: bc.value, label: bc.label }))}
            value={form.bar_council}
            onChange={(e) => updateField('bar_council', e.target.value)}
          />

          <Input
            id="license_number"
            label="License Number"
            placeholder={`e.g., ${form.bar_council}-12345`}
            value={form.license_number}
            onChange={(e) => updateField('license_number', e.target.value)}
            error={errors.license_number}
          />

          <Input
            id="mobile_number"
            label="Mobile Number"
            placeholder="e.g., 0300-1234567"
            value={form.mobile_number}
            onChange={(e) => updateField('mobile_number', e.target.value)}
            error={errors.mobile_number}
          />

          <Input
            id="cnic"
            label="CNIC / ID Card Number"
            placeholder="xxxxx-xxxxxxx-x"
            value={form.cnic}
            onChange={(e) => updateField('cnic', e.target.value)}
          />

          <Input
            id="chamber_address"
            label="Chamber Address (optional)"
            placeholder="e.g., District Courts, Lahore"
            value={form.chamber_address}
            onChange={(e) => updateField('chamber_address', e.target.value)}
          />

          <Input
            id="practice_areas"
            label="Practice Areas (optional)"
            placeholder="e.g., Civil, Criminal, Family"
            value={form.practice_areas}
            onChange={(e) => updateField('practice_areas', e.target.value)}
          />

          <Button className="w-full" onClick={handleSubmit}>
            Next: Create Account <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Firm Details</h2>
        <p className="text-sm text-slate-500">Register your law firm. You will be the firm admin.</p>

        <Input
          id="firm_name"
          label="Firm Name"
          placeholder="e.g., Khan & Associates"
          value={firmForm.firm_name}
          onChange={(e) => updateFirmField('firm_name', e.target.value)}
          error={errors.firm_name}
        />

        <Input
          id="firm_email"
          label="Firm Email"
          type="email"
          placeholder="firm@example.com"
          value={firmForm.firm_email}
          onChange={(e) => updateFirmField('firm_email', e.target.value)}
          error={errors.firm_email}
        />

        <Input
          id="firm_phone"
          label="Firm Phone (optional)"
          placeholder="e.g., 042-1112233"
          value={firmForm.firm_phone}
          onChange={(e) => updateFirmField('firm_phone', e.target.value)}
        />

        <Input
          id="firm_address"
          label="Firm Address (optional)"
          placeholder="e.g., 5th Floor, Legal Plaza, Lahore"
          value={firmForm.firm_address}
          onChange={(e) => updateFirmField('firm_address', e.target.value)}
        />

        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Your Details (Firm Admin)</h3>

          <Input
            id="your_name"
            label="Your Full Name"
            placeholder="e.g., Ahmad Khan"
            value={firmForm.your_name}
            onChange={(e) => updateFirmField('your_name', e.target.value)}
            error={errors.your_name}
          />

          <Input
            id="your_mobile"
            label="Your Mobile Number"
            placeholder="e.g., 0300-1234567"
            value={firmForm.your_mobile}
            onChange={(e) => updateFirmField('your_mobile', e.target.value)}
            error={errors.your_mobile}
          />

          <Input
            id="firm_cnic"
            label="Your CNIC / ID Card Number"
            placeholder="xxxxx-xxxxxxx-x"
            value={firmForm.firm_cnic || ''}
            onChange={(e) => updateFirmField('firm_cnic', e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          Next: Create Account <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Legal Law Diary
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete practice management for Pakistan courts
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setRegisterRole('individual'); setStep(1) }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              registerRole === 'individual'
                ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <User size={18} className={registerRole === 'individual' ? 'text-blue-600' : 'text-slate-400'} />
            Individual Lawyer
          </button>
          <button
            onClick={() => { setRegisterRole('firm'); setStep(1) }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              registerRole === 'firm'
                ? 'border-purple-300 bg-purple-50 text-purple-800 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <Building2 size={18} className={registerRole === 'firm' ? 'text-purple-600' : 'text-slate-400'} />
            Law Firm
          </button>
        </div>

        <AdBanner adKey="xpdt49gn" height={90} width={728} className="mx-auto mb-2" />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 1 && renderStep1()}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Account Setup</h2>
              <p className="text-sm text-slate-500">
                Create your cloud account to sync data across devices.
              </p>

              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setErrors({}) }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    authMethod === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mail size={14} /> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setErrors({}) }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    authMethod === 'phone' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone size={14} /> Phone
                </button>
              </div>

              {authMethod === 'email' ? (
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="lawyer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              ) : (
                <Input
                  id="phone"
                  label="Mobile Number"
                  type="tel"
                  placeholder={form.mobile_number || 'e.g. 0300-1234567'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}

              <PasswordInput
                id="password"
                label="Password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  Next: Set PIN
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Set App PIN</h2>
              <p className="text-sm text-slate-500">
                Set a device PIN to protect your data. You'll need this to unlock the app.
              </p>

              <PasswordInput
                id="pin"
                label="PIN (4+ digits)"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.pin}
              />

              <PasswordInput
                id="confirm_pin"
                label="Confirm PIN"
                placeholder="Re-enter PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.confirmPin}
              />

              <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I understand this is a <strong>practice management tool</strong> and not a substitute for professional legal advice. I am responsible for the accuracy of my data. I agree to <strong>back up my data regularly</strong> to prevent loss. I accept the{' '}
                  <a href="/legal" target="_blank" className="text-blue-600 underline">Terms of Service</a> and{' '}
                  <a href="/legal#privacy" target="_blank" className="text-blue-600 underline">Privacy Policy</a>.
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <AdBanner adKey="xpdt49gn" height={250} width={300} className="mx-auto" />

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
