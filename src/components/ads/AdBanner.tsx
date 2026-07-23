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
    if (containerRef.current.dataset.initialized) return
    containerRef.current.dataset.initialized = 'true'

    const container = containerRef.current

    const atOptions = { key: adKey, format, height, width, params: {} }

    const conf = document.createElement('script')
    conf.textContent = `window.atOptions = ${JSON.stringify(atOptions)}`

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `//${ADSTERRA_BASE}/${adKey}/invoke.js`

    let adHtml = ''
    const origWrite = document.write.bind(document)
    const origWriteln = document.writeln.bind(document)
    document.write = (str: string) => { adHtml += str }
    document.writeln = (str: string) => { adHtml += str + '\n' }

    const restore = () => {
      document.write = origWrite
      document.writeln = origWriteln
    }

    const done = () => {
      restore()
      if (!adHtml) {
        const fallback = document.createElement('div')
        fallback.className = 'flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 p-3 text-center text-xs text-slate-400'
        fallback.innerHTML = '<p class="font-medium text-slate-300">Advertisement</p><p class="mt-0.5">Loading...</p>'
        container.appendChild(fallback)
        return
      }
      container.innerHTML = adHtml
    }

    script.onload = done
    script.onerror = done

    container.appendChild(conf)
    container.appendChild(script)

    setTimeout(done, 3000)
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
