import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GUIDES } from '@/data/guides'
import { ArrowLeft, BookOpen, Clock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdBanner } from '@/components/ads/AdBanner'

const CATEGORIES = ['All', ...new Set(GUIDES.map(g => g.category))]

export default function Guides() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = GUIDES.filter(g => {
    const matchesSearch = !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || g.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Guides on Pakistani Law</h1>
              <p className="text-sm text-slate-500">
                Practical guides for advocates — practice management, legal procedures, and compliance
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="my-6 flex justify-center">
          <AdBanner adKey="xpdt49gn" height={90} width={728} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No guides found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((guide) => (
              <Link
                key={guide.slug}
                to={`/guides/${guide.slug}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-700">
                        {guide.category}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{guide.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{guide.excerpt}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                      <span>{guide.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {guide.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
