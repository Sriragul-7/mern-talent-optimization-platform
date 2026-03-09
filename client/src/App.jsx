import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login    from './pages/Login'
import Register from './pages/Register'

// Layouts
import StudentLayout  from './layouts/StudentLayout'
import EmployerLayout from './layouts/EmployerLayout'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import MySkills         from './pages/student/MySkills'
import MyProjects       from './pages/student/MyProjects'
import Certifications   from './pages/student/Certifications'
import SkillGap         from './pages/student/SkillGap'
import ReadinessScore   from './pages/student/ReadinessScore'
import ActionPlan       from './pages/student/ActionPlan'
import Resume           from './pages/student/Resume'
import Profile          from './pages/student/Profile'

// Employer pages
import EmployerDashboard from './pages/employer/EmployerDashboard'
import SearchTalent      from './pages/employer/SearchTalent'

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'employer' ? '/employer/dashboard' : '/student/dashboard'} replace />
  }
  return children
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'employer' ? '/employer/dashboard' : '/student/dashboard'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index                   element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<StudentDashboard />} />
        <Route path="skills"           element={<MySkills />} />
        <Route path="projects"         element={<MyProjects />} />
        <Route path="certifications"   element={<Certifications />} />
        <Route path="skill-gap"        element={<SkillGap />} />
        <Route path="readiness"        element={<ReadinessScore />} />
        <Route path="action-plan"      element={<ActionPlan />} />
        <Route path="resume"           element={<Resume />} />
        <Route path="profile"          element={<Profile />} />
      </Route>

      {/* Employer */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute role="employer">
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index             element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<EmployerDashboard />} />
        <Route path="search"     element={<SearchTalent />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
