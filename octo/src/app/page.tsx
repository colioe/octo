'use client'
import { useEffect, useState } from 'react'
import { AppProvider, useAppContext } from '../context/AppContext'
import NewsGrid from '../components/NewsGrid'
import WeatherWidget from '../components/WeatherWidget'
import FinancialWatchlist from '../components/FinancialWatchlist'
import SearchBar from '../components/SearchBar'
import NotesWidget from '../components/NotesWidget'
import BackgroundSelector from '../components/BackgroundSelector'
import SettingsDrawer from '@/components/SettingsDrawer'
import { SettingsIcon } from 'lucide-react'

export default function Home() {
  const { background, setBackground } = useAppContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user-bg');
    if (saved) setBackground(saved);
  }, [setBackground]);

  useEffect(() => {
    if (background) {
      localStorage.setItem('user-bg', background);
    }
  }, [background]);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/50" /> {/* Optional dark overlay for visibility */}

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-10">
        <div className="flex items-center space-x-2">
          <WeatherWidget />
        </div>
        <div className="flex-1 text-center">
          {/* Optional: Logo */}
        </div>
        <div className="flex items-center space-x-4">
          <FinancialWatchlist />
          <button onClick={() => setDrawerOpen(true)}>
            <SettingsIcon className="text-white w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Search */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </main>

      {/* News Section */}
      <section className="relative z-10 w-full overflow-x-auto whitespace-nowrap mt-8">
        <div className=" space-x-4 px-4 ">
          <NewsGrid />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center text-white/80 text-xs mt-12 pb-6">
        © {new Date().getFullYear()} Colioe, Inc. All rights reserved.
      </footer>

      {/* Settings Drawer */}
      <SettingsDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
