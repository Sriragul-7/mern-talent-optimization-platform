import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../ui/Logo'
import { FiHome, FiZap, FiFolder, FiAward, FiTarget, FiFileText, FiUser, FiSearch, FiSun, FiMoon, FiLogOut } from 'react-icons/fi'

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: <FiHome />, color: "text-blue-500" },
  { to: "/student/skills", label: "My Skills", icon: <FiZap />, color: "text-yellow-500" },
  { to: "/student/projects", label: "My Projects", icon: <FiFolder />, color: "text-purple-500" },
  { to: "/student/certifications", label: "Certifications", icon: <FiAward />, color: "text-green-500" },
  { to: "/student/skillgap", label: "Skill Gap", icon: <FiTarget />, color: "text-red-500" },
  { to: "/student/resume", label: "Resume", icon: <FiFileText />, color: "text-indigo-500" },
  { to: "/student/profile", label: "Profile", icon: <FiUser />, color: "text-gray-500" },
]
const employerLinks = [
  { to: "/employer/dashboard", label: "Dashboard", icon: <FiHome />, color: "text-blue-500" },
  { to: "/employer/search", label: "Search Talent", icon: <FiSearch />, color: "text-purple-500" },
]

export default function Sidebar({ role = "student" }) {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const links = role === "employer" ? employerLinks : studentLinks

  return (
    <div className="flex flex-col flex-shrink-0 h-screen sticky top-0" style={{ width: '256px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo size="md" />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{role === 'student' ? 'Student Portal' : 'Employer Portal'}</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            style={({ isActive }) => isActive ? {} : { color: 'var(--text-muted)' }}>
            <span className={`text-lg w-5 flex justify-center ${link.color}`}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={toggle} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
          <span className="w-5 flex justify-center text-lg">{dark ? <FiSun /> : <FiMoon />}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={() => navigate("/login")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all hover:bg-red-50 hover:text-red-600 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
          <span className="w-5 flex justify-center text-lg"><FiLogOut /></span>
          Logout
        </button>
      </div>
    </div>
  )
}