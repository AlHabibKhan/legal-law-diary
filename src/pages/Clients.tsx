import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus } from 'lucide-react'
import { db } from '@/lib/db'
import type { Client } from '@/types'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    db.getClients().then(setClients)
  }, [])
  const [search, setSearch] = useState('')

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone?.includes(search) ?? false)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <a href="/clients/new">
          <Button>
            <Plus size={16} className="mr-1" /> New Client
          </Button>
        </a>
      </div>

      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              {search ? 'No clients match your search' : 'No clients yet'}
            </p>
            <a href="/clients/new" className="mt-3">
              <Button variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Add First Client
              </Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle className="text-base">{client.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {client.phone && (
                  <p className="text-sm text-slate-600">{client.phone}</p>
                )}
                {client.cnic && (
                  <p className="text-xs text-slate-400">CNIC: {client.cnic}</p>
                )}
                {client.email && (
                  <p className="text-xs text-slate-400">{client.email}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
