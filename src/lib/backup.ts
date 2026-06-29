import type { LawyerProfile, Case, Client, DiaryEntry, Proceeding, CaseParty, Document } from '@/types'

const PREFIX = 'ld:'

interface BackupData {
  version: number
  exported_at: string
  data: {
    lawyer_profile: LawyerProfile | null
    cases: Case[]
    clients: Client[]
    diary_entries: DiaryEntry[]
    proceedings: Proceeding[]
    parties: CaseParty[]
    documents: Document[]
  }
}

function getAllCollections(): BackupData['data'] {
  function getCol<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  return {
    lawyer_profile: (() => {
      try {
        const raw = localStorage.getItem(PREFIX + 'lawyer_profile')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })(),
    cases: getCol<Case>('cases'),
    clients: getCol<Client>('clients'),
    diary_entries: getCol<DiaryEntry>('diary_entries'),
    proceedings: getCol<Proceeding>('proceedings'),
    parties: getCol<CaseParty>('parties'),
    documents: getCol<Document>('documents'),
  }
}

function setAllCollections(data: BackupData['data']): void {
  function setCol(key: string, value: unknown): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  }

  setCol('lawyer_profile', data.lawyer_profile)
  setCol('cases', data.cases)
  setCol('clients', data.clients)
  setCol('diary_entries', data.diary_entries)
  setCol('proceedings', data.proceedings)
  setCol('parties', data.parties)
  setCol('documents', data.documents)
}

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 1,
    exported_at: new Date().toISOString(),
    data: getAllCollections(),
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const date = new Date().toISOString().slice(0, 10)
  const suggestedName = `legal-diary-backup-${date}.json`

  if ('showSaveFilePicker' in window) {
    try {
      const handle: any = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  entryCount: number
  error?: string
}

export function importBackup(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backup: BackupData = JSON.parse(content)

        if (!backup || backup.version !== 1) {
          resolve({ success: false, entryCount: 0, error: 'Invalid backup file' })
          return
        }

        setAllCollections(backup.data)

        // Re-register so the app recognizes the lawyer
        if (backup.data.lawyer_profile) {
          localStorage.setItem('is_registered', 'true')
        }

        const total =
          backup.data.cases.length +
          backup.data.clients.length +
          backup.data.diary_entries.length +
          backup.data.proceedings.length +
          backup.data.parties.length +
          backup.data.documents.length

        resolve({ success: true, entryCount: total })
      } catch {
        resolve({ success: false, entryCount: 0, error: 'Could not parse backup file' })
      }
    }

    reader.onerror = () => {
      resolve({ success: false, entryCount: 0, error: 'Failed to read file' })
    }

    reader.readAsText(file)
  })
}
