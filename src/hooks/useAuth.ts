import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { checkConnection, db } from '@/lib/db'
import type { LawyerProfile } from '@/types'

interface AuthState {
  isRegistered: boolean
  isAuthenticated: boolean
  profile: LawyerProfile | null
  pinSet: boolean
  isAdmin: boolean
  trialDaysLeft: number | null
  setRegistered: (v: boolean) => void
  setAuthenticated: (v: boolean) => void
  setProfile: (p: LawyerProfile | null) => void
  setPinSet: (v: boolean) => void
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  isRegistered: false,
  isAuthenticated: false,
  profile: null,
  pinSet: false,
  isAdmin: false,
  trialDaysLeft: null,

  setRegistered: (v) => set({ isRegistered: v }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setProfile: (p) => set({
    profile: p,
    isAdmin: p?.role === 'admin',
    trialDaysLeft: p?.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(p.trial_ends_at).getTime() - Date.now()) / 86400000))
      : null,
  }),
  setPinSet: (v) => set({ pinSet: v }),

  logout: () => {
    supabase.auth.signOut()
    set({ isAuthenticated: false, profile: null, isRegistered: false, isAdmin: false, trialDaysLeft: null })
  },

  initialize: async () => {
    await checkConnection()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      const registered = localStorage.getItem('is_registered') === 'true'
      const storedProfile = localStorage.getItem('lawyer_profile') || localStorage.getItem('ld:lawyer_profile')
      const hasPin = !!localStorage.getItem('app_pin')

      if (registered && storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)
          set({
            profile,
            isRegistered: true,
            isAuthenticated: true,
            pinSet: hasPin,
            isAdmin: profile.role === 'admin',
            trialDaysLeft: null,
          })
          // ensure bare key exists for login fallback
          localStorage.setItem('lawyer_profile', storedProfile)
        } catch {
          // corrupt data
        }
      }
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const p: LawyerProfile = {
        id: profile.id,
        full_name: profile.full_name,
        bar_council: profile.bar_council,
        license_number: profile.license_number,
        mobile_number: profile.mobile_number,
        cnic: profile.cnic,
        chamber_address: profile.chamber_address,
        practice_areas: profile.practice_areas,
        role: profile.role,
        account_status: profile.account_status,
        trial_ends_at: profile.trial_ends_at,
        firm_id: profile.firm_id,
      }
      set({
        profile: p,
        isRegistered: true,
        isAuthenticated: true,
        pinSet: false,
        isAdmin: profile.role === 'admin',
        trialDaysLeft: profile.trial_ends_at
          ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
          : null,
      })
      // Refresh local cache from cloud (non-blocking)
      db.syncOnLogin().catch(() => {})
    } else {
      const storedProfile = localStorage.getItem('lawyer_profile') || localStorage.getItem('ld:lawyer_profile')
      if (storedProfile) {
        try {
          const localProfile = JSON.parse(storedProfile)
          set({
            profile: localProfile,
            isRegistered: true,
            isAuthenticated: true,
            pinSet: !!localStorage.getItem('app_pin'),
            isAdmin: localProfile.role === 'admin',
            trialDaysLeft: null,
          })
          localStorage.setItem('lawyer_profile', storedProfile)
        } catch { /* corrupt data */ }
      }
    }
  },
}))
