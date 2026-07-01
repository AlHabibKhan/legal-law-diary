import { useEffect, useRef } from 'react'

interface AdBannerProps {
  adKey: string
  format?: string
  height?: number
  width?: number
  className?: string
}

const ADSTERRA_BASE = import.meta.env.VITE_ADSTERRA_BASE || ''

export function AdBanner({ adKey, format = 'iframe', height = 250, width = 300, className }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ADSTERRA_BASE || !adKey || !containerRef.current) return
    if (containerRef.current.firstChild) return

    const atOptions = { key: adKey, format, height, width, params: {} }

    const conf = document.createElement('script')
    conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `//${ADSTERRA_BASE}/${adKey}/invoke.js`

    containerRef.current.appendChild(conf)
    containerRef.current.appendChild(script)
  }, [adKey, format, height, width])

  if (!ADSTERRA_BASE) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 p-3 text-center text-xs text-slate-400 ${className ?? ''}`}
      >
        <div>
          <p className="font-medium text-slate-300">Advertisement</p>
          <p className="mt-0.5">Configure VITE_ADSTERRA_BASE</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
