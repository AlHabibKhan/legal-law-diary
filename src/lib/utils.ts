import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function validateLicenseNumber(
  barCouncil: string,
  licenseNumber: string
): { valid: boolean; error?: string } {
  if (!licenseNumber.trim()) {
    return { valid: false, error: 'License number is required' }
  }

  const patterns: Record<string, RegExp> = {
    PBC: /^PBC[-/\s]?\d{4,6}$/i,
    PBCP: /^PBCP[-/\s]?\d{4,6}$/i,
    SBC: /^SBC[-/\s]?\d{4,6}$/i,
    BBC: /^BBC[-/\s]?\d{4,6}$/i,
    KBC: /^KBC[-/\s]?\d{4,6}$/i,
    IBC: /^IBC[-/\s]?\d{4,6}$/i,
  }

  const pattern = patterns[barCouncil]
  if (pattern && !pattern.test(licenseNumber.trim())) {
    return {
      valid: false,
      error: `Invalid format. Expected format: ${barCouncil}-XXXXX (e.g., ${barCouncil}-12345)`,
    }
  }

  return { valid: true }
}

export function validateMobileNumber(mobile: string): { valid: boolean; error?: string } {
  if (!mobile.trim()) {
    return { valid: false, error: 'Mobile number is required' }
  }

  const cleaned = mobile.replace(/[\s-]/g, '')
  const pkPattern = /^((\+92)|03|3)\d{9}$/

  if (!pkPattern.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid Pakistani mobile number. Expected format: 03XX-XXXXXXX',
    }
  }

  return { valid: true }
}

export function validateCNIC(cnic: string): { valid: boolean; error?: string } {
  if (!cnic) return { valid: true }

  const cleaned = cnic.replace(/[\s-]/g, '')
  const cnicPattern = /^\d{5}\d{7}\d{1}$/

  if (!cnicPattern.test(cleaned)) {
    return { valid: false, error: 'Invalid CNIC format. Expected: XXXXX-XXXXXXX-X' }
  }

  return { valid: true }
}

export function getTodayDate(): string {
  return formatDateISO(new Date())
}

export function getPakistaniTime(date?: Date): string {
  return (date ?? new Date()).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  })
}
