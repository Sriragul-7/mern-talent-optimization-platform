import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employers', icon: Users,           label: 'Employer Approvals' },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(160deg,#0d1117 0%,#1a0a2e 60%,#0f172a 100%)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        <div className="flex items-center gap-3 px-6 h-[4.5rem] flex-shrink-0 border-b border-white/5">
          <Shield className="w-5 h-5 text-violet-400" />
          <span className="text-lg font-extrabold text-white tracking-tight">
            Skill<span className="text-violet-400">Bridge</span>
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 align-middle">ADMIN</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  isActive
                    ? 'text-white bg-violet-500/15 border border-violet-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Top bar */}
        <header className="h-[4.5rem] flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden mr-4 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-slate-800 dark:text-white">Admin Panel</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
