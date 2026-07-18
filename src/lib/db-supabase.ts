import { supabase } from './supabase'
import type {
  LawyerProfile,
  Case,
  Client,
  DiaryEntry,
  Proceeding,
  Document,
  CaseParty,
  DashboardStats,
  PaymentMethod,
  PaymentRequest,
  PlanPriceHistory,
  TimeEntry,
  Task,
  Notice,
  Summons,
  OrderCopyRequest,
  PersonalNote,
  LegalReference,
} from '@/types'

export const supabaseDb = {
  // ===== Lawyer Profile =====

  async registerLawyer(profile: LawyerProfile): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: profile.full_name,
      bar_council: profile.bar_council,
      license_number: profile.license_number,
      mobile_number: profile.mobile_number,
      cnic: profile.cnic,
      chamber_address: profile.chamber_address,
      practice_areas: profile.practice_areas,
    })
    if (error) throw error
    return user.id
  },

  async getLawyerProfile(): Promise<LawyerProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !data) return null
    return {
      id: data.id,
      full_name: data.full_name,
      bar_council: data.bar_council,
      license_number: data.license_number,
      mobile_number: data.mobile_number,
      cnic: data.cnic,
      chamber_address: data.chamber_address,
      practice_areas: data.practice_areas,
    }
  },

  async updateLawyerProfile(profile: LawyerProfile): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        bar_council: profile.bar_council,
        license_number: profile.license_number,
        mobile_number: profile.mobile_number,
        cnic: profile.cnic,
        chamber_address: profile.chamber_address,
        practice_areas: profile.practice_areas,
      })
      .eq('id', profile.id)
    if (error) throw error
  },

  async isRegistered(): Promise<boolean> {
    const profile = await this.getLawyerProfile()
    return profile !== null
  },

  async verifyPin(_pin: string): Promise<boolean> {
    return true
  },

  async setPin(_pin: string): Promise<void> {
    // No-op
  },

  // ===== Courts (static data, not in Supabase) =====

  async getCourts(_parentId?: string): Promise<never[]> {
    return []
  },

  async searchCourts(_query: string): Promise<never[]> {
    return []
  },

  // ===== Cases =====

  async getCases(status?: string): Promise<Case[]> {
    let query = supabase
      .from('cases')
      .select('*')
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeCase)
  },

  async createCase(caseData: Case): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('cases')
      .insert({
        id: caseData.id,
        user_id: user.id,
        case_number: caseData.case_number,
        title: caseData.title,
        case_type: caseData.case_type,
        court_id: caseData.court_id,
        division: caseData.division,
        judge_id: caseData.judge_id,
        filing_date: caseData.filing_date,
        status: caseData.status,
        description: caseData.description,
        remarks: caseData.remarks,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async getCase(id: string): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return normalizeCase(data)
  },

  async updateCase(caseData: Case): Promise<void> {
    const { error } = await supabase
      .from('cases')
      .update({
        case_number: caseData.case_number,
        title: caseData.title,
        case_type: caseData.case_type,
        court_id: caseData.court_id,
        division: caseData.division,
        judge_id: caseData.judge_id,
        filing_date: caseData.filing_date,
        status: caseData.status,
        description: caseData.description,
        remarks: caseData.remarks,
      })
      .eq('id', caseData.id)
    if (error) throw error
  },

  // ===== Clients =====

  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeClient)
  },

  async createClient(client: Client): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('clients')
      .insert({
        id: client.id,
        user_id: user.id,
        name: client.name,
        cnic: client.cnic,
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: client.notes,
      })
    if (error) throw error
  },

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return normalizeClient(data)
  },

  // ===== Diary Entries =====

  async getDiaryEntries(date?: string): Promise<DiaryEntry[]> {
    let query = supabase
      .from('diary_entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeDiaryEntry)
  },

  async getDiaryEntriesByDateRange(fromDate: string, toDate: string): Promise<DiaryEntry[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeDiaryEntry)
  },

  async getUpcomingEntries(limit: number): Promise<DiaryEntry[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return (data || []).map(normalizeDiaryEntry)
  },

  async createDiaryEntry(entry: DiaryEntry): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        id: entry.id,
        user_id: user.id,
        case_id: entry.case_id,
        date: entry.date,
        court_id: entry.court_id,
        division: entry.division,
        judge_id: entry.judge_id,
        purpose: entry.purpose,
        description: entry.description,
        status: entry.status,
        remarks: entry.remarks,
        reminder_minutes: entry.reminder_minutes,
        reminder_sent: entry.reminder_sent,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    const { error } = await supabase
      .from('diary_entries')
      .update({
        case_id: entry.case_id,
        date: entry.date,
        court_id: entry.court_id,
        division: entry.division,
        judge_id: entry.judge_id,
        purpose: entry.purpose,
        description: entry.description,
        status: entry.status,
        remarks: entry.remarks,
        reminder_minutes: entry.reminder_minutes,
        reminder_sent: entry.reminder_sent,
      })
      .eq('id', entry.id)
    if (error) throw error
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ===== Proceedings =====

  async createProceeding(data: Proceeding): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('proceedings')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        date: data.date,
        proceeding_type: data.proceeding_type,
        order_summary: data.order_summary,
        next_date: data.next_date,
        remarks: data.remarks,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getProceedings(caseId: string): Promise<Proceeding[]> {
    const { data, error } = await supabase
      .from('proceedings')
      .select('*')
      .eq('case_id', caseId)
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      case_id: r.case_id as string,
      date: r.date as string,
      proceeding_type: r.proceeding_type as string | null,
      order_summary: r.order_summary as string | null,
      next_date: r.next_date as string | null,
      remarks: r.remarks as string | null,
      created_at: r.created_at as string | undefined,
    }))
  },

  async deleteProceeding(id: string): Promise<void> {
    const { error } = await supabase
      .from('proceedings')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ===== Case Parties =====

  async addCaseParty(data: CaseParty): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('case_parties')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        client_id: data.client_id,
        party_type: data.party_type,
        party_name: data.party_name,
        is_client: data.is_client,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getCaseParties(caseId: string): Promise<CaseParty[]> {
    const { data, error } = await supabase
      .from('case_parties')
      .select('*')
      .eq('case_id', caseId)
      .order('party_type', { ascending: true })

    if (error) throw error
    return (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      case_id: r.case_id as string,
      client_id: r.client_id as string | null,
      party_type: r.party_type as string,
      party_name: r.party_name as string | null,
      is_client: r.is_client as boolean,
    }))
  },

  async removeCaseParty(id: string): Promise<void> {
    const { error } = await supabase
      .from('case_parties')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ===== Documents =====

  async saveDocument(data: Document): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('documents')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        name: data.name,
        type: data.type,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        notes: data.notes,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      case_id: r.case_id as string,
      name: r.name as string,
      type: r.type as string | null,
      file_path: r.file_path as string | null,
      file_size: r.file_size as number | null,
      mime_type: r.mime_type as string | null,
      notes: r.notes as string | null,
      created_at: r.created_at as string | undefined,
    }))
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ===== Client Cases =====

  async getClientCases(clientId: string): Promise<Case[]> {
    const { data: parties, error: partyError } = await supabase
      .from('case_parties')
      .select('case_id')
      .eq('client_id', clientId)

    if (partyError || !parties?.length) return []

    const caseIds = parties.map((p: { case_id: string }) => p.case_id)
    const { data: cases, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .in('id', caseIds)
      .order('updated_at', { ascending: false })

    if (caseError) throw caseError
    return (cases || []).map(normalizeCase)
  },

  // ===== Dashboard =====

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return { total_cases: 0, active_cases: 0, today_hearings: 0, upcoming_hearings: 0, total_clients: 0, pending_tasks: 0, todays_time_minutes: 0 }
    }

    const today = new Date().toISOString().split('T')[0]
    const userId = user.id

    const [{ count: totalCases }, { count: activeCases }, { count: todayHearings }, { count: upcomingHearings }, { count: totalClients }, { count: pendingTasks }, timeEntries] = await Promise.all([
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Active'),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('date', today),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('date', today),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('status', 'in', '("completed","cancelled")'),
      supabase.from('time_entries').select('duration_minutes').eq('user_id', userId).eq('date', today),
    ])

    const todaysTimeMinutes = (timeEntries.data || []).reduce((sum: number, e: any) => sum + (e.duration_minutes || 0), 0)

    return {
      total_cases: totalCases ?? 0,
      active_cases: activeCases ?? 0,
      today_hearings: todayHearings ?? 0,
      upcoming_hearings: upcomingHearings ?? 0,
      total_clients: totalClients ?? 0,
      pending_tasks: pendingTasks ?? 0,
      todays_time_minutes: todaysTimeMinutes,
    }
  },

  // ===== Time Entries =====

  async getTimeEntries(date?: string): Promise<TimeEntry[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(100)

    if (date) query = query.eq('date', date)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeTimeEntry)
  },

  async getTimeEntriesByDateRange(fromDate: string, toDate: string): Promise<TimeEntry[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('start_time', { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeTimeEntry)
  },

  async getTodaysTimeEntries(): Promise<TimeEntry[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getTimeEntries(today)
  },

  async createTimeEntry(entry: TimeEntry): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        id: entry.id,
        user_id: user.id,
        case_id: entry.case_id,
        description: entry.description,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_minutes: entry.duration_minutes,
        billable_rate: entry.billable_rate,
        is_billable: entry.is_billable,
        date: entry.date,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async updateTimeEntry(entry: TimeEntry): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .update({
        case_id: entry.case_id,
        description: entry.description,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_minutes: entry.duration_minutes,
        billable_rate: entry.billable_rate,
        is_billable: entry.is_billable,
        date: entry.date,
      })
      .eq('id', entry.id)
    if (error) throw error
  },

  async deleteTimeEntry(id: string): Promise<void> {
    const { error } = await supabase.from('time_entries').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Tasks =====

  async getTasks(status?: string): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeTask)
  },

  async getTasksByCase(caseId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeTask)
  },

  async createTask(task: Task): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        user_id: user.id,
        case_id: task.case_id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        assigned_to: task.assigned_to,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async updateTask(task: Task): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        case_id: task.case_id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        assigned_to: task.assigned_to,
      })
      .eq('id', task.id)
    if (error) throw error
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Personal Notes =====

  async getPersonalNotes(category?: string): Promise<PersonalNote[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    let query = supabase
      .from('personal_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (category) query = query.eq('category', category)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizePersonalNote)
  },

  async getPersonalNote(id: string): Promise<PersonalNote | null> {
    const { data, error } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return normalizePersonalNote(data)
  },

  async searchPersonalNotes(query: string): Promise<PersonalNote[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const { data, error } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizePersonalNote)
  },

  async createPersonalNote(note: PersonalNote): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('personal_notes')
      .insert({
        id: note.id,
        user_id: user.id,
        title: note.title,
        content: note.content,
        category: note.category,
        case_id: note.case_id,
        tags: note.tags,
        pinned: note.pinned,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async updatePersonalNote(note: PersonalNote): Promise<void> {
    const { error } = await supabase
      .from('personal_notes')
      .update({
        title: note.title,
        content: note.content,
        category: note.category,
        case_id: note.case_id,
        tags: note.tags,
        pinned: note.pinned,
      })
      .eq('id', note.id)
    if (error) throw error
  },

  async deletePersonalNote(id: string): Promise<void> {
    const { error } = await supabase.from('personal_notes').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Legal References =====

  async getLegalReferences(type?: string): Promise<LegalReference[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    let query = supabase
      .from('legal_references')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type) query = query.eq('reference_type', type)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeLegalReference)
  },

  async getLegalReference(id: string): Promise<LegalReference | null> {
    const { data, error } = await supabase
      .from('legal_references')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return normalizeLegalReference(data)
  },

  async searchLegalReferences(query: string): Promise<LegalReference[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const { data, error } = await supabase
      .from('legal_references')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,content_text.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeLegalReference)
  },

  async createLegalReference(ref: LegalReference): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('legal_references')
      .insert({
        id: ref.id,
        user_id: user.id,
        title: ref.title,
        reference_type: ref.reference_type,
        jurisdiction: ref.jurisdiction,
        year: ref.year,
        description: ref.description,
        content_text: ref.content_text,
        tags: ref.tags,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  },

  async updateLegalReference(ref: LegalReference): Promise<void> {
    const { error } = await supabase
      .from('legal_references')
      .update({
        title: ref.title,
        reference_type: ref.reference_type,
        jurisdiction: ref.jurisdiction,
        year: ref.year,
        description: ref.description,
        content_text: ref.content_text,
        tags: ref.tags,
      })
      .eq('id', ref.id)
    if (error) throw error
  },

  async deleteLegalReference(id: string): Promise<void> {
    const { error } = await supabase.from('legal_references').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Notices =====

  async createNotice(data: Notice): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('notices')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        notice_type: data.notice_type,
        issued_to: data.issued_to,
        issued_date: data.issued_date,
        served_date: data.served_date,
        status: data.status,
        content: data.content,
        remarks: data.remarks,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getNotices(caseId: string): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('case_id', caseId)
      .order('issued_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeNotice)
  },

  async getAllNotices(): Promise<Notice[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeNotice)
  },

  async updateNotice(data: Notice): Promise<void> {
    const { error } = await supabase
      .from('notices')
      .update({
        notice_type: data.notice_type,
        issued_to: data.issued_to,
        issued_date: data.issued_date,
        served_date: data.served_date,
        status: data.status,
        content: data.content,
        remarks: data.remarks,
      })
      .eq('id', data.id)
    if (error) throw error
  },

  async deleteNotice(id: string): Promise<void> {
    const { error } = await supabase.from('notices').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Summons =====

  async createSummons(data: Summons): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('summons')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        summons_type: data.summons_type,
        issued_to: data.issued_to,
        issued_date: data.issued_date,
        return_date: data.return_date,
        hearing_date: data.hearing_date,
        status: data.status,
        remarks: data.remarks,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getSummons(caseId: string): Promise<Summons[]> {
    const { data, error } = await supabase
      .from('summons')
      .select('*')
      .eq('case_id', caseId)
      .order('issued_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeSummons)
  },

  async getAllSummons(): Promise<Summons[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []
    const { data, error } = await supabase
      .from('summons')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeSummons)
  },

  async updateSummons(data: Summons): Promise<void> {
    const { error } = await supabase
      .from('summons')
      .update({
        summons_type: data.summons_type,
        issued_to: data.issued_to,
        issued_date: data.issued_date,
        return_date: data.return_date,
        hearing_date: data.hearing_date,
        status: data.status,
        remarks: data.remarks,
      })
      .eq('id', data.id)
    if (error) throw error
  },

  async deleteSummons(id: string): Promise<void> {
    const { error } = await supabase.from('summons').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Order Copy Requests =====

  async createOrderCopy(data: OrderCopyRequest): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    const { data: result, error } = await supabase
      .from('order_copies')
      .insert({
        id: data.id,
        user_id: user.id,
        case_id: data.case_id,
        order_date: data.order_date,
        order_summary: data.order_summary,
        applied_date: data.applied_date,
        status: data.status,
        court_fee: data.court_fee,
        estimated_cost: data.estimated_cost,
        received_date: data.received_date,
        remarks: data.remarks,
      })
      .select()
      .single()

    if (error) throw error
    return result.id
  },

  async getOrderCopies(caseId: string): Promise<OrderCopyRequest[]> {
    const { data, error } = await supabase
      .from('order_copies')
      .select('*')
      .eq('case_id', caseId)
      .order('applied_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeOrderCopy)
  },

  async getAllOrderCopies(): Promise<OrderCopyRequest[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []
    const { data, error } = await supabase
      .from('order_copies')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_date', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeOrderCopy)
  },

  async updateOrderCopy(data: OrderCopyRequest): Promise<void> {
    const { error } = await supabase
      .from('order_copies')
      .update({
        order_date: data.order_date,
        order_summary: data.order_summary,
        applied_date: data.applied_date,
        status: data.status,
        court_fee: data.court_fee,
        estimated_cost: data.estimated_cost,
        received_date: data.received_date,
        remarks: data.remarks,
      })
      .eq('id', data.id)
    if (error) throw error
  },

  async deleteOrderCopy(id: string): Promise<void> {
    const { error } = await supabase.from('order_copies').delete().eq('id', id)
    if (error) throw error
  },

  // ===== Payment Methods (Admin) =====

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order')
    if (error) throw error
    return (data || []).map(normalizePaymentMethod)
  },

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return (data || []).map(normalizePaymentMethod)
  },

  async createPaymentMethod(method: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(method)
      .select()
      .single()
    if (error) throw error
    return normalizePaymentMethod(data)
  },

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async deletePaymentMethod(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ===== Payment Requests =====

  async getPaymentRequests(filter?: { status?: string }): Promise<PaymentRequest[]> {
    let query = supabase
      .from('payment_requests')
      .select('*, plan:plan_id(*), payment_method:payment_method_id(*)')
      .order('created_at', { ascending: false })
    if (filter?.status) query = query.eq('status', filter.status)
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizePaymentRequest)
  },

  async getMyPaymentRequests(): Promise<PaymentRequest[]> {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*, plan:plan_id(*), payment_method:payment_method_id(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(normalizePaymentRequest)
  },

  async createPaymentRequest(req: {
    plan_id: string
    payment_method_id: string
    amount: number
    transaction_id: string
    sender_name: string
    sender_account?: string
    notes?: string
  }): Promise<PaymentRequest> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({ ...req, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    return normalizePaymentRequest(data)
  },

  async verifyPaymentRequest(id: string, status: 'verified' | 'rejected', adminNotes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('payment_requests')
      .update({ status, admin_notes: adminNotes, verified_by: user?.id, verified_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    if (status === 'verified') {
      const { data: req } = await supabase
        .from('payment_requests')
        .select('*, plan:plan_id(*)')
        .eq('id', id)
        .single()
      if (req) {
        const periodEnd = new Date()
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        await supabase.from('subscriptions').upsert({
          user_id: req.user_id,
          plan_id: req.plan_id,
          status: 'active',
          locked_price_pkr: req.amount,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id', ignoreDuplicates: false })
        await supabase.from('profiles').update({ account_status: 'active' }).eq('id', req.user_id)
      }
    }
  },

  // ===== Plan Price History =====

  async getPlanPriceHistory(planId: string): Promise<PlanPriceHistory[]> {
    const { data, error } = await supabase
      .from('plan_price_history')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(normalizePriceHistory)
  },

  async applyPriceIncrease(planId: string): Promise<void> {
    const { data: plan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()
    if (fetchError) throw fetchError

    const { error: logError } = await supabase
      .from('plan_price_history')
      .insert({ plan_id: planId, price_pkr: plan.price_pkr, change_reason: 'scheduled' })
    if (logError) throw logError

    const newPrice = plan.price_pkr + Math.floor(plan.price_pkr * plan.increase_percentage / 100)
    const { error } = await supabase
      .from('subscription_plans')
      .update({
        price_pkr: newPrice,
        last_increase_at: new Date().toISOString(),
        next_increase_at: new Date(Date.now() + plan.increase_interval_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', planId)
    if (error) throw error
  },
}

function normalizeCase(data: Record<string, unknown>): Case {
  return {
    id: data.id as string,
    case_number: data.case_number as string,
    title: data.title as string,
    case_type: data.case_type as string | null,
    court_id: data.court_id as string | null,
    division: data.division as string | null,
    judge_id: data.judge_id as string | null,
    filing_date: data.filing_date as string | null,
    status: data.status as string,
    description: data.description as string | null,
    remarks: data.remarks as string | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeClient(data: Record<string, unknown>): Client {
  return {
    id: data.id as string,
    name: data.name as string,
    cnic: data.cnic as string | null,
    phone: data.phone as string | null,
    email: data.email as string | null,
    address: data.address as string | null,
    notes: data.notes as string | null,
  }
}

function normalizePaymentMethod(data: Record<string, unknown>): PaymentMethod {
  return {
    id: data.id as string,
    type: data.type as PaymentMethod['type'],
    label: data.label as string,
    account_name: data.account_name as string,
    account_number: data.account_number as string | null,
    mobile_number: data.mobile_number as string | null,
    bank_name: data.bank_name as string | null,
    iban: data.iban as string | null,
    is_active: data.is_active as boolean,
    sort_order: data.sort_order as number,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  }
}

function normalizePaymentRequest(data: Record<string, unknown>): PaymentRequest {
  return {
    id: data.id as string,
    user_id: data.user_id as string,
    plan_id: data.plan_id as string,
    payment_method_id: data.payment_method_id as string,
    amount: data.amount as number,
    currency: data.currency as string,
    transaction_id: data.transaction_id as string,
    sender_name: data.sender_name as string,
    sender_account: data.sender_account as string | null,
    notes: data.notes as string | null,
    status: data.status as PaymentRequest['status'],
    admin_notes: data.admin_notes as string | null,
    verified_by: data.verified_by as string | null,
    created_at: data.created_at as string,
    verified_at: data.verified_at as string | null,
    plan: data.plan as PaymentRequest['plan'],
    payment_method: data.payment_method as PaymentRequest['payment_method'],
  }
}

function normalizePriceHistory(data: Record<string, unknown>): PlanPriceHistory {
  return {
    id: data.id as string,
    plan_id: data.plan_id as string,
    price_pkr: data.price_pkr as number,
    change_reason: data.change_reason as string,
    applied_by: data.applied_by as string | null,
    created_at: data.created_at as string,
  }
}

function normalizeDiaryEntry(data: Record<string, unknown>): DiaryEntry {
  return {
    id: data.id as string,
    case_id: data.case_id as string,
    date: data.date as string,
    court_id: data.court_id as string | null,
    division: data.division as string | null,
    judge_id: data.judge_id as string | null,
    purpose: data.purpose as string | null,
    description: data.description as string | null,
    status: data.status as string,
    remarks: data.remarks as string | null,
    reminder_minutes: data.reminder_minutes as number | null,
    reminder_sent: data.reminder_sent as boolean,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeTimeEntry(data: Record<string, unknown>): TimeEntry {
  return {
    id: data.id as string,
    user_id: data.user_id as string,
    case_id: data.case_id as string | null,
    description: data.description as string,
    start_time: data.start_time as string,
    end_time: data.end_time as string | null,
    duration_minutes: data.duration_minutes as number | null,
    billable_rate: data.billable_rate as number | null,
    is_billable: data.is_billable as boolean,
    date: data.date as string,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeTask(data: Record<string, unknown>): Task {
  return {
    id: data.id as string,
    user_id: data.user_id as string,
    case_id: data.case_id as string | null,
    title: data.title as string,
    description: data.description as string | null,
    due_date: data.due_date as string | null,
    priority: data.priority as Task['priority'],
    status: data.status as Task['status'],
    assigned_to: data.assigned_to as string | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeNotice(data: Record<string, unknown>): Notice {
  return {
    id: data.id as string,
    case_id: data.case_id as string,
    notice_type: data.notice_type as Notice['notice_type'],
    issued_to: data.issued_to as string,
    issued_date: data.issued_date as string,
    served_date: data.served_date as string | null,
    status: data.status as Notice['status'],
    content: data.content as string | null,
    remarks: data.remarks as string | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeSummons(data: Record<string, unknown>): Summons {
  return {
    id: data.id as string,
    case_id: data.case_id as string,
    summons_type: data.summons_type as Summons['summons_type'],
    issued_to: data.issued_to as string,
    issued_date: data.issued_date as string,
    return_date: data.return_date as string | null,
    hearing_date: data.hearing_date as string | null,
    status: data.status as Summons['status'],
    remarks: data.remarks as string | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeOrderCopy(data: Record<string, unknown>): OrderCopyRequest {
  return {
    id: data.id as string,
    case_id: data.case_id as string,
    order_date: data.order_date as string,
    order_summary: data.order_summary as string | null,
    applied_date: data.applied_date as string,
    status: data.status as OrderCopyRequest['status'],
    court_fee: data.court_fee as number | null,
    estimated_cost: data.estimated_cost as number | null,
    received_date: data.received_date as string | null,
    remarks: data.remarks as string | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizePersonalNote(data: Record<string, unknown>): PersonalNote {
  return {
    id: data.id as string,
    user_id: data.user_id as string,
    title: data.title as string,
    content: data.content as string,
    category: data.category as string | null,
    case_id: data.case_id as string | null,
    tags: data.tags as string[] | null,
    pinned: data.pinned as boolean,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}

function normalizeLegalReference(data: Record<string, unknown>): LegalReference {
  return {
    id: data.id as string,
    user_id: data.user_id as string,
    title: data.title as string,
    reference_type: data.reference_type as LegalReference['reference_type'],
    jurisdiction: data.jurisdiction as string | null,
    year: data.year as number | null,
    description: data.description as string | null,
    content_text: data.content_text as string | null,
    tags: data.tags as string[] | null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  }
}
