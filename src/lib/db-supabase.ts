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
      return { total_cases: 0, active_cases: 0, today_hearings: 0, upcoming_hearings: 0, total_clients: 0 }
    }

    const today = new Date().toISOString().split('T')[0]
    const userId = user.id

    const [{ count: totalCases }, { count: activeCases }, { count: todayHearings }, { count: upcomingHearings }, { count: totalClients }] = await Promise.all([
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Active'),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('date', today),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('date', today),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ])

    return {
      total_cases: totalCases ?? 0,
      active_cases: activeCases ?? 0,
      today_hearings: todayHearings ?? 0,
      upcoming_hearings: upcomingHearings ?? 0,
      total_clients: totalClients ?? 0,
    }
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
