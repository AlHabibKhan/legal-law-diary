import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/data/faq'

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
  subtitle?: string
}

export function FAQSection({ items, title, subtitle }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full">
      {title && (
        <h2 className="mb-2 text-center text-xl font-bold text-slate-900">{title}</h2>
      )}
      {subtitle && (
        <p className="mb-6 text-center text-sm text-slate-500">{subtitle}</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-slate-900 pr-4">{item.q}</span>
              <ChevronDown
                size={18}
                className={cn(
                  'shrink-0 text-slate-400 transition-transform duration-200',
                  openIndex === i && 'rotate-180'
                )}
              />
            </button>
            {openIndex === i && (
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
