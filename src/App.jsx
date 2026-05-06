import { useState } from 'react'
import { Calendar, Users, Package } from 'lucide-react'
import { AppProvider } from './context/AppContext'
import PlanningTab from './components/PlanningTab'
import PersonnelTab from './components/PersonnelTab'

const TABS = [
  { id: 'planning',   label: 'Planning',  icon: Calendar },
  { id: 'personnel',  label: 'Personnel', icon: Users    },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('planning')

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="bg-[#003366] shadow-lg sticky top-0 z-30">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Package size={22} className="text-white" />
                </div>
                <div className="leading-tight">
                  <div className="text-white font-bold text-base tracking-tight">
                    Planning Entrepôt
                  </div>
                  <div className="text-blue-300 text-[11px]">Gestion des équipes</div>
                </div>
              </div>

              {/* Navigation tabs */}
              <nav className="flex gap-1 bg-white/10 p-1 rounded-xl">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-white text-[#003366] shadow-sm'
                          : 'text-blue-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
          {activeTab === 'planning'  && <PlanningTab  />}
          {activeTab === 'personnel' && <PersonnelTab />}
        </main>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="text-center py-3 text-xs text-slate-400">
          Planning Entrepôt · Données sauvegardées localement
        </footer>
      </div>
    </AppProvider>
  )
}
