import { supabase } from './supabase'
import { supabaseDb } from './db-supabase'
import { localDb } from './db-local'
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

let isOnline = false

export async function checkConnection(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    isOnline = !!user
    return isOnline
  } catch {
    isOnline = false
    return false
  }
}

export function getConnectionStatus(): boolean {
  return isOnline
}

async function cacheCases() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getCases()
    localDb.replaceCases(data)
  } catch { /* ignore */ }
}

async function cacheClients() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getClients()
    localDb.replaceClients(data)
  } catch { /* ignore */ }
}

async function cacheDiaryEntries() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getDiaryEntries()
    localDb.replaceDiaryEntries(data)
  } catch { /* ignore */ }
}

async function cacheProceedings() {
  if (!isOnline) return
  try {
    const allCases = await supabaseDb.getCases()
    const all: Proceeding[] = []
    for (const c of allCases) {
      const p = await supabaseDb.getProceedings(c.id).catch(() => [] as Proceeding[])
      all.push(...p)
    }
    localDb.replaceProceedings(all)
  } catch { /* ignore */ }
}

async function cacheParties() {
  if (!isOnline) return
  try {
    const allCases = await supabaseDb.getCases()
    const all: CaseParty[] = []
    for (const c of allCases) {
      const p = await supabaseDb.getCaseParties(c.id).catch(() => [] as CaseParty[])
      all.push(...p)
    }
    localDb.replaceParties(all)
  } catch { /* ignore */ }
}

async function cacheDocuments() {
  if (!isOnline) return
  try {
    const allCases = await supabaseDb.getCases()
    const all: Document[] = []
    for (const c of allCases) {
      const d = await supabaseDb.getCaseDocuments(c.id).catch(() => [] as Document[])
      all.push(...d)
    }
    localDb.replaceDocuments(all)
  } catch { /* ignore */ }
}

async function cacheNotices() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getAllNotices()
    localDb.replaceNotices(data)
  } catch { /* ignore */ }
}

async function cacheSummons() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getAllSummons()
    localDb.replaceSummons(data)
  } catch { /* ignore */ }
}

async function cacheOrderCopies() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getAllOrderCopies()
    localDb.replaceOrderCopies(data)
  } catch { /* ignore */ }
}

async function cachePersonalNotes() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getPersonalNotes()
    localDb.replacePersonalNotes(data)
  } catch { /* ignore */ }
}

async function cacheLegalReferences() {
  if (!isOnline) return
  try {
    const data = await supabaseDb.getLegalReferences()
    localDb.replaceLegalReferences(data)
  } catch { /* ignore */ }
}

