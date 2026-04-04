import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import TopNav from './TopNav'

const TITLES = {
  '/student/dashboard':     { title: 'Dashboard',          subtitle: "Welcome back! Here's your progress." },
  '/student/skills':        { title: 'My Skills',          subtitle: 'Manage and showcase your skillset' },
  '/student/projects':      { title: 'My Projects',        subtitle: 'Portfolio of your work' },
  '/student/certifications':{ title: 'Certifications',     subtitle: 'Your credentials and achievements' },
  '/student/skill-gap':     { title: 'Skill Gap Analysis', subtitle: 'Identify and bridge skill gaps' },
  '/student/readiness':     { title: 'Readiness Score',    subtitle: 'Your career readiness breakdown' },
  '/student/action-plan':   { title: 'Action Plan',        subtitle: 'Personalised steps to improve your score' },
  '/student/compare':       { title: 'Compare',            subtitle: 'See how you rank against the platform' },
  '/student/resume':        { title: 'Resume',             subtitle: 'Preview and download your resume' },
  '/student/profile':       { title: 'Profile',            subtitle: 'Manage your personal information' },
}

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = TITLES[pathname] || { title: 'SkillBridge' }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-mesh">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopNav onMenuClick={() => setSidebarOpen(true)} {...meta} />
        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 xl:px-10 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
