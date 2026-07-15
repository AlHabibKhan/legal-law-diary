import { useNavigate } from 'react-router-dom'
import { FAQSection } from '@/components/FAQSection'
import { FAQ_DATA } from '@/data/faq'
import { ArrowLeft, HelpCircle } from 'lucide-react'

export default function FAQ() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <HelpCircle size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h1>
            <p className="text-sm text-slate-500">Everything you need to know about Legal Law Diary</p>
          </div>
        </div>

        <FAQSection items={FAQ_DATA} />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Still have questions?{' '}
            <a
              href="mailto:admin@legallawdiary.com"
              className="font-medium text-blue-600 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
