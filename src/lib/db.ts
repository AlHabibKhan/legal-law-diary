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

function useCloud(enabled: boolean): typeof supabaseDb | typeof localDb {
  if (enabled && isOnline) return supabaseDb
  return localDb as unknown as typeof supabaseDb
}

export const db = {
  async registerLawyer(profile: LawyerProfile): Promise<string> {
    if (isOnline) {
      try { return await supabaseDb.registerLawyer(profile) } catch { /* fall through */ }
    }
    return localDb.registerLawyer(profile)
  },

  async getLawyerProfile(): Promise<LawyerProfile | null> {
    if (isOnline) {
      try { return await supabaseDb.getLawyerProfile() } catch { /* fall through */ }
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
      try { return await supabaseDb.getCases(status) } catch { /* fall through */ }
    }
    return localDb.getCases(status)
  },

  async createCase(caseData: Case): Promise<string> {
    if (isOnline) {
      try { return await supabaseDb.createCase(caseData) } catch { /* fall through */ }
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
      try { await supabaseDb.updateCase(caseData); return } catch { /* fall through */ }
    }
    return localDb.updateCase(caseData)
  },

  async getClients(): Promise<Client[]> {
    if (isOnline) {
      try { return await supabaseDb.getClients() } catch { /* fall through */ }
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
      try { return await supabaseDb.getDiaryEntries(date) } catch { /* fall through */ }
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
      try { return await supabaseDb.createDiaryEntry(entry) } catch { /* fall through */ }
    }
    return localDb.createDiaryEntry(entry)
  },

  async updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    if (isOnline) {
      try { await supabaseDb.updateDiaryEntry(entry); return } catch { /* fall through */ }
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
      try { return await supabaseDb.createProceeding(data) } catch { /* fall through */ }
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
      try { return await supabaseDb.addCaseParty(data) } catch { /* fall through */ }
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
      try { return await supabaseDb.saveDocument(data) } catch { /* fall through */ }
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
}
