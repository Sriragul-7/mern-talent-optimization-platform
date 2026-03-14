import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EmployerSidebar from './EmployerSidebar'
import TopNav from './TopNav'

const TITLES = {
  '/employer/dashboard': { title: 'Dashboard',       subtitle: 'Platform overview and talent insights' },
  '/employer/search':    { title: 'Search Talent',   subtitle: 'Find the perfect candidate' },
  '/employer/profile':   { title: 'Company Profile', subtitle: 'Manage your company information' },
  '/employer/shortlist': { title: 'Saved Profiles',  subtitle: 'Candidates you have bookmarked' },
}

export default function EmployerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = TITLES[pathname] || { title: 'SkillBridge' }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 bg-mesh">
      <EmployerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopNav onMenuClick={() => setSidebarOpen(true)} {...meta} />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}