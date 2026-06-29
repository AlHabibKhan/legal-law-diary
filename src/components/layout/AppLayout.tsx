import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SearchDialog } from '@/components/SearchDialog'
import { SideAdPanel } from '@/components/ads/SideAdPanel'

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onSearchOpen={() => setSearchOpen(true)} />
      <SideAdPanel side="left" />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
        <footer className="border-t border-slate-200 bg-white px-6 py-3">
          <div className="flex flex-col items-center justify-between gap-1 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
            <span>Legal Law Diary v1.0 &mdash; Practice management tool for Pakistan courts</span>
            <span>
              <a href="/legal" className="text-blue-600 hover:underline">Terms</a>
              <span className="mx-1.5">|</span>
              <a href="/legal#privacy" className="text-blue-600 hover:underline">Privacy</a>
              <span className="mx-1.5">|</span>
              <a href="/legal#disclaimer" className="text-blue-600 hover:underline">Disclaimer</a>
            </span>
          </div>
          <p className="mt-1 text-center text-[10px] text-slate-300">
            Not a substitute for professional legal advice. Backup your data regularly.
          </p>
        </footer>
      </main>
      <SideAdPanel side="right" />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
