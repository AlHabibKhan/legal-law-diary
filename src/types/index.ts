export interface LawyerProfile {
  id: string
  full_name: string
  bar_council: string
  license_number: string
  mobile_number: string
  cnic: string | null
  chamber_address: string | null
  practice_areas: string | null
  role?: 'lawyer' | 'admin' | 'firm_admin'
  account_status?: 'active' | 'suspended' | 'cancelled'
  trial_ends_at?: string | null
  firm_id?: string | null
}

export interface Court {
  id: string
  name: string
  type: string
  level: string
  parent_id: string | null
  city: string | null
  province: string | null
  address?: string | null
  phone?: string | null
}

export interface Case {
  id: string
  case_number: string
  title: string
  case_type: string | null
  court_id: string | null
  division: string | null
  judge_id: string | null
  filing_date: string | null
  status: string
  description: string | null
  remarks: string | null
  created_at?: string
  updated_at?: string
  firm_id?: string | null
}

export interface Client {
  id: string
  name: string
  cnic: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  firm_id?: string | null
}

export interface DiaryEntry {
  id: string
  case_id: string
  date: string
  court_id: string | null
  division: string | null
  judge_id: string | null
  purpose: string | null
  description: string | null
  status: string
  remarks: string | null
  reminder_minutes: number | null
  reminder_sent: boolean
  created_at?: string
  updated_at?: string
}

export interface Proceeding {
  id: string
  case_id: string
  date: string
  proceeding_type: string | null
  order_summary: string | null
  next_date: string | null
  remarks: string | null
  created_at?: string
}

export interface Document {
  id: string
  case_id: string
  name: string
  type: string | null
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  notes?: string | null
  created_at?: string
}

export interface CaseParty {
  id: string
  case_id: string
  client_id: string | null
  party_type: string
  party_name: string | null
  is_client: boolean
}

export interface DashboardStats {
  total_cases: number
  active_cases: number
  today_hearings: number
  upcoming_hearings: number
  total_clients: number
  pending_tasks: number
  todays_time_minutes: number
}

export interface PersonalNote {
  id: string
  user_id?: string
  title: string
  content: string
  category: string | null
  case_id: string | null
  tags: string[] | null
  pinned: boolean
  created_at?: string
  updated_at?: string
}

