import { db } from './db'
import type { Case, Client, DiaryEntry, CaseParty } from '@/types'

export interface SearchResult {
  type: 'case' | 'client' | 'diary' | 'party'
  label: string
  subtitle: string
  href: string
  icon: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: SearchResult[] = []

  const [cases, clients, entries] = await Promise.all([
    db.getCases(),
    db.getClients(),
    db.getDiaryEntries(),
  ])

  // Search cases
  for (const c of cases) {
    if (
      c.case_number.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.case_type?.toLowerCase().includes(q) ?? false)
    ) {
      results.push({
        type: 'case',
        label: c.case_number,
        subtitle: c.title,
        href: `/cases/${c.id}`,
        icon: 'Briefcase',
      })
    }
  }

  // Search clients
  for (const c of clients) {
    if (
      c.name.toLowerCase().includes(q) ||
      (c.cnic?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.toLowerCase().includes(q) ?? false)
    ) {
      results.push({
        type: 'client',
        label: c.name,
        subtitle: c.cnic ? `CNIC: ${c.cnic}` : c.phone || '',
        href: `/clients/${c.id}`,
        icon: 'Users',
      })
    }
  }

  // Search diary entries
  for (const e of entries) {
    if (
      (e.purpose?.toLowerCase().includes(q) ?? false) ||
      (e.description?.toLowerCase().includes(q) ?? false)
    ) {
      const caseData = cases.find((c) => c.id === e.case_id)
      results.push({
        type: 'diary',
        label: e.purpose || 'Hearing',
        subtitle: `${caseData?.case_number || e.case_id} — ${e.date.slice(0, 10)}`,
        href: `/diary/${e.id}/edit`,
        icon: 'BookOpen',
      })
    }
  }

  // Search parties (requires access to all parties)
  try {
    const allParties = await getAllParties()
    for (const p of allParties) {
      if (p.party_name && p.party_name.toLowerCase().includes(q)) {
        const caseData = cases.find((c) => c.id === p.case_id)
        results.push({
          type: 'party',
          label: p.party_name,
          subtitle: `${p.party_type} in ${caseData?.case_number || p.case_id}`,
          href: `/cases/${p.case_id}`,
          icon: 'Scale',
        })
      }
    }
  } catch {
    // Parties search is optional
  }

  return results.slice(0, 20)
}

async function getAllParties(): Promise<CaseParty[]> {
  const cases = await db.getCases()
  const partyPromises = cases.map((c) => db.getCaseParties(c.id))
  const nested = await Promise.all(partyPromises)
  return nested.flat()
}
