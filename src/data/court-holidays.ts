import type { CourtHoliday } from '@/types'

export const PAKISTAN_COURT_HOLIDAYS: CourtHoliday[] = [
  // Fixed public holidays
  { date: '2026-01-01', name: 'New Year\'s Day', type: 'public' },
  { date: '2026-01-05', name: 'Kashmir Day', type: 'public' },
  { date: '2026-01-31', name: 'Shab-e-Miraj', type: 'religious' },
  { date: '2026-02-05', name: 'Kashmir Solidarity Day', type: 'public' },
  { date: '2026-03-01', name: 'Shab-e-Barat', type: 'religious' },
  { date: '2026-03-23', name: 'Pakistan Day', type: 'public' },
  { date: '2026-04-01', name: 'Jumat-ul-Wida', type: 'religious' },
  { date: '2026-04-04', name: 'Youm-e-Ali (RA)', type: 'religious' },
  { date: '2026-05-01', name: 'Labour Day', type: 'public' },
  { date: '2026-05-04', name: 'Eid-ul-Fitr Day 1', type: 'religious' },
  { date: '2026-05-05', name: 'Eid-ul-Fitr Day 2', type: 'religious' },
  { date: '2026-05-06', name: 'Eid-ul-Fitr Day 3', type: 'religious' },
  { date: '2026-07-09', name: 'Eid-ul-Adha Day 1', type: 'religious' },
  { date: '2026-07-10', name: 'Eid-ul-Adha Day 2', type: 'religious' },
  { date: '2026-07-11', name: 'Eid-ul-Adha Day 3', type: 'religious' },
  { date: '2026-07-30', name: 'Muharram (Ashura) Day 1', type: 'religious' },
  { date: '2026-07-31', name: 'Muharram (Ashura) Day 2', type: 'religious' },
  { date: '2026-08-14', name: 'Independence Day', type: 'public' },
  { date: '2026-09-10', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', type: 'religious' },
  { date: '2026-09-16', name: 'Defence Day', type: 'public' },
  { date: '2026-10-07', name: 'Iqbal Day', type: 'public' },
  { date: '2026-11-09', name: 'Iqbal Day', type: 'public' },
  { date: '2026-12-25', name: 'Quaid-e-Azam Day / Christmas', type: 'public' },

  // Court-specific summer vacation (varies by High Court)
  // Lahore High Court summer break: ~July-August
  { date: '2026-07-15', name: 'LHC Summer Vacation Start', type: 'court' },
  { date: '2026-08-15', name: 'LHC Summer Vacation End', type: 'court' },
  // Sindh High Court summer break
  { date: '2026-07-01', name: 'SHC Summer Vacation Start', type: 'court' },
  { date: '2026-07-31', name: 'SHC Summer Vacation End', type: 'court' },
  // Peshawar High Court summer break
  { date: '2026-07-20', name: 'PHC Summer Vacation Start', type: 'court' },
  { date: '2026-08-20', name: 'PHC Summer Vacation End', type: 'court' },
  // Balochistan High Court summer break
  { date: '2026-07-10', name: 'BHC Summer Vacation Start', type: 'court' },
  { date: '2026-08-10', name: 'BHC Summer Vacation End', type: 'court' },
  // Islamabad High Court summer break
  { date: '2026-07-25', name: 'IHC Summer Vacation Start', type: 'court' },
  { date: '2026-08-25', name: 'IHC Summer Vacation End', type: 'court' },

  // Winter vacations
  { date: '2026-12-22', name: 'Winter Vacation Start', type: 'court' },
  { date: '2027-01-04', name: 'Winter Vacation End', type: 'court' },
]

export function getHolidaysForMonth(year: number, month: number): CourtHoliday[] {
  return PAKISTAN_COURT_HOLIDAYS.filter(h => {
    const d = new Date(h.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function getHolidaysForDate(date: string): CourtHoliday[] {
  return PAKISTAN_COURT_HOLIDAYS.filter(h => h.date === date)
}

export function isHoliday(date: string): boolean {
  return PAKISTAN_COURT_HOLIDAYS.some(h => h.date === date)
}

export function getNextHoliday(fromDate?: string): CourtHoliday | null {
  const today = fromDate || new Date().toISOString().split('T')[0]
  const upcoming = PAKISTAN_COURT_HOLIDAYS
    .filter(h => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] || null
}