export interface LegalReference {
  id: string
  user_id?: string
  title: string
  reference_type: 'Statute' | 'Act' | 'Ordinance' | 'Rules' | 'Regulation' | 'Treaty' | 'Other'
  jurisdiction: string | null
  year: number | null
  description: string | null
  content_text: string | null
  tags: string[] | null
  created_at?: string
  updated_at?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  type: 'individual' | 'firm'
  interval: 'month' | 'year'
  price_usd: number
  price_pkr: number
  max_members: number
  max_storage_mb: number
  features: string[]
  is_active: boolean
  increase_percentage: number
  increase_interval_months: number
  last_increase_at: string | null
  next_increase_at: string | null
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
  trial_start: string | null
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  locked_price_pkr: number | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface Firm {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  owner_id: string
  subscription_id: string | null
  max_members: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FirmMember {
  id: string
  firm_id: string
  profile_id: string
  role: 'admin' | 'member'
  joined_at: string
  profile?: LawyerProfile
}

export interface Invoice {
  id: string
  subscription_id: string
  user_id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  stripe_invoice_id: string | null
  period_start: string | null
  period_end: string | null
  paid_at: string | null
  created_at: string
}

export interface AdminStats {
  total_users: number
  active_users: number
  total_firms: number
  total_cases: number
  total_clients: number
  monthly_revenue: number
  subscriptions_by_plan: { plan_name: string; count: number }[]
}

export interface PaymentMethod {
  id: string
  type: 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'dubai_islamic' | 'nbp' | 'mashreq'
  label: string
  account_name: string
  account_number: string | null
  mobile_number: string | null
  bank_name: string | null
  iban: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PaymentRequest {
  id: string
  user_id: string
  plan_id: string
  payment_method_id: string
  amount: number
  currency: string
  transaction_id: string
  sender_name: string
  sender_account: string | null
  notes: string | null
  status: 'pending' | 'verified' | 'rejected'
  admin_notes: string | null
  verified_by: string | null
  created_at: string
  verified_at: string | null
  plan?: SubscriptionPlan
  payment_method?: PaymentMethod
}

export interface PlanPriceHistory {
  id: string
  plan_id: string
  price_pkr: number
  change_reason: string
  applied_by: string | null
  created_at: string
}

export interface Notice {
  id: string
  case_id: string
  notice_type: 'Legal Notice' | 'Court Notice' | 'Show Cause' | 'Demand Notice' | 'Other'
  issued_to: string
  issued_date: string
  served_date: string | null
  status: 'Draft' | 'Issued' | 'Served' | 'Returned' | 'Complied'
  content: string | null
  remarks: string | null
  created_at?: string
  updated_at?: string
}

export interface Summons {
  id: string
  case_id: string
  summons_type: 'Witness' | 'Defendant' | 'Document Production' | 'Expert' | 'Other'
  issued_to: string
  issued_date: string
  return_date: string | null
  hearing_date: string | null
  status: 'Draft' | 'Issued' | 'Served' | 'Returned' | 'Complied'
  remarks: string | null
  created_at?: string
  updated_at?: string
}

export interface OrderCopyRequest {
  id: string
  case_id: string
  order_date: string
  order_summary: string | null
  applied_date: string
  status: 'Draft' | 'Applied' | 'Processing' | 'Ready' | 'Received'
  court_fee: number | null
  estimated_cost: number | null
  received_date: string | null
  remarks: string | null
  created_at?: string
  updated_at?: string
}

export interface TimeEntry {
  id: string
  user_id?: string
  case_id: string | null
  description: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  billable_rate: number | null
  is_billable: boolean
  date: string
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: string
  user_id?: string
  case_id: string | null
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to: string | null
  created_at?: string
  updated_at?: string
}

export interface CourtHoliday {
  date: string
  name: string
  type: 'public' | 'court' | 'religious'
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export const BAR_COUNCILS = [
  { value: 'PBC', label: 'Pakistan Bar Council (PBC)' },
  { value: 'PBCP', label: 'Punjab Bar Council (PBCP)' },
  { value: 'SBC', label: 'Sindh Bar Council (SBC)' },
  { value: 'BBC', label: 'Balochistan Bar Council (BBC)' },
  { value: 'KBC', label: 'Khyber Pakhtunkhwa Bar Council (KBC)' },
  { value: 'IBC', label: 'Islamabad Bar Council (IBC)' },
] as const

export const CASE_STATUSES = [
  'Active',
  'Pending',
  'Adjourned',
  'Decided',
  'Stayed',
  'Transferred',
  'Disposed',
] as const

export const PARTY_TYPES = [
  'Petitioner',
  'Respondent',
  'Plaintiff',
  'Defendant',
  'Appellant',
  'Respondent',
  'Applicant',
  'Opponent',
  'Complainant',
  'Accused',
  'Objector',
  'Legal Heir',
] as const

export const DIVISIONS = ['Civil', 'Criminal'] as const

export const NOTICE_TYPES = ['Legal Notice', 'Court Notice', 'Show Cause', 'Demand Notice', 'Other'] as const

export const SUMMONS_TYPES = ['Witness', 'Defendant', 'Document Production', 'Expert', 'Other'] as const

export const CLERICAL_STATUSES = ['Draft', 'Issued', 'Served', 'Returned', 'Complied'] as const

export const ORDER_COPY_STATUSES = ['Draft', 'Applied', 'Processing', 'Ready', 'Received'] as const

export const NOTE_CATEGORIES = ['General', 'Case Strategy', 'Legal Research', 'Client Notes', 'To-Do', 'Reference', 'Other'] as const

export const REFERENCE_TYPES = ['Statute', 'Act', 'Ordinance', 'Rules', 'Regulation', 'Treaty', 'Other'] as const

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad',
] as const
