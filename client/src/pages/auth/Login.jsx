import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Logo from '../../components/ui/Logo'
import { useTheme } from '../../context/ThemeContext'

export default function Login() {
  const [role, setRole] = useState("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const handleLogin = () => {
    if (role === "student") navigate("/student/dashboard")
    else navigate("/employer/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <button onClick={toggle} className="fixed top-4 right-4 text-sm px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="w-full max-w-sm rounded-2xl p-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo size="lg" /></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Talent Optimization Platform</p>
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg)' }}>
          {["student", "employer"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer capitalize"
              style={{ background: role === r ? 'var(--surface)' : 'transparent', color: role === r ? '#2563EB' : 'var(--text-muted)', boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {r}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <Button onClick={handleLogin} className="w-full mb-4">Login as {role === "student" ? "Student" : "Employer"}</Button>

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
        </p>

        <div className="mt-6 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Demo</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Any email + any password → click Login</p>
        </div>
      </div>
    </div>
  )
}