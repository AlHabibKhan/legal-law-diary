import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calculator, Calendar, Clock, DollarSign, Scale, Gavel, ArrowLeft } from 'lucide-react'
import { AdBanner } from '@/components/ads/AdBanner'
import { formatDate } from '@/lib/utils'

type TabId = 'limitation' | 'court-fee' | 'interest' | 'date-math' | 'case-age'

const tabs: { id: TabId; label: string; icon: typeof Calculator }[] = [
  { id: 'limitation', label: 'Limitation', icon: Clock },
  { id: 'court-fee', label: 'Court Fee', icon: DollarSign },
  { id: 'interest', label: 'Interest', icon: Gavel },
  { id: 'date-math', label: 'Date Math', icon: Calendar },
  { id: 'case-age', label: 'Case Age', icon: Scale },
]

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

const COURT_FEE_CATEGORIES = [
  { value: 'money', label: 'Money Suit / Recovery' },
  { value: 'property', label: 'Property / Land Dispute' },
  { value: 'family', label: 'Family Case (Fixed)' },
  { value: 'injunction', label: 'Injunction / Declaration' },
  { value: 'appeal', label: 'Appeal (Civil)' },
]

const PROVINCES = [
  { value: 'punjab', label: 'Punjab' },
  { value: 'sindh', label: 'Sindh' },
  { value: 'kpk', label: 'Khyber Pakhtunkhwa' },
  { value: 'balochistan', label: 'Balochistan' },
  { value: 'islamabad', label: 'Islamabad (ICT)' },
]

function estimateCourtFee(category: string, value: number, _province: string): number {
  if (category === 'family') return Math.min(value, 5000)
  if (category === 'injunction') return 1000 + Math.min(value * 0.01, 10000)

  if (value <= 50000) return 500
  if (value <= 100000) return 500 + (value - 50000) * 0.01
  if (value <= 500000) return 1000 + (value - 100000) * 0.02
  if (value <= 1000000) return 9000 + (value - 500000) * 0.03
  if (value <= 10000000) return 24000 + (value - 1000000) * 0.05

  const maxFee = category === 'appeal' ? 500000 : 1000000
  return Math.min(24000 + (value - 1000000) * 0.05, maxFee)
}

