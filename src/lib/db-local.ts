import { getPakistaniCourts } from '@/lib/court-data'
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
  TimeEntry,
  Task,
  Notice,
  Summons,
  OrderCopyRequest,
  PersonalNote,
  LegalReference,
} from '@/types'

const PREFIX = 'ld:'

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function setItem(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

function getCollection<T>(key: string): T[] {
  return getItem<T[]>(key, [])
}

function saveCollection<T>(key: string, data: T[]): void {
  setItem(key, data)
}

export const localDb = {

  // ===== Lawyer Profile =====

  async registerLawyer(profile: LawyerProfile): Promise<string> {
    setItem('lawyer_profile', profile)
    localStorage.setItem('is_registered', 'true')
    return profile.id
  },

  async getLawyerProfile(): Promise<LawyerProfile | null> {
    return getItem<LawyerProfile | null>('lawyer_profile', null)
  },

  async updateLawyerProfile(profile: LawyerProfile): Promise<void> {
    setItem('lawyer_profile', profile)
  },

  // ===== Auth =====

  async getProfileByPhone(phone: string): Promise<LawyerProfile | null> {
    const stored = localStorage.getItem('lawyer_profile') || localStorage.getItem('ld:lawyer_profile')
    if (!stored) return null
    try {
      const profile = JSON.parse(stored) as LawyerProfile
      const stripped = phone.replace(/[\s\-\(\)]/g, '')
      const storedPhone = (profile.mobile_number || '').replace(/[\s\-\(\)]/g, '')
      return storedPhone === stripped ? profile : null
    } catch {
      return null
    }
  },

  async isRegistered(): Promise<boolean> {
    return localStorage.getItem('is_registered') === 'true'
  },

  async verifyPin(pin: string): Promise<boolean> {
    const stored = localStorage.getItem('app_pin')
    return stored === pin
  },

  async setPin(pin: string): Promise<void> {
    localStorage.setItem('app_pin', pin)
  },

  // ===== Courts (static data) =====

  async getCourts(parentId?: string): Promise<Court[]> {
    const all = getPakistaniCourts()
    if (!parentId) return all.filter((c) => !c.parent_id)
    return all.filter((c) => c.parent_id === parentId)
  },

  async searchCourts(query: string): Promise<Court[]> {
    const all = getPakistaniCourts()
    const q = query.toLowerCase()
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city?.toLowerCase().includes(q) ?? false) ||
        (c.province?.toLowerCase().includes(q) ?? false)
    )
  },

  // ===== Cases =====

  async getCases(status?: string): Promise<Case[]> {
    const all = getCollection<Case>('cases')
    if (status) return all.filter((c) => c.status === status)
    return all.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
  },

  async createCase(caseData: Case): Promise<string> {
    const all = getCollection<Case>('cases')
    all.push(caseData)
    saveCollection('cases', all)
    return caseData.id
  },

  async getCase(id: string): Promise<Case | null> {
    const all = getCollection<Case>('cases')
    return all.find((c) => c.id === id) ?? null
  },

  async updateCase(caseData: Case): Promise<void> {
    const all = getCollection<Case>('cases')
    const idx = all.findIndex((c) => c.id === caseData.id)
    if (idx !== -1) {
      all[idx] = { ...caseData, updated_at: new Date().toISOString() }
      saveCollection('cases', all)
    }
  },

  // ===== Clients =====

  async getClients(): Promise<Client[]> {
    return getCollection<Client>('clients')
  },

  async createClient(client: Client): Promise<void> {
    const all = getCollection<Client>('clients')
    all.push(client)
    saveCollection('clients', all)
  },

  async getClient(id: string): Promise<Client | null> {
    const all = getCollection<Client>('clients')
    return all.find((c) => c.id === id) ?? null
  },

  // ===== Diary =====

  async getDiaryEntries(date?: string): Promise<DiaryEntry[]> {
    const all = getCollection<DiaryEntry>('diary_entries')
    if (date) return all.filter((e) => e.date === date)
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100)
  },

  async getDiaryEntriesByDateRange(fromDate: string, toDate: string): Promise<DiaryEntry[]> {
    const all = getCollection<DiaryEntry>('diary_entries')
    return all
      .filter((e) => e.date >= fromDate && e.date <= toDate)
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  async getUpcomingEntries(limit: number): Promise<DiaryEntry[]> {
    const all = getCollection<DiaryEntry>('diary_entries')
    const today = new Date().toISOString().split('T')[0]
    return all
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit)
  },

  async createDiaryEntry(entry: DiaryEntry): Promise<string> {
    const all = getCollection<DiaryEntry>('diary_entries')
    all.push(entry)
    saveCollection('diary_entries', all)
    return entry.id
  },

  async updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    const all = getCollection<DiaryEntry>('diary_entries')
    const idx = all.findIndex((e) => e.id === entry.id)
    if (idx !== -1) {
      all[idx] = { ...entry, updated_at: new Date().toISOString() }
      saveCollection('diary_entries', all)
    }
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const all = getCollection<DiaryEntry>('diary_entries')
    saveCollection('diary_entries', all.filter((e) => e.id !== id))
  },

  // ===== Proceedings =====

  async createProceeding(data: Proceeding): Promise<string> {
    const all = getCollection<Proceeding>('proceedings')
    all.push(data)
    saveCollection('proceedings', all)
    return data.id
  },

  async getProceedings(caseId: string): Promise<Proceeding[]> {
    const all = getCollection<Proceeding>('proceedings')
    return all
      .filter((p) => p.case_id === caseId)
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async deleteProceeding(id: string): Promise<void> {
    const all = getCollection<Proceeding>('proceedings')
    saveCollection('proceedings', all.filter((p) => p.id !== id))
  },

  // ===== Case Parties =====

  async addCaseParty(data: CaseParty): Promise<string> {
    const all = getCollection<CaseParty>('parties')
    all.push(data)
    saveCollection('parties', all)
    return data.id
  },

  async getCaseParties(caseId: string): Promise<CaseParty[]> {
    const all = getCollection<CaseParty>('parties')
    return all.filter((p) => p.case_id === caseId)
  },

  async removeCaseParty(id: string): Promise<void> {
    const all = getCollection<CaseParty>('parties')
    saveCollection('parties', all.filter((p) => p.id !== id))
  },

  // ===== Documents =====

  async saveDocument(data: Document): Promise<string> {
    const all = getCollection<Document>('documents')
    all.push(data)
    saveCollection('documents', all)
    return data.id
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    const all = getCollection<Document>('documents')
    return all
      .filter((d) => d.case_id === caseId)
      .sort((a, b) => ((b.created_at || '').localeCompare(a.created_at || '')))
  },

  async deleteDocument(id: string): Promise<void> {
    const all = getCollection<Document>('documents')
    saveCollection('documents', all.filter((d) => d.id !== id))
  },

  // ===== Client Cases =====

  async getClientCases(clientId: string): Promise<Case[]> {
    const parties = getCollection<CaseParty>('parties')
    const caseIds = parties
      .filter((p) => p.client_id === clientId)
      .map((p) => p.case_id)
    const allCases = getCollection<Case>('cases')
    return allCases.filter((c) => caseIds.includes(c.id))
  },

  // ===== Time Entries =====

  async getTimeEntries(date?: string): Promise<TimeEntry[]> {
    const all = getCollection<TimeEntry>('time_entries')
    if (date) return all.filter(e => e.date === date).sort((a, b) => a.start_time.localeCompare(b.start_time))
    return all.sort((a, b) => b.start_time.localeCompare(a.start_time))
  },

  async getTimeEntriesByDateRange(fromDate: string, toDate: string): Promise<TimeEntry[]> {
    const all = getCollection<TimeEntry>('time_entries')
    return all.filter(e => e.date >= fromDate && e.date <= toDate).sort((a, b) => a.start_time.localeCompare(b.start_time))
  },

  async getTodaysTimeEntries(): Promise<TimeEntry[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getTimeEntries(today)
  },

  async createTimeEntry(entry: TimeEntry): Promise<string> {
    const all = getCollection<TimeEntry>('time_entries')
    all.push(entry)
    saveCollection('time_entries', all)
    return entry.id
  },

  async updateTimeEntry(entry: TimeEntry): Promise<void> {
    const all = getCollection<TimeEntry>('time_entries')
    const idx = all.findIndex(e => e.id === entry.id)
    if (idx !== -1) {
      all[idx] = { ...entry, updated_at: new Date().toISOString() }
      saveCollection('time_entries', all)
    }
  },

  async deleteTimeEntry(id: string): Promise<void> {
    const all = getCollection<TimeEntry>('time_entries')
    saveCollection('time_entries', all.filter(e => e.id !== id))
  },

  // ===== Tasks =====

  async getTasks(status?: string): Promise<Task[]> {
    const all = getCollection<Task>('tasks')
    let filtered = all
    if (status) filtered = all.filter(t => t.status === status)
    return filtered.sort((a, b) => {
      const prio = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (prio[a.priority] ?? 99) - (prio[b.priority] ?? 99)
    })
  },

  async getTasksByCase(caseId: string): Promise<Task[]> {
    const all = getCollection<Task>('tasks')
    return all.filter(t => t.case_id === caseId)
  },

  async createTask(task: Task): Promise<string> {
    const all = getCollection<Task>('tasks')
    all.push(task)
    saveCollection('tasks', all)
    return task.id
  },

  async updateTask(task: Task): Promise<void> {
    const all = getCollection<Task>('tasks')
    const idx = all.findIndex(t => t.id === task.id)
    if (idx !== -1) {
      all[idx] = { ...task, updated_at: new Date().toISOString() }
      saveCollection('tasks', all)
    }
  },

  async deleteTask(id: string): Promise<void> {
    const all = getCollection<Task>('tasks')
    saveCollection('tasks', all.filter(t => t.id !== id))
  },

  // ===== Personal Notes =====

  async getPersonalNotes(category?: string): Promise<PersonalNote[]> {
    const all = getCollection<PersonalNote>('personal_notes')
    let filtered = all
    if (category) filtered = all.filter((n) => n.category === category)
    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || '')
    })
  },

  async getPersonalNote(id: string): Promise<PersonalNote | null> {
    const all = getCollection<PersonalNote>('personal_notes')
    return all.find((n) => n.id === id) ?? null
  },

  async searchPersonalNotes(query: string): Promise<PersonalNote[]> {
    const all = getCollection<PersonalNote>('personal_notes')
    const q = query.toLowerCase()
    return all.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
    )
  },

  async createPersonalNote(note: PersonalNote): Promise<string> {
    const all = getCollection<PersonalNote>('personal_notes')
    all.push(note)
    saveCollection('personal_notes', all)
    return note.id
  },

  async updatePersonalNote(note: PersonalNote): Promise<void> {
    const all = getCollection<PersonalNote>('personal_notes')
    const idx = all.findIndex((n) => n.id === note.id)
    if (idx !== -1) {
      all[idx] = { ...note, updated_at: new Date().toISOString() }
      saveCollection('personal_notes', all)
    }
  },

  async deletePersonalNote(id: string): Promise<void> {
    const all = getCollection<PersonalNote>('personal_notes')
    saveCollection('personal_notes', all.filter((n) => n.id !== id))
  },

  // ===== Legal References =====

  async getLegalReferences(type?: string): Promise<LegalReference[]> {
    const all = getCollection<LegalReference>('legal_references')
    let filtered = all
    if (type) filtered = all.filter((r) => r.reference_type === type)
    return filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  },

  async getLegalReference(id: string): Promise<LegalReference | null> {
    const all = getCollection<LegalReference>('legal_references')
    return all.find((r) => r.id === id) ?? null
  },

  async searchLegalReferences(query: string): Promise<LegalReference[]> {
    const all = getCollection<LegalReference>('legal_references')
    const q = query.toLowerCase()
    return all.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.content_text || '').toLowerCase().includes(q) ||
        (r.jurisdiction || '').toLowerCase().includes(q) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
    )
  },

  async createLegalReference(ref: LegalReference): Promise<string> {
    const all = getCollection<LegalReference>('legal_references')
    all.push(ref)
    saveCollection('legal_references', all)
    return ref.id
  },

  async updateLegalReference(ref: LegalReference): Promise<void> {
    const all = getCollection<LegalReference>('legal_references')
    const idx = all.findIndex((r) => r.id === ref.id)
    if (idx !== -1) {
      all[idx] = { ...ref, updated_at: new Date().toISOString() }
      saveCollection('legal_references', all)
    }
  },

  async deleteLegalReference(id: string): Promise<void> {
    const all = getCollection<LegalReference>('legal_references')
    saveCollection('legal_references', all.filter((r) => r.id !== id))
  },

  // ===== Notices =====

  async createNotice(data: Notice): Promise<string> {
    const all = getCollection<Notice>('notices')
    all.push(data)
    saveCollection('notices', all)
    return data.id
  },

  async getNotices(caseId: string): Promise<Notice[]> {
    const all = getCollection<Notice>('notices')
    return all
      .filter((n) => n.case_id === caseId)
      .sort((a, b) => (b.issued_date || '').localeCompare(a.issued_date || ''))
  },

  async getAllNotices(): Promise<Notice[]> {
    return getCollection<Notice>('notices')
  },

  async updateNotice(data: Notice): Promise<void> {
    const all = getCollection<Notice>('notices')
    const idx = all.findIndex((n) => n.id === data.id)
    if (idx !== -1) {
      all[idx] = { ...data, updated_at: new Date().toISOString() }
      saveCollection('notices', all)
    }
  },

  async deleteNotice(id: string): Promise<void> {
    const all = getCollection<Notice>('notices')
    saveCollection('notices', all.filter((n) => n.id !== id))
  },

  // ===== Summons =====

  async createSummons(data: Summons): Promise<string> {
    const all = getCollection<Summons>('summons')
    all.push(data)
    saveCollection('summons', all)
    return data.id
  },

  async getSummons(caseId: string): Promise<Summons[]> {
    const all = getCollection<Summons>('summons')
    return all
      .filter((s) => s.case_id === caseId)
      .sort((a, b) => (b.issued_date || '').localeCompare(a.issued_date || ''))
  },

  async getAllSummons(): Promise<Summons[]> {
    return getCollection<Summons>('summons')
  },

  async updateSummons(data: Summons): Promise<void> {
    const all = getCollection<Summons>('summons')
    const idx = all.findIndex((s) => s.id === data.id)
    if (idx !== -1) {
      all[idx] = { ...data, updated_at: new Date().toISOString() }
      saveCollection('summons', all)
    }
  },

  async deleteSummons(id: string): Promise<void> {
    const all = getCollection<Summons>('summons')
    saveCollection('summons', all.filter((s) => s.id !== id))
  },

  // ===== Order Copy Requests =====

  async createOrderCopy(data: OrderCopyRequest): Promise<string> {
    const all = getCollection<OrderCopyRequest>('order_copies')
    all.push(data)
    saveCollection('order_copies', all)
    return data.id
  },

  async getOrderCopies(caseId: string): Promise<OrderCopyRequest[]> {
    const all = getCollection<OrderCopyRequest>('order_copies')
    return all
      .filter((o) => o.case_id === caseId)
      .sort((a, b) => (b.applied_date || '').localeCompare(a.applied_date || ''))
  },

  async getAllOrderCopies(): Promise<OrderCopyRequest[]> {
    return getCollection<OrderCopyRequest>('order_copies')
  },

  async updateOrderCopy(data: OrderCopyRequest): Promise<void> {
    const all = getCollection<OrderCopyRequest>('order_copies')
    const idx = all.findIndex((o) => o.id === data.id)
    if (idx !== -1) {
      all[idx] = { ...data, updated_at: new Date().toISOString() }
      saveCollection('order_copies', all)
    }
  },

  async deleteOrderCopy(id: string): Promise<void> {
    const all = getCollection<OrderCopyRequest>('order_copies')
    saveCollection('order_copies', all.filter((o) => o.id !== id))
  },

  // ===== Batch Replace (for cloud sync) =====

  replaceCases(cases: Case[]): void { saveCollection('cases', cases) },
  replaceClients(clients: Client[]): void { saveCollection('clients', clients) },
  replaceDiaryEntries(entries: DiaryEntry[]): void { saveCollection('diary_entries', entries) },
  replaceProceedings(proceedings: Proceeding[]): void { saveCollection('proceedings', proceedings) },
  replaceParties(parties: CaseParty[]): void { saveCollection('parties', parties) },
  replaceDocuments(docs: Document[]): void { saveCollection('documents', docs) },
  replaceTimeEntries(entries: TimeEntry[]): void { saveCollection('time_entries', entries) },
  replaceTasks(tasks: Task[]): void { saveCollection('tasks', tasks) },
  replacePersonalNotes(notes: PersonalNote[]): void { saveCollection('personal_notes', notes) },
  replaceNotices(notices: Notice[]): void { saveCollection('notices', notices) },
  replaceSummons(summons: Summons[]): void { saveCollection('summons', summons) },
  replaceOrderCopies(copies: OrderCopyRequest[]): void { saveCollection('order_copies', copies) },
  replaceLegalReferences(refs: LegalReference[]): void { saveCollection('legal_references', refs) },

  replaceAll(data: {
    cases?: Case[]
    clients?: Client[]
    diary_entries?: DiaryEntry[]
    proceedings?: Proceeding[]
    parties?: CaseParty[]
    documents?: Document[]
    time_entries?: TimeEntry[]
    tasks?: Task[]
    personal_notes?: PersonalNote[]
    notices?: Notice[]
    summons?: Summons[]
    order_copies?: OrderCopyRequest[]
    legal_references?: LegalReference[]
  }): void {
    if (data.cases) this.replaceCases(data.cases)
    if (data.clients) this.replaceClients(data.clients)
    if (data.diary_entries) this.replaceDiaryEntries(data.diary_entries)
    if (data.proceedings) this.replaceProceedings(data.proceedings)
    if (data.parties) this.replaceParties(data.parties)
    if (data.documents) this.replaceDocuments(data.documents)
    if (data.time_entries) this.replaceTimeEntries(data.time_entries)
    if (data.tasks) this.replaceTasks(data.tasks)
    if (data.personal_notes) this.replacePersonalNotes(data.personal_notes)
    if (data.notices) this.replaceNotices(data.notices)
    if (data.summons) this.replaceSummons(data.summons)
    if (data.order_copies) this.replaceOrderCopies(data.order_copies)
    if (data.legal_references) this.replaceLegalReferences(data.legal_references)
  },

  // ===== Dashboard =====

  async getDashboardStats(): Promise<DashboardStats> {
    const cases = getCollection<Case>('cases')
    const clients = getCollection<Client>('clients')
    const diary = getCollection<DiaryEntry>('diary_entries')
    const tasks = getCollection<Task>('tasks')
    const timeEntries = getCollection<TimeEntry>('time_entries')
    const today = new Date().toISOString().split('T')[0]

    return {
      total_cases: cases.length,
      active_cases: cases.filter((c) => c.status === 'Active').length,
      today_hearings: diary.filter((e) => e.date === today).length,
      upcoming_hearings: diary.filter((e) => e.date > today).length,
      total_clients: clients.length,
      pending_tasks: tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length,
      todays_time_minutes: timeEntries.filter((e) => e.date === today).reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
    }
  },
}
