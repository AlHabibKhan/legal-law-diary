import { useEffect, useState } from 'react'
import { supabaseDb } from '@/lib/db-supabase'
import type { PaymentMethod } from '@/types'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [form, setForm] = useState<{
    type: 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'dubai_islamic' | 'nbp' | 'mashreq'
    label: string
    account_name: string
    account_number: string
    mobile_number: string
    bank_name: string
    iban: string
    sort_order: number
  }>({
    type: 'jazzcash',
    label: '',
    account_name: '',
    account_number: '',
    mobile_number: '',
    bank_name: '',
    iban: '',
    sort_order: 0,
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await supabaseDb.getPaymentMethods()
      setMethods(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleSave() {
    try {
      if (editing) {
        await supabaseDb.updatePaymentMethod(editing.id, form)
      } else {
        await supabaseDb.createPaymentMethod(form)
      }
      setShowForm(false)
      setEditing(null)
      resetForm()
      load()
    } catch (e) { console.error(e) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this payment method?')) return
    try {
      await supabaseDb.deletePaymentMethod(id)
      load()
    } catch (e) { console.error(e) }
  }

  function editMethod(m: PaymentMethod) {
    setEditing(m)
    setForm({
      type: m.type,
      label: m.label,
      account_name: m.account_name,
      account_number: m.account_number || '',
      mobile_number: m.mobile_number || '',
      bank_name: m.bank_name || '',
      iban: m.iban || '',
      sort_order: m.sort_order,
    })
    setShowForm(true)
  }

  function resetForm() {
    setForm({ type: 'jazzcash', label: '', account_name: '', account_number: '', mobile_number: '', bank_name: '', iban: '', sort_order: 0 })
  }

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Method
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit' : 'Add'} Payment Method</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'dubai_islamic' | 'nbp' | 'mashreq' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none">
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="nayapay">NayaPay</option>
                <option value="sadapay">SadaPay</option>
                <option value="dubai_islamic">Dubai Islamic Bank</option>
                <option value="nbp">National Bank of Pakistan</option>
                <option value="mashreq">Mashreq Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IBAN</label>
              <input value={form.iban} onChange={e => setForm({ ...form, iban: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              {editing ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Account Name</th>
              <th className="px-4 py-3 font-medium">Account/Mobile</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {methods.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{m.sort_order}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{m.type}</span></td>
                <td className="px-4 py-3">{m.label}</td>
                <td className="px-4 py-3">{m.account_name}</td>
                <td className="px-4 py-3">{m.mobile_number || m.account_number || '-'}</td>
                <td className="px-4 py-3">{m.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => editMethod(m)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payment methods yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
