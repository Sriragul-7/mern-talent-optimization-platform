import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, LogOut, Moon, Sun, User, Bookmark } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/employer/search',    icon: Search,          label: 'Search Talent' },
  { to: '/employer/profile',   icon: User,            label: 'Company Profile'},
  { to: '/employer/shortlist', icon: Bookmark,        label: 'Saved Profiles'  },
]

export default function EmployerSidebar({ open, setOpen }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-[17rem] z-40 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          background: 'linear-gradient(160deg, #0d1117 0%, #0f172a 60%, #111827 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

        {/* Brand */}
        <div className="flex items-center px-6 h-[4.5rem] flex-shrink-0">
          <span className="text-[22px] font-extrabold tracking-tight text-white">
            Skill<span style={{ color: '#8b5cf6' }}>Bridge</span>
          </span>
        </div>

        <div className="mx-4 h-px bg-white/5" />

        {/* User card */}
        <div className="px-3 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#0ea5e9)' }}>
              {(user?.companyName || user?.name || 'E').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate leading-none mb-1">
                {user?.companyName || user?.name || 'Employer'}
              </p>
              <p className="text-[10px] text-white/30 truncate font-mono">{user?.email || ''}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.15em] uppercase text-white/20">Navigation</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-400" />}
                  {isActive && <span className="absolute inset-0 rounded-xl" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.15)' }} />}
                  <Icon className={`relative w-[18px] h-[18px] flex-shrink-0 transition-all ${isActive ? 'text-accent-400' : 'group-hover:scale-110'}`} />
                  <span className="relative text-[14px] font-semibold tracking-tight leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 h-px bg-white/5" />

        <div className="px-3 py-3 space-y-0.5 flex-shrink-0">
          <button onClick={toggle}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
            {dark
              ? <Sun className="w-4 h-4 text-amber-400/70 group-hover:rotate-45 transition-transform duration-300" />
              : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-200" />
            }
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </aside>
    </>
  )
}