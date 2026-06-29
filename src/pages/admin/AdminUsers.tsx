import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Shield, ShieldOff } from 'lucide-react'

interface UserRow {
  id: string
  email: string
  full_name: string
  bar_council: string
  role: string
  account_status: string
  trial_ends_at: string | null
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    const enriched: UserRow[] = []
    for (const p of data || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(p.id)
      enriched.push({
        id: p.id,
        email: userData?.user?.email ?? 'unknown',
        full_name: p.full_name,
        bar_council: p.bar_council,
        role: p.role,
        account_status: p.account_status,
        trial_ends_at: p.trial_ends_at,
        created_at: p.created_at,
      })
    }
    setUsers(enriched)
    setLoading(false)
  }

  async function toggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', userId)
    loadUsers()
  }

  async function makeAdmin(userId: string, isAdmin: boolean) {
    await supabase
      .from('profiles')
      .update({ role: isAdmin ? 'lawyer' : 'admin' })
      .eq('id', userId)
    loadUsers()
  }

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">User Management</h1>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Trial End</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'danger' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.account_status === 'active' ? 'success' : 'warning'}>
                      {u.account_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(u.id, u.account_status)}
                        title={u.account_status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {u.account_status === 'active' ? (
                          <ShieldOff size={14} />
                        ) : (
                          <Shield size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => makeAdmin(u.id, u.role === 'admin')}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
