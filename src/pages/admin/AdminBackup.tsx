import { useRef, useState } from 'react'
import { exportBackup, importBackup, type ImportResult } from '@/lib/backup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleExport() {
    await exportBackup()
  }

  async function handleImport(file: File) {
    setImporting(true)
    setImportStatus(null)

    const result: ImportResult = await importBackup(file)

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Imported ${result.entryCount} records successfully. Refreshing...`,
      })
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Import failed' })
    }

    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImport(file)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Backup & Restore</h1>

      <Card>
        <CardHeader>
          <CardTitle>Data Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">Regular backups are strongly recommended</p>
                <p className="mt-0.5 text-amber-700">
                  Export the entire database as a JSON file and store it in a safe location.
                  Use the import feature to restore data from a previous backup.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Export your entire case diary database to your local drive as a JSON file, or import from a local backup file.
          </p>

          {importStatus && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                importStatus.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {importStatus.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-1" /> Export Backup
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} className="mr-1" /> {importing ? 'Importing...' : 'Import Backup'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
