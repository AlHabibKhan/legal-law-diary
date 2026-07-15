import { useNavigate, useParams, Link } from 'react-router-dom'
import { GUIDES } from '@/data/guides'
import { ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react'

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const guide = GUIDES.find(g => g.slug === slug)

  if (!guide) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Guide not found</h1>
          <p className="mt-2 text-sm text-slate-500">The guide you are looking for does not exist.</p>
          <Link to="/guides" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to guides
          </Link>
        </div>
      </div>
    )
  }

  const related = GUIDES
    .filter(g => g.category === guide.category && g.slug !== guide.slug)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <article>
          <div className="mb-6">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {guide.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 leading-tight">
              {guide.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {guide.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {guide.readTime}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="prose prose-slate max-w-none">
              {guide.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} className="mt-8 mb-3 text-xl font-bold text-slate-900">
                      {line.replace('## ', '')}
                    </h2>
                  )
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={i} className="mt-6 mb-2 text-lg font-semibold text-slate-800">
                      {line.replace('### ', '')}
                    </h3>
                  )
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={i} className="mt-4 font-semibold text-slate-800">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  )
                }
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') ||
                    line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ')) {
                  return (
                    <li key={i} className="ml-5 text-sm text-slate-600 list-decimal">
                      {line.replace(/^\d+\.\s*/, '')}
                    </li>
                  )
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={i} className="ml-5 text-sm text-slate-600 list-disc">
                      {line.replace('- ', '')}
                    </li>
                  )
                }
                if (line.startsWith('| ')) {
                  return null
                }
                if (line.trim() === '') {
                  return <div key={i} className="h-3" />
                }
                return (
                  <p key={i} className="text-sm leading-relaxed text-slate-600">
                    {line}
                  </p>
                )
              })}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              More in {guide.category}
            </h3>
            <div className="space-y-3">
              {related.map(r => (
                <Link
                  key={r.slug}
                  to={`/guides/${r.slug}`}
                  className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-blue-50 hover:border-blue-200"
                >
                  <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{r.date} · {r.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
