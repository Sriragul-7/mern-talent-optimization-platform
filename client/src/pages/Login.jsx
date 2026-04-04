import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(form)
      login(res.data.user, res.data.token)
      const role = res.data.user.role
      navigate(role === 'employer' ? '/employer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start justify-center p-4 pt-8 sm:items-center">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Skill<span className="text-brand-500">Bridge</span>
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Career intelligence platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className="input-field pr-11"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading
                ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                : <> Sign In <ArrowRight className="w-4 h-4" /> </>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold">Create one</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">SkillBridge · Career Intelligence Platform</p>
      </div>
    </div>
  )
}