export const db = {
  async registerLawyer(profile: LawyerProfile): Promise<string> {
    try {
      return await supabaseDb.registerLawyer(profile)
    } catch { /* fall through */ }
    return localDb.registerLawyer(profile)
  },

  async getLawyerProfile(): Promise<LawyerProfile | null> {
    if (isOnline) {
      try {
        const p = await supabaseDb.getLawyerProfile()
        if (p) {
          localDb.registerLawyer(p)
          return p
        }
      } catch { /* fall through */ }
    }
    return localDb.getLawyerProfile()
  },

  async updateLawyerProfile(profile: LawyerProfile): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateLawyerProfile(profile); return } catch { /* fall through */ }
    }
    return localDb.updateLawyerProfile(profile)
  },

  async isRegistered(): Promise<boolean> {
    if (isOnline) {
      try { return await supabaseDb.isRegistered() } catch { /* fall through */ }
    }
    return localDb.isRegistered()
  },

  async verifyPin(pin: string): Promise<boolean> {
    return localDb.verifyPin(pin)
  },

  async setPin(pin: string): Promise<void> {
    return localDb.setPin(pin)
  },

  async getCourts(parentId?: string): Promise<Court[]> {
    return localDb.getCourts(parentId)
  },

  async searchCourts(query: string): Promise<Court[]> {
    return localDb.searchCourts(query)
  },

  async getCases(status?: string): Promise<Case[]> {
    if (isOnline) {
      try {
        const data = await supabaseDb.getCases(status)
        localDb.replaceCases(data)
        return data
      } catch { /* fall through */ }
    }
    return localDb.getCases(status)
  },

  async createCase(caseData: Case): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createCase(caseData)
        localDb.createCase({ ...caseData, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createCase(caseData)
  },

  async getCase(id: string): Promise<Case | null> {
    if (isOnline) {
      try { return await supabaseDb.getCase(id) } catch { /* fall through */ }
    }
    return localDb.getCase(id)
  },

  async updateCase(caseData: Case): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateCase(caseData) } catch { /* fall through */ }
    }
    return localDb.updateCase(caseData)
  },

  async getClients(): Promise<Client[]> {
    if (isOnline) {
      try {
        const data = await supabaseDb.getClients()
        localDb.replaceClients(data)
        return data
      } catch { /* fall through */ }
    }
    return localDb.getClients()
  },

  async createClient(client: Client): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.createClient(client); return } catch { /* fall through */ }
    }
    return localDb.createClient(client)
  },

  async getClient(id: string): Promise<Client | null> {
    if (isOnline) {
      try { return await supabaseDb.getClient(id) } catch { /* fall through */ }
    }
    return localDb.getClient(id)
  },

  async getDiaryEntries(date?: string): Promise<DiaryEntry[]> {
    if (isOnline) {
      try {
        const data = await supabaseDb.getDiaryEntries(date)
        localDb.replaceDiaryEntries(data)
        return data
      } catch { /* fall through */ }
    }
    return localDb.getDiaryEntries(date)
  },

  async getDiaryEntriesByDateRange(fromDate: string, toDate: string): Promise<DiaryEntry[]> {
    if (isOnline) {
      try { return await supabaseDb.getDiaryEntriesByDateRange(fromDate, toDate) } catch { /* fall through */ }
    }
    return localDb.getDiaryEntriesByDateRange(fromDate, toDate)
  },

  async getUpcomingEntries(limit: number): Promise<DiaryEntry[]> {
    if (isOnline) {
      try { return await supabaseDb.getUpcomingEntries(limit) } catch { /* fall through */ }
    }
    return localDb.getUpcomingEntries(limit)
  },

  async createDiaryEntry(entry: DiaryEntry): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createDiaryEntry(entry)
        localDb.createDiaryEntry({ ...entry, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createDiaryEntry(entry)
  },

  async updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateDiaryEntry(entry) } catch { /* fall through */ }
    }
    return localDb.updateDiaryEntry(entry)
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteDiaryEntry(id); return } catch { /* fall through */ }
    }
    return localDb.deleteDiaryEntry(id)
  },

  async createProceeding(data: Proceeding): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createProceeding(data)
        localDb.createProceeding({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createProceeding(data)
  },

  async getProceedings(caseId: string): Promise<Proceeding[]> {
    if (isOnline) {
      try { return await supabaseDb.getProceedings(caseId) } catch { /* fall through */ }
    }
    return localDb.getProceedings(caseId)
  },

  async deleteProceeding(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteProceeding(id); return } catch { /* fall through */ }
    }
    return localDb.deleteProceeding(id)
  },

  async addCaseParty(data: CaseParty): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.addCaseParty(data)
        localDb.addCaseParty({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.addCaseParty(data)
  },

  async getCaseParties(caseId: string): Promise<CaseParty[]> {
    if (isOnline) {
      try { return await supabaseDb.getCaseParties(caseId) } catch { /* fall through */ }
    }
    return localDb.getCaseParties(caseId)
  },

  async removeCaseParty(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.removeCaseParty(id); return } catch { /* fall through */ }
    }
    return localDb.removeCaseParty(id)
  },

  async saveDocument(data: Document): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.saveDocument(data)
        localDb.saveDocument({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.saveDocument(data)
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    if (isOnline) {
      try { return await supabaseDb.getCaseDocuments(caseId) } catch { /* fall through */ }
    }
    return localDb.getCaseDocuments(caseId)
  },

  async deleteDocument(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteDocument(id); return } catch { /* fall through */ }
    }
    return localDb.deleteDocument(id)
  },

  async getClientCases(clientId: string): Promise<Case[]> {
    if (isOnline) {
      try { return await supabaseDb.getClientCases(clientId) } catch { /* fall through */ }
    }
    return localDb.getClientCases(clientId)
  },

  async getDashboardStats(): Promise<DashboardStats> {
    if (isOnline) {
      try { return await supabaseDb.getDashboardStats() } catch { /* fall through */ }
    }
    return localDb.getDashboardStats()
  },

  async getProfileByPhone(phone: string): Promise<LawyerProfile | null> {
    return localDb.getProfileByPhone(phone)
  },

  // ===== Time Entries =====

  async getTimeEntries(date?: string): Promise<TimeEntry[]> {
    if (isOnline) {
      try { return await supabaseDb.getTimeEntries(date) } catch { /* fall through */ }
    }
    return localDb.getTimeEntries(date)
  },

  async getTimeEntriesByDateRange(fromDate: string, toDate: string): Promise<TimeEntry[]> {
    if (isOnline) {
      try { return await supabaseDb.getTimeEntriesByDateRange(fromDate, toDate) } catch { /* fall through */ }
    }
    return localDb.getTimeEntriesByDateRange(fromDate, toDate)
  },

  async getTodaysTimeEntries(): Promise<TimeEntry[]> {
    if (isOnline) {
      try { return await supabaseDb.getTodaysTimeEntries() } catch { /* fall through */ }
    }
    return localDb.getTodaysTimeEntries()
  },

  async createTimeEntry(entry: TimeEntry): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createTimeEntry(entry)
        localDb.createTimeEntry({ ...entry, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createTimeEntry(entry)
  },

  async updateTimeEntry(entry: TimeEntry): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateTimeEntry(entry); return } catch { /* fall through */ }
    }
    return localDb.updateTimeEntry(entry)
  },

  async deleteTimeEntry(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteTimeEntry(id); return } catch { /* fall through */ }
    }
    return localDb.deleteTimeEntry(id)
  },

  // ===== Tasks =====

  async getTasks(status?: string): Promise<Task[]> {
    if (isOnline) {
      try { return await supabaseDb.getTasks(status) } catch { /* fall through */ }
    }
    return localDb.getTasks(status)
  },

  async getTasksByCase(caseId: string): Promise<Task[]> {
    if (isOnline) {
      try { return await supabaseDb.getTasksByCase(caseId) } catch { /* fall through */ }
    }
    return localDb.getTasksByCase(caseId)
  },

  async createTask(task: Task): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createTask(task)
        localDb.createTask({ ...task, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createTask(task)
  },

  async updateTask(task: Task): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateTask(task); return } catch { /* fall through */ }
    }
    return localDb.updateTask(task)
  },

  async deleteTask(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteTask(id); return } catch { /* fall through */ }
    }
    return localDb.deleteTask(id)
  },

  // ===== Personal Notes =====

  async getPersonalNotes(category?: string): Promise<PersonalNote[]> {
    if (isOnline) {
      try { return await supabaseDb.getPersonalNotes(category) } catch { /* fall through */ }
    }
    return localDb.getPersonalNotes(category)
  },

  async getPersonalNote(id: string): Promise<PersonalNote | null> {
    if (isOnline) {
      try { return await supabaseDb.getPersonalNote(id) } catch { /* fall through */ }
    }
    return localDb.getPersonalNote(id)
  },

  async searchPersonalNotes(query: string): Promise<PersonalNote[]> {
    if (isOnline) {
      try { return await supabaseDb.searchPersonalNotes(query) } catch { /* fall through */ }
    }
    return localDb.searchPersonalNotes(query)
  },

  async createPersonalNote(note: PersonalNote): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createPersonalNote(note)
        localDb.createPersonalNote({ ...note, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createPersonalNote(note)
  },

  async updatePersonalNote(note: PersonalNote): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updatePersonalNote(note); return } catch { /* fall through */ }
    }
    return localDb.updatePersonalNote(note)
  },

  async deletePersonalNote(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deletePersonalNote(id); return } catch { /* fall through */ }
    }
    return localDb.deletePersonalNote(id)
  },

  // ===== Legal References =====

  async getLegalReferences(type?: string): Promise<LegalReference[]> {
    if (isOnline) {
      try { return await supabaseDb.getLegalReferences(type) } catch { /* fall through */ }
    }
    return localDb.getLegalReferences(type)
  },

  async getLegalReference(id: string): Promise<LegalReference | null> {
    if (isOnline) {
      try { return await supabaseDb.getLegalReference(id) } catch { /* fall through */ }
    }
    return localDb.getLegalReference(id)
  },

  async searchLegalReferences(query: string): Promise<LegalReference[]> {
    if (isOnline) {
      try { return await supabaseDb.searchLegalReferences(query) } catch { /* fall through */ }
    }
    return localDb.searchLegalReferences(query)
  },

  async createLegalReference(ref: LegalReference): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createLegalReference(ref)
        localDb.createLegalReference({ ...ref, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createLegalReference(ref)
  },

  async updateLegalReference(ref: LegalReference): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateLegalReference(ref); return } catch { /* fall through */ }
    }
    return localDb.updateLegalReference(ref)
  },

  async deleteLegalReference(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteLegalReference(id); return } catch { /* fall through */ }
    }
    return localDb.deleteLegalReference(id)
  },

  // ===== Notices =====

  async createNotice(data: Notice): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createNotice(data)
        localDb.createNotice({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createNotice(data)
  },

  async getNotices(caseId: string): Promise<Notice[]> {
    if (isOnline) {
      try { return await supabaseDb.getNotices(caseId) } catch { /* fall through */ }
    }
    return localDb.getNotices(caseId)
  },

  async getAllNotices(): Promise<Notice[]> {
    if (isOnline) {
      try { return await supabaseDb.getAllNotices() } catch { /* fall through */ }
    }
    return localDb.getAllNotices()
  },

  async updateNotice(data: Notice): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateNotice(data); return } catch { /* fall through */ }
    }
    return localDb.updateNotice(data)
  },

  async deleteNotice(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteNotice(id); return } catch { /* fall through */ }
    }
    return localDb.deleteNotice(id)
  },

  // ===== Summons =====

  async createSummons(data: Summons): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createSummons(data)
        localDb.createSummons({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createSummons(data)
  },

  async getSummons(caseId: string): Promise<Summons[]> {
    if (isOnline) {
      try { return await supabaseDb.getSummons(caseId) } catch { /* fall through */ }
    }
    return localDb.getSummons(caseId)
  },

  async getAllSummons(): Promise<Summons[]> {
    if (isOnline) {
      try { return await supabaseDb.getAllSummons() } catch { /* fall through */ }
    }
    return localDb.getAllSummons()
  },

  async updateSummons(data: Summons): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateSummons(data); return } catch { /* fall through */ }
    }
    return localDb.updateSummons(data)
  },

  async deleteSummons(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteSummons(id); return } catch { /* fall through */ }
    }
    return localDb.deleteSummons(id)
  },

  // ===== Order Copy Requests =====

  async createOrderCopy(data: OrderCopyRequest): Promise<string> {
    if (isOnline) {
      try {
        const id = await supabaseDb.createOrderCopy(data)
        localDb.createOrderCopy({ ...data, id })
        return id
      } catch { /* fall through */ }
    }
    return localDb.createOrderCopy(data)
  },

  async getOrderCopies(caseId: string): Promise<OrderCopyRequest[]> {
    if (isOnline) {
      try { return await supabaseDb.getOrderCopies(caseId) } catch { /* fall through */ }
    }
    return localDb.getOrderCopies(caseId)
  },

  async getAllOrderCopies(): Promise<OrderCopyRequest[]> {
    if (isOnline) {
      try { return await supabaseDb.getAllOrderCopies() } catch { /* fall through */ }
    }
    return localDb.getAllOrderCopies()
  },

  async updateOrderCopy(data: OrderCopyRequest): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateOrderCopy(data); return } catch { /* fall through */ }
    }
    return localDb.updateOrderCopy(data)
  },

  async deleteOrderCopy(id: string): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.deleteOrderCopy(id); return } catch { /* fall through */ }
    }
    return localDb.deleteOrderCopy(id)
  },

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
    localDb.replaceAll(data)
  },

  async syncOnLogin(): Promise<void> {
    if (!isOnline) return

    // Sync profile
    try {
      const profile = await supabaseDb.getLawyerProfile()
      if (profile) {
        localDb.registerLawyer(profile)
        localStorage.setItem('lawyer_profile', JSON.stringify(profile))
        localStorage.setItem('is_registered', 'true')
      }
    } catch { /* ignore */ }

    // Sync all collections in parallel
    await Promise.all([
      cacheCases(),
      cacheClients(),
      cacheDiaryEntries(),
      cacheProceedings(),
      cacheParties(),
      cacheDocuments(),
      cacheNotices(),
      cacheSummons(),
      cacheOrderCopies(),
      cachePersonalNotes(),
      cacheLegalReferences(),
    ])
  },
}
