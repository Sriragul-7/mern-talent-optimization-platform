import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TopNav({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const handleProfileClick = () => {
    if (user?.role === 'student')  navigate('/student/profile')
    else if (user?.role === 'admin') navigate('/admin/dashboard')
    else navigate('/employer/profile')
  }

  const initials = (user?.name || user?.companyName || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const roleColor = user?.role === 'employer'
    ? 'from-accent-500 to-brand-500'
    : 'from-brand-500 to-accent-500'

  return (
    <header
      className="sticky top-0 z-20 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">

        {/* Mobile menu */}
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="flex flex-col">
              <h1 className="text-[1.05rem] font-bold text-slate-900 dark:text-white leading-tight tracking-tight sm:text-[1.35rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 hidden text-[0.78rem] font-medium text-slate-400 dark:text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right — user button + logout */}
        <div className="flex items-center gap-2">

          {/* User button → profile */}
          <button
            onClick={handleProfileClick}
            className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 sm:gap-2.5"
            title="Go to profile"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-800 dark:text-white leading-none">
                {user?.name || user?.companyName}
              </span>
              <span className="text-[10px] text-slate-400 capitalize mt-[3px] font-medium tracking-wide">
                {user?.role}
              </span>
            </div>
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/80" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-[17px] h-[17px]" />
          </button>

        </div>
      </div>
    </header>
  )
}
