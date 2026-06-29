import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calculator, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LIMITATION_PERIODS = [
  { value: '90', label: '90 days — Appeal (Magistrate)' },
  { value: '180', label: '180 days — Civil Appeal (District Court)' },
  { value: '365', label: '1 year — Criminal Appeal (High Court)' },
  { value: '730', label: '2 years — Tort / Damages' },
  { value: '1095', label: '3 years — Civil Suit (Specific Performance)' },
  { value: '1825', label: '5 years — Execution of Decree' },
  { value: '2190', label: '6 years — Contract (Written)' },
  { value: '3650', label: '10 years — Recovery of Land' },
  { value: '10950', label: '30 years — Right to Property' },
  { value: 'custom', label: 'Custom period...' },
]

export default function LimitationCalc() {
  const [filingDate, setFilingDate] = useState('')
  const [periodDays, setPeriodDays] = useState('1095')
  const [customDays, setCustomDays] = useState('')
  const [result, setResult] = useState<{
    start: string
    end: string
    remaining: number
    expired: boolean
  } | null>(null)

  function calculate() {
    if (!filingDate) return

    const start = new Date(filingDate)
    const days = periodDays === 'custom' ? parseInt(customDays) : parseInt(periodDays)
    if (isNaN(days)) return

    const end = new Date(start)
    end.setDate(end.getDate() + days)

    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    setResult({
      start: formatDate(filingDate),
      end: formatDate(end.toISOString().split('T')[0]),
      remaining: Math.max(0, remainingDays),
      expired: remainingDays <= 0,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Limitation Calculator
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Limitation Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="filing_date"
            label="Cause of Action / Filing Date"
            type="date"
            value={filingDate}
            onChange={(e) => setFilingDate(e.target.value)}
          />

          <Select
            id="limitation_period"
            label="Limitation Period"
            options={LIMITATION_PERIODS}
            value={periodDays}
            onChange={(e) => setPeriodDays(e.target.value)}
          />

          {periodDays === 'custom' && (
            <Input
              id="custom_days"
              label="Custom Days"
              type="number"
              placeholder="Enter number of days"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
            />
          )}

          <Button className="w-full" onClick={calculate}>
            <Calculator size={16} className="mr-2" /> Calculate
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs text-slate-500">Start Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {result.start}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs text-slate-500">Expiry Date</p>
                <p
                  className={`text-sm font-medium ${
                    result.expired ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {result.end}
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg p-4 text-center ${
                result.expired
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              <p className="text-2xl font-bold">{result.remaining} days</p>
              <p className="text-sm">
                {result.expired
                  ? 'Limitation period has EXPIRED'
                  : 'Remaining before expiry'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
