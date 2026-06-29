import { useEffect, useRef } from 'react'

interface AdBannerProps {
  adSlot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || ''
let scriptLoaded = false

export function AdBanner({ adSlot, format = 'auto', className }: AdBannerProps) {
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!AD_CLIENT || scriptLoaded) return
    scriptLoaded = true
    const s = document.createElement('script')
    s.async = true
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`
    s.crossOrigin = 'anonymous'
    document.head.appendChild(s)
  }, [])

  useEffect(() => {
    if (!AD_CLIENT || pushed.current) return
    pushed.current = true
    const timer = setTimeout(() => {
      try {
        const g = window as unknown as { adsbygoogle?: unknown[] }
        if (g.adsbygoogle) g.adsbygoogle.push({})
      } catch { /* ignore */ }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  if (!AD_CLIENT) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 p-3 text-center text-xs text-slate-400 ${className ?? ''}`}
      >
        <div>
          <p className="font-medium text-slate-300">Advertisement</p>
          <p className="mt-0.5">Configure VITE_ADSENSE_CLIENT</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
