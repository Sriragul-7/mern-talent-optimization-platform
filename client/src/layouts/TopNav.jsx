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
      className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex min-h-[4rem] items-center gap-2 px-3 sm:h-[4.5rem] sm:gap-5 sm:px-6">
        <button onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden sm:h-9 sm:w-9"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          {title && (
            <div className="flex flex-col">
              <h1 className="truncate pr-2 text-[0.95rem] font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[1.1rem] lg:text-[1.35rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 hidden text-[0.78rem] font-medium text-slate-400 dark:text-slate-500 md:block">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleProfileClick}
            className="group flex items-center rounded-xl p-1 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 sm:gap-2.5 sm:px-2 sm:py-1.5"
            title="Go to profile"
          >
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold shadow-sm ${roleColor}`}>
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-800 dark:text-white leading-none">
                {user?.name || user?.companyName}
              </span>
              <span className="text-[10px] text-slate-400 capitalize mt-[3px] font-medium tracking-wide">
                {user?.role}
              </span>
            </div>
          </button>

          <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700/80 sm:block" />

          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 sm:h-9 sm:w-9"
            title="Sign out"
          >
            <LogOut className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>
    </header>
  )
}
