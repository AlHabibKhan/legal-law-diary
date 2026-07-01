import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { db, checkConnection, getConnectionStatus } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select } from '@/components/ui/select'
import { Scale, Shield, Download, Upload, LogOut, CheckCircle, AlertCircle, Cloud, CloudOff, Database, RefreshCw, AlertTriangle } from 'lucide-react'
import { BAR_COUNCILS } from '@/types'
import { validateLicenseNumber, validateMobileNumber } from '@/lib/utils'
import { exportBackup, importBackup } from '@/lib/backup'

const BACKUP_KEY = 'ld:last_backup_at'

function getLastBackup(): string | null {
  const val = localStorage.getItem(BACKUP_KEY)
  return val ? new Date(parseInt(val)).toLocaleDateString() : null
}

function getDaysSinceLastBackup(): number | null {
  const val = localStorage.getItem(BACKUP_KEY)
  if (!val) return null
  return Math.floor((Date.now() - parseInt(val)) / 86400000)
}

export default function Settings() {
  const { profile, setProfile, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(getLastBackup)
  const [daysSinceBackup, setDaysSinceBackup] = useState<number | null>(getDaysSinceLastBackup)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    bar_council: profile?.bar_council ?? 'PBC',
    license_number: profile?.license_number ?? '',
    mobile_number: profile?.mobile_number ?? '',
    cnic: profile?.cnic ?? '',
    chamber_address: profile?.chamber_address ?? '',
    practice_areas: profile?.practice_areas ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const [online, setOnline] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrateStatus, setMigrateStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkConnection().then(setOnline)
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session))
  }, [])

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required'

    const licenseCheck = validateLicenseNumber(form.bar_council, form.license_number)
    if (!licenseCheck.valid) e.license_number = licenseCheck.error!

    const mobileCheck = validateMobileNumber(form.mobile_number)
    if (!mobileCheck.valid) e.mobile_number = mobileCheck.error!

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSaveProfile() {
    if (!validate()) return

    if (profile) {
      const updated = { ...profile, ...form }
      try {
        await db.updateLawyerProfile(updated)
      } catch {
        // fallback: update local state only
      }
      setProfile(updated)
    }
    setEditing(false)
  }

  async function handleExport() {
    await exportBackup()
    localStorage.setItem(BACKUP_KEY, String(Date.now()))
    setLastBackup(new Date().toLocaleDateString())
    setDaysSinceBackup(0)
  }

  async function handleImport(file: File) {
    setImporting(true)
    setImportStatus(null)

    const result = await importBackup(file)

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Imported ${result.entryCount} records successfully. Refreshing...`,
      })
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Import failed' })
    }

    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImport(file)
  }

  async function handleMigrate() {
    setMigrating(true)
    setMigrateStatus(null)

    try {
      const raw = localStorage
      const PREFIX = 'ld:'

      const profileData = (() => {
        try {
          const r = raw.getItem(PREFIX + 'lawyer_profile')
          return r ? JSON.parse(r) : null
        } catch { return null }
      })()

      const getCol = <T,>(key: string): T[] => {
        try {
          const r = raw.getItem(PREFIX + key)
          return r ? JSON.parse(r) : []
        } catch { return [] }
      }

      if (profileData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          profileData.id = user.id
          await db.registerLawyer(profileData)
        }
      }

      const cases = getCol<any>('cases')
      const clients = getCol<any>('clients')
      const entries = getCol<any>('diary_entries')
      const proceedings = getCol<any>('proceedings')
      const parties = getCol<any>('parties')
      const documents = getCol<any>('documents')

      for (const c of cases) await db.createCase(c).catch(() => {})
      for (const c of clients) await db.createClient(c).catch(() => {})
      for (const e of entries) await db.createDiaryEntry(e).catch(() => {})
      for (const p of proceedings) await db.createProceeding(p).catch(() => {})
      for (const p of parties) await db.addCaseParty(p).catch(() => {})
      for (const d of documents) await db.saveDocument(d).catch(() => {})

      const total = cases.length + clients.length + entries.length + proceedings.length + parties.length + documents.length

      setMigrateStatus({
        type: 'success',
        message: `Migrated ${total} records to cloud!`,
      })
    } catch (err) {
      setMigrateStatus({
        type: 'error',
        message: 'Migration failed. Are you signed in?',
      })
    }

    setMigrating(false)
  }

  async function handleChangePassword() {
    setPasswordError('')
    if (passwordForm.newPass.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    localStorage.setItem('app_password', passwordForm.newPass)

    if (hasSession) {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass })
      if (error) {
        // Cloud update failed but local save succeeded
        setPasswordError('Cloud update failed: ' + error.message + '. Password saved locally.')
        setPasswordLoading(false)
        return
      }
    }

    setPasswordForm({ current: '', newPass: '', confirm: '' })
    setShowPasswordSection(false)
    setPasswordLoading(false)
  }

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Cloud Sync Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {online ? (
                <Cloud size={18} className="text-blue-600" />
              ) : (
                <CloudOff size={18} className="text-slate-400" />
              )}
              <CardTitle>Cloud Sync</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => checkConnection().then(setOnline)}>
              <RefreshCw size={14} className="mr-1" /> Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            {online ? (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-green-700">Connected to cloud — data synced</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-amber-500" />
                <span className="text-amber-600">Offline — data stored locally only</span>
              </>
            )}
          </div>

          {online && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={handleMigrate} disabled={migrating}>
                <Database size={14} className="mr-1" />
                {migrating ? 'Migrating...' : 'Migrate localStorage to Cloud'}
              </Button>
              {migrateStatus && (
                <div className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  migrateStatus.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                  {migrateStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {migrateStatus.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-blue-600" />
              <CardTitle>Lawyer Profile</CardTitle>
            </div>
            <Button
              variant={editing ? 'primary' : 'outline'}
              size="sm"
              onClick={editing ? handleSaveProfile : () => setEditing(true)}
            >
              {editing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <Input
                label="Full Name"
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                error={errors.full_name}
              />
              <Select
                label="Bar Council"
                options={BAR_COUNCILS.map((bc) => ({ value: bc.value, label: bc.label }))}
                value={form.bar_council}
                onChange={(e) => updateField('bar_council', e.target.value)}
              />
              <Input
                label="License Number"
                value={form.license_number}
                onChange={(e) => updateField('license_number', e.target.value)}
                error={errors.license_number}
              />
              <Input
                label="Mobile Number"
                value={form.mobile_number}
                onChange={(e) => updateField('mobile_number', e.target.value)}
                error={errors.mobile_number}
              />
              <Input
                label="CNIC / ID Card Number"
                value={form.cnic}
                onChange={(e) => updateField('cnic', e.target.value)}
              />
              <Input
                label="Chamber Address"
                value={form.chamber_address}
                onChange={(e) => updateField('chamber_address', e.target.value)}
              />
              <Input
                label="Practice Areas"
                value={form.practice_areas}
                onChange={(e) => updateField('practice_areas', e.target.value)}
              />
              {editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="text-sm font-medium text-slate-900">
                    {profile?.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bar Council</p>
                  <p className="text-sm font-medium text-slate-900">
                    {profile?.bar_council}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">License Number</p>
                  <p className="text-sm font-medium text-slate-900">
                    {profile?.license_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="text-sm font-medium text-slate-900">
                    {profile?.mobile_number}
                  </p>
                </div>
                {profile?.cnic && (
                  <div>
                    <p className="text-xs text-slate-500">CNIC</p>
                    <p className="text-sm font-medium text-slate-900">
                      {profile.cnic}
                    </p>
                  </div>
                )}
                {profile?.chamber_address && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Chamber</p>
                    <p className="text-sm text-slate-700">
                      {profile.chamber_address}
                    </p>
                  </div>
                )}
                {profile?.practice_areas && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Practice Areas</p>
                    <p className="text-sm text-slate-700">
                      {profile.practice_areas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPasswordSection ? (
            <>
              <PasswordInput
                label="New Password"
                placeholder="Minimum 6 characters"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => { setShowPasswordSection(false); setPasswordError('') }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
              {!hasSession && (
                <p className="text-xs text-slate-400 text-center">Password saved locally (offline mode)</p>
              )}
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowPasswordSection(true)}>
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download size={18} className="text-blue-600" />
            <CardTitle>Data Backup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">Regular backups are strongly recommended</p>
                <p className="mt-0.5 text-amber-700">
                  Your case data, diary entries, and documents are stored locally and/or in the cloud.
                  Unexpected data loss can occur due to device failure, accidental deletion, or sync issues.
                  <strong> Export a backup file at least weekly</strong> and store it in a safe location.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {lastBackup ? (
              <span className="flex items-center gap-1.5 text-slate-600">
                <CheckCircle size={14} className="text-green-500" />
                Last backup: <strong>{lastBackup}</strong>
                {daysSinceBackup !== null && daysSinceBackup > 7 && (
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {daysSinceBackup} days ago
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle size={14} />
                No backup yet
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500">
            Export your entire case diary database to your local drive as a JSON file, or import from a local backup file.
          </p>

          {importStatus && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                importStatus.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {importStatus.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-1" /> Export to Local Drive
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} className="mr-1" /> {importing ? 'Importing...' : 'Import from Local Drive'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut size={14} className="mr-1" /> Sign Out & Lock
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