function TabButton({ active, icon: Icon, label, onClick }: {
  active: boolean; icon: typeof Calculator; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function LimitationTab() {
  const [filingDate, setFilingDate] = useState('')
  const [periodDays, setPeriodDays] = useState('1095')
  const [customDays, setCustomDays] = useState('')
  const [result, setResult] = useState<{
    start: string; end: string; remaining: number; expired: boolean
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
    <div className="space-y-4">
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

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="text-sm font-medium text-slate-900">{result.start}</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Expiry Date</p>
              <p className={`text-sm font-medium ${result.expired ? 'text-red-600' : 'text-slate-900'}`}>
                {result.end}
              </p>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-center ${result.expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <p className="text-2xl font-bold">{result.remaining} days</p>
            <p className="text-sm">
              {result.expired ? 'Limitation period has EXPIRED' : 'Remaining before expiry'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CourtFeeTab() {
  const [category, setCategory] = useState('money')
  const [suitValue, setSuitValue] = useState('')
  const [province, setProvince] = useState('punjab')
  const [fee, setFee] = useState<number | null>(null)

  function calculate() {
    const value = parseFloat(suitValue)
    if (isNaN(value) || value <= 0) return
    setFee(estimateCourtFee(category, value, province))
  }

  return (
    <div className="space-y-4">
      <Select
        id="fee_category"
        label="Case Category"
        options={COURT_FEE_CATEGORIES}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Select
        id="fee_province"
        label="Province"
        options={PROVINCES}
        value={province}
        onChange={(e) => setProvince(e.target.value)}
      />

      <Input
        id="suit_value"
        label="Suit / Claim Value (PKR)"
        type="number"
        placeholder="e.g. 500000"
        value={suitValue}
        onChange={(e) => setSuitValue(e.target.value)}
      />

      <Button className="w-full" onClick={calculate}>
        <Calculator size={16} className="mr-2" /> Calculate Court Fee
      </Button>

      {fee !== null && (
        <div className="rounded-lg border border-slate-100 bg-blue-50 p-4 text-center">
          <p className="text-xs text-slate-500">Estimated Court Fee</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">
            PKR {fee.toLocaleString('en-PK')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on {COURT_FEE_CATEGORIES.find((c) => c.value === category)?.label} in {PROVINCES.find((p) => p.value === province)?.label}
          </p>
        </div>
      )}
    </div>
  )
}

function InterestTab() {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('8')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [result, setResult] = useState<{
    days: number; interest: number; total: number
  } | null>(null)

  function calculate() {
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    if (isNaN(p) || isNaN(r) || !fromDate) return
    const from = new Date(fromDate)
    const to = toDate ? new Date(toDate) : new Date()
    if (from > to) return
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    const interest = (p * r * days) / (100 * 365)
    setResult({ days, interest, total: p + interest })
  }

  return (
    <div className="space-y-4">
      <Input
        id="principal"
        label="Principal Amount (PKR)"
        type="number"
        placeholder="e.g. 1000000"
        value={principal}
        onChange={(e) => setPrincipal(e.target.value)}
      />

      <Input
        id="interest_rate"
        label="Annual Interest Rate (%)"
        type="number"
        step="0.1"
        placeholder="e.g. 8"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
      />

      <Input
        id="interest_from"
        label="From Date (decree / filing)"
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <Input
        id="interest_to"
        label="To Date (leave blank for today)"
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <Button className="w-full" onClick={calculate}>
        <Calculator size={16} className="mr-2" /> Calculate Interest
      </Button>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Period</p>
              <p className="text-sm font-medium text-slate-900">{result.days} days</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Interest</p>
              <p className="text-sm font-bold text-green-600">
                PKR {Math.round(result.interest).toLocaleString('en-PK')}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Total Due</p>
              <p className="text-sm font-bold text-blue-700">
                PKR {Math.round(result.total).toLocaleString('en-PK')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DateMathTab() {
  const [startDate, setStartDate] = useState('')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [value, setValue] = useState('30')
  const [unit, setUnit] = useState('days')
  const [result, setResult] = useState<string | null>(null)

  function calculate() {
    if (!startDate) return
    const d = new Date(startDate)
    const v = parseInt(value)
    if (isNaN(v)) return

    if (unit === 'days') d.setDate(d.getDate() + (operation === 'add' ? v : -v))
    else if (unit === 'weeks') d.setDate(d.getDate() + (operation === 'add' ? v * 7 : -v * 7))
    else if (unit === 'months') d.setMonth(d.getMonth() + (operation === 'add' ? v : -v))
    else if (unit === 'years') d.setFullYear(d.getFullYear() + (operation === 'add' ? v : -v))

    setResult(d.toLocaleDateString('en-PK', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    }))
  }

  return (
    <div className="space-y-4">
      <Input
        id="math_start"
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-3">
        <Select
          id="math_op"
          label="Operation"
          options={[{ value: 'add', label: 'Add' }, { value: 'subtract', label: 'Subtract' }]}
          value={operation}
          onChange={(e) => setOperation(e.target.value as 'add' | 'subtract')}
        />

        <Input
          id="math_value"
          label="Value"
          type="number"
          placeholder="30"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Select
          id="math_unit"
          label="Unit"
          options={[
            { value: 'days', label: 'Days' },
            { value: 'weeks', label: 'Weeks' },
            { value: 'months', label: 'Months' },
            { value: 'years', label: 'Years' },
          ]}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={calculate}>
        <Calculator size={16} className="mr-2" /> Calculate Date
      </Button>

      {result && (
        <div className="rounded-lg border border-slate-100 bg-blue-50 p-4 text-center">
          <p className="text-xs text-slate-500">Result Date</p>
          <p className="mt-1 text-lg font-bold text-blue-700">{result}</p>
        </div>
      )}
    </div>
  )
}

function CaseAgeTab() {
  const [filingDate, setFilingDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<{
    years: number; months: number; days: number; totalDays: number
  } | null>(null)

  function calculate() {
    if (!filingDate) return
    const start = new Date(filingDate)
    const end = endDate ? new Date(endDate) : new Date()
    if (start > end) return

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    let days = end.getDate() - start.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    setResult({ years, months, days, totalDays })
  }

  return (
    <div className="space-y-4">
      <Input
        id="age_filing"
        label="Filing / Start Date"
        type="date"
        value={filingDate}
        onChange={(e) => setFilingDate(e.target.value)}
      />

      <Input
        id="age_end"
        label="End Date (leave blank for today)"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <Button className="w-full" onClick={calculate}>
        <Calculator size={16} className="mr-2" /> Calculate Age
      </Button>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.years}</p>
              <p className="text-xs text-slate-500">Years</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.months}</p>
              <p className="text-xs text-slate-500">Months</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.days}</p>
              <p className="text-xs text-slate-500">Days</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{result.totalDays}</p>
              <p className="text-xs text-slate-500">Total Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tools() {
  const [activeTab, setActiveTab] = useState<TabId>('limitation')
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Legal Tools & Calculators</h1>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            label={tab.label}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      <AdBanner adKey="TOOLS_TOP" height={90} width={728} className="mx-auto" />

      {/* Active Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle>{tabs.find((t) => t.id === activeTab)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'limitation' && <LimitationTab />}
          {activeTab === 'court-fee' && <CourtFeeTab />}
          {activeTab === 'interest' && <InterestTab />}
          {activeTab === 'date-math' && <DateMathTab />}
          {activeTab === 'case-age' && <CaseAgeTab />}
        </CardContent>
      </Card>

      <AdBanner adKey="TOOLS_BANNER" height={250} width={300} className="mx-auto" />
    </div>
  )
}
