import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Layers, FolderKanban, Award, Target,
  FileText, User, LogOut, Moon, Sun, TrendingUp, Rocket, Users
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/student/dashboard',      icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/student/skills',         icon: Layers,          label: 'My Skills'      },
  { to: '/student/projects',       icon: FolderKanban,    label: 'My Projects'    },
  { to: '/student/certifications', icon: Award,           label: 'Certifications' },
  { to: '/student/readiness',      icon: TrendingUp,      label: 'Readiness Score'},
  { to: '/student/action-plan',    icon: Rocket,          label: 'Action Plan'    },
  { to: '/student/resume',         icon: FileText,        label: 'Resume'         },
  { to: '/student/compare',        icon: Users,           label: 'Compare'        },
  { to: '/student/profile',        icon: User,            label: 'Profile'        },
]

export default function StudentSidebar({ open, setOpen }) {
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
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

        {/* ── Brand name only — no logo ── */}
        <div className="flex items-center px-6 h-[4.5rem] flex-shrink-0">
          <span className="text-[22px] font-extrabold tracking-tight text-white">
            Skill<span style={{ color: '#0ea5e9' }}>Bridge</span>
          </span>
        </div>

        <div className="mx-4 h-px bg-white/5" />

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-400" />
                  )}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(14,165,233,0.10)', border: '1px solid rgba(14,165,233,0.15)' }}
                    />
                  )}
                  <Icon
                    className={`relative w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'text-brand-400' : 'group-hover:scale-110'
                    }`}
                  />
                  {/* Bigger label text */}
                  <span className="relative text-[14px] font-semibold tracking-tight leading-none">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 h-px bg-white/5" />

        {/* Footer actions */}
        <div className="px-3 py-3 space-y-0.5 flex-shrink-0">
          <button
            onClick={toggle}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
          >
            {dark
              ? <Sun className="w-4 h-4 text-amber-400/70 group-hover:rotate-45 transition-transform duration-300" />
              : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-200" />
            }
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </aside>
    </>
  )
}