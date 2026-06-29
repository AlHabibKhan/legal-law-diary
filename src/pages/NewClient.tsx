import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/db'
import { generateId, validateCNIC } from '@/lib/utils'

export default function NewClient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.cnic) {
      const cnicCheck = validateCNIC(form.cnic)
      if (!cnicCheck.valid) e.cnic = cnicCheck.error!
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await db.createClient({
      id: generateId(),
      name: form.name,
      cnic: form.cnic || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
    })
    navigate('/clients')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">New Client</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="Client's full name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              id="cnic"
              label="CNIC"
              placeholder="XXXXX-XXXXXXX-X"
              value={form.cnic}
              onChange={(e) => updateField('cnic', e.target.value)}
              error={errors.cnic}
            />

            <Input
              id="phone"
              label="Phone Number"
              placeholder="03XX-XXXXXXX"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <Input
              id="email"
              label="Email (optional)"
              type="email"
              placeholder="client@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />

            <Input
              id="address"
              label="Address (optional)"
              placeholder="Client's address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any notes about this client"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/clients')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Register Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
