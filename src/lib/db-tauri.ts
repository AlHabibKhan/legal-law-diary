import Database from '@tauri-apps/plugin-sql'
import type {
  LawyerProfile,
  Court,
  Case,
  Client,
  DiaryEntry,
  Proceeding,
  Document,
  CaseParty,
  DashboardStats,
} from '@/types'

function row<T>(rows: Record<string, unknown>[], fallback: T): T {
  return (rows.length > 0 ? rows[0] : fallback) as T
}

let _db: Database | null = null

async function db(): Promise<Database> {
  if (!_db) {
    _db = await Database.load('sqlite:legal_law_diary.db')
  }
  return _db
}

export const tauriDb = {
  async registerLawyer(profile: LawyerProfile): Promise<string> {
    const d = await db()
    await d.execute(
      `INSERT INTO lawyer_profile (id, full_name, bar_council, license_number, mobile_number, cnic, chamber_address, practice_areas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [profile.id, profile.full_name, profile.bar_council, profile.license_number, profile.mobile_number, profile.cnic ?? '', profile.chamber_address ?? '', profile.practice_areas ?? '']
    )
    await d.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('is_registered', 'true')", [])
    return profile.id
  },

  async getLawyerProfile(): Promise<LawyerProfile | null> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      'SELECT id, full_name, bar_council, license_number, mobile_number, cnic, chamber_address, practice_areas FROM lawyer_profile LIMIT 1'
    )
    if (rows.length === 0) return null
    const r = rows[0]
    return {
      id: r.id as string,
      full_name: r.full_name as string,
      bar_council: r.bar_council as string,
      license_number: r.license_number as string,
      mobile_number: r.mobile_number as string,
      cnic: (r.cnic as string) || null,
      chamber_address: (r.chamber_address as string) || null,
      practice_areas: (r.practice_areas as string) || null,
    }
  },

  async updateLawyerProfile(profile: LawyerProfile): Promise<void> {
    const d = await db()
    await d.execute(
      `UPDATE lawyer_profile SET full_name=$1, bar_council=$2, license_number=$3, mobile_number=$4, cnic=$5, chamber_address=$6, practice_areas=$7, updated_at=datetime('now') WHERE id=$8`,
      [profile.full_name, profile.bar_council, profile.license_number, profile.mobile_number, profile.cnic ?? '', profile.chamber_address ?? '', profile.practice_areas ?? '', profile.id]
    )
  },

  async isRegistered(): Promise<boolean> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      "SELECT value FROM app_settings WHERE key='is_registered'"
    )
    return rows.length > 0 && rows[0].value === 'true'
  },

  async verifyPin(pin: string): Promise<boolean> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      "SELECT value FROM app_settings WHERE key='pin_hash'"
    )
    if (rows.length === 0) return true
    return (rows[0].value as string) === pin
  },

  async setPin(pin: string): Promise<void> {
    const d = await db()
    await d.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('pin_hash', $1)", [pin])
  },

  async getCourts(parentId?: string): Promise<Court[]> {
    const d = await db()
    if (parentId) {
      return d.select<Court[]>(
        'SELECT id, name, type, level, parent_id, city, province FROM courts WHERE parent_id=$1 ORDER BY name',
        [parentId]
      )
    }
    return d.select<Court[]>(
      'SELECT id, name, type, level, parent_id, city, province FROM courts WHERE parent_id IS NULL ORDER BY name'
    )
  },

  async searchCourts(query: string): Promise<Court[]> {
    const d = await db()
    const pattern = `%${query}%`
    return d.select<Court[]>(
      'SELECT id, name, type, level, parent_id, city, province FROM courts WHERE name LIKE $1 OR city LIKE $1 ORDER BY name LIMIT 50',
      [pattern]
    )
  },

  async getCases(status?: string): Promise<Case[]> {
    const d = await db()
    if (status) {
      return d.select<Case[]>(
        'SELECT id, case_number, title, case_type, court_id, division, judge_id, filing_date, status, description, remarks FROM cases WHERE status=$1 ORDER BY updated_at DESC',
        [status]
      )
    }
    return d.select<Case[]>(
      'SELECT id, case_number, title, case_type, court_id, division, judge_id, filing_date, status, description, remarks FROM cases ORDER BY updated_at DESC'
    )
  },

  async createCase(caseData: Case): Promise<string> {
    const d = await db()
    await d.execute(
      'INSERT INTO cases (id, case_number, title, case_type, court_id, division, judge_id, filing_date, description, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [caseData.id, caseData.case_number, caseData.title, caseData.case_type ?? '', caseData.court_id ?? '', caseData.division ?? '', caseData.judge_id ?? '', caseData.filing_date ?? '', caseData.description ?? '', caseData.remarks ?? '']
    )
    return caseData.id
  },

  async getCase(id: string): Promise<Case | null> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      'SELECT id, case_number, title, case_type, court_id, division, judge_id, filing_date, status, description, remarks FROM cases WHERE id=$1',
      [id]
    )
    if (rows.length === 0) return null
    return rows[0] as unknown as Case
  },

  async updateCase(caseData: Case): Promise<void> {
    const d = await db()
    await d.execute(
      'UPDATE cases SET case_number=$1, title=$2, case_type=$3, court_id=$4, division=$5, judge_id=$6, filing_date=$7, status=$8, description=$9, remarks=$10, updated_at=datetime(\'now\') WHERE id=$11',
      [caseData.case_number, caseData.title, caseData.case_type ?? '', caseData.court_id ?? '', caseData.division ?? '', caseData.judge_id ?? '', caseData.filing_date ?? '', caseData.status, caseData.description ?? '', caseData.remarks ?? '', caseData.id]
    )
  },

  async getClients(): Promise<Client[]> {
    const d = await db()
    return d.select<Client[]>('SELECT id, name, cnic, phone, email, address, notes FROM clients ORDER BY name')
  },

  async createClient(client: Client): Promise<void> {
    const d = await db()
    await d.execute(
      'INSERT INTO clients (id, name, cnic, phone, email, address, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [client.id, client.name, client.cnic ?? '', client.phone ?? '', client.email ?? '', client.address ?? '', client.notes ?? '']
    )
  },

  async getClient(id: string): Promise<Client | null> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      'SELECT id, name, cnic, phone, email, address, notes FROM clients WHERE id=$1',
      [id]
    )
    if (rows.length === 0) return null
    const r = rows[0]
    return {
      id: r.id as string,
      name: r.name as string,
      cnic: (r.cnic as string) || null,
      phone: (r.phone as string) || null,
      email: (r.email as string) || null,
      address: (r.address as string) || null,
      notes: (r.notes as string) || null,
    }
  },

  async getDiaryEntries(date?: string): Promise<DiaryEntry[]> {
    const d = await db()
    if (date) {
      return d.select<DiaryEntry[]>(
        'SELECT id, case_id, date, court_id, division, judge_id, purpose, description, status, remarks, reminder_minutes, reminder_sent FROM diary_entries WHERE date=$1 ORDER BY created_at',
        [date]
      )
    }
    return d.select<DiaryEntry[]>(
      'SELECT id, case_id, date, court_id, division, judge_id, purpose, description, status, remarks, reminder_minutes, reminder_sent FROM diary_entries ORDER BY date DESC LIMIT 100'
    )
  },

  async getDiaryEntriesByDateRange(fromDate: string, toDate: string): Promise<DiaryEntry[]> {
    const d = await db()
    return d.select<DiaryEntry[]>(
      'SELECT id, case_id, date, court_id, division, judge_id, purpose, description, status, remarks, reminder_minutes, reminder_sent FROM diary_entries WHERE date>=$1 AND date<=$2 ORDER BY date, purpose',
      [fromDate, toDate]
    )
  },

  async getUpcomingEntries(limit: number): Promise<DiaryEntry[]> {
    const d = await db()
    const today = new Date().toISOString().slice(0, 10)
    return d.select<DiaryEntry[]>(
      'SELECT id, case_id, date, court_id, division, judge_id, purpose, description, status, remarks, reminder_minutes, reminder_sent FROM diary_entries WHERE date>=$1 ORDER BY date LIMIT $2',
      [today, limit]
    )
  },

  async createDiaryEntry(entry: DiaryEntry): Promise<string> {
    const d = await db()
    await d.execute(
      'INSERT INTO diary_entries (id, case_id, date, court_id, division, judge_id, purpose, description, status, remarks, reminder_minutes, reminder_sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [entry.id, entry.case_id, entry.date, entry.court_id ?? '', entry.division ?? '', entry.judge_id ?? '', entry.purpose ?? '', entry.description ?? '', entry.status, entry.remarks ?? '', entry.reminder_minutes ?? 0, entry.reminder_sent ? 1 : 0]
    )
    return entry.id
  },

  async updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    const d = await db()
    await d.execute(
      `UPDATE diary_entries SET case_id=$1, date=$2, court_id=$3, division=$4, judge_id=$5, purpose=$6, description=$7, status=$8, remarks=$9, reminder_minutes=$10, reminder_sent=$11, updated_at=datetime('now') WHERE id=$12`,
      [entry.case_id, entry.date, entry.court_id ?? '', entry.division ?? '', entry.judge_id ?? '', entry.purpose ?? '', entry.description ?? '', entry.status, entry.remarks ?? '', entry.reminder_minutes ?? 0, entry.reminder_sent ? 1 : 0, entry.id]
    )
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const d = await db()
    await d.execute('DELETE FROM diary_entries WHERE id=$1', [id])
  },

  async createProceeding(data: Proceeding): Promise<string> {
    const d = await db()
    await d.execute(
      'INSERT INTO proceedings (id, case_id, date, proceeding_type, order_summary, next_date, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [data.id, data.case_id, data.date, data.proceeding_type ?? '', data.order_summary ?? '', data.next_date ?? '', data.remarks ?? '']
    )
    return data.id
  },

  async getProceedings(caseId: string): Promise<Proceeding[]> {
    const d = await db()
    return d.select<Proceeding[]>(
      'SELECT id, case_id, date, proceeding_type, order_summary, next_date, remarks FROM proceedings WHERE case_id=$1 ORDER BY date DESC',
      [caseId]
    )
  },

  async deleteProceeding(id: string): Promise<void> {
    const d = await db()
    await d.execute('DELETE FROM proceedings WHERE id=$1', [id])
  },

  async addCaseParty(data: CaseParty): Promise<string> {
    const d = await db()
    await d.execute(
      'INSERT INTO case_parties (id, case_id, party_type, party_name, client_id, is_client) VALUES ($1,$2,$3,$4,$5,$6)',
      [data.id, data.case_id, data.party_type, data.party_name ?? '', data.client_id ?? '', data.is_client ? 1 : 0]
    )
    return data.id
  },

  async getCaseParties(caseId: string): Promise<CaseParty[]> {
    const d = await db()
    const rows = await d.select<Record<string, unknown>[]>(
      'SELECT id, case_id, party_type, party_name, client_id, is_client FROM case_parties WHERE case_id=$1 ORDER BY party_type',
      [caseId]
    )
    return rows.map((r) => ({
      id: r.id as string,
      case_id: r.case_id as string,
      party_type: r.party_type as string,
      party_name: (r.party_name as string) || null,
      client_id: (r.client_id as string) || null,
      is_client: (r.is_client as number) === 1,
    }))
  },

  async removeCaseParty(id: string): Promise<void> {
    const d = await db()
    await d.execute('DELETE FROM case_parties WHERE id=$1', [id])
  },

  async saveDocument(data: Document): Promise<string> {
    const d = await db()
    await d.execute(
      'INSERT INTO documents (id, case_id, name, type, file_path, file_size, mime_type, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [data.id, data.case_id, data.name, data.type ?? '', data.file_path ?? '', data.file_size ?? 0, data.mime_type ?? '', data.notes ?? '']
    )
    return data.id
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    const d = await db()
    return d.select<Document[]>(
      'SELECT id, case_id, name, type, file_path, file_size, mime_type, notes FROM documents WHERE case_id=$1 ORDER BY created_at DESC',
      [caseId]
    )
  },

  async deleteDocument(id: string): Promise<void> {
    const d = await db()
    await d.execute('DELETE FROM documents WHERE id=$1', [id])
  },

  async getClientCases(clientId: string): Promise<Case[]> {
    const d = await db()
    return d.select<Case[]>(
       `SELECT c.id, c.case_number, c.title, c.case_type, c.court_id, c.division, c.judge_id, c.filing_date, c.status, c.description, c.remarks
       FROM cases c INNER JOIN case_parties cp ON cp.case_id = c.id WHERE cp.client_id=$1 ORDER BY c.updated_at DESC`,
      [clientId]
    )
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const d = await db()
    const today = new Date().toISOString().slice(0, 10)

    const totalRows = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM cases')
    const activeRows = await d.select<{ count: number }[]>("SELECT COUNT(*) as count FROM cases WHERE status='Active'")
    const todayRows = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM diary_entries WHERE date=$1', [today])
    const upcomingRows = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM diary_entries WHERE date>$1', [today])
    const clientRows = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM clients')

    return {
      total_cases: totalRows[0]?.count ?? 0,
      active_cases: activeRows[0]?.count ?? 0,
      today_hearings: todayRows[0]?.count ?? 0,
      upcoming_hearings: upcomingRows[0]?.count ?? 0,
      total_clients: clientRows[0]?.count ?? 0,
      pending_tasks: 0,
      todays_time_minutes: 0,
    }
  },
}
