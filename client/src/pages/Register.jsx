import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, CheckCircle2, Clock, Info, Upload, FileText, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'


export default function Register() {
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(1) // 1=basic info, 2=company details+proof(employer), 3=pending
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', industry: '', website: '', location: '' })
  const [proofFile, setProofFile] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleStep1 = async (e) => {
    e.preventDefault()
    if (role === 'student') {
      setError(''); setLoading(true)
      try {
        const res = await authService.register({ ...form, role })
        login(res.data.user, res.data.token)
        navigate('/student/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.')
      } finally { setLoading(false) }
    } else {
      setError(''); setStep(2)
    }
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    if (!proofFile) { setError('Please upload your company proof document (PDF).'); return }
    setError(''); setLoading(true)
    try {
      const formData = new FormData()
      Object.entries({ ...form, role }).forEach(([k, v]) => v && formData.append(k, v))
      formData.append('proofDocument', proofFile)
      await authService.registerEmployer(formData)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB.'); return }
    setError(''); setProofFile(file)
  }

  // ── Step 3: Pending screen ────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Your employer account registration is under review by the SkillBridge team. Every employer is verified to maintain platform integrity for students.
          </p>
          <div className="text-left space-y-3 mb-6">
            {[
              { label: 'Account created', done: true },
              { label: 'Company proof document uploaded', done: true },
              { label: 'SkillBridge team reviews application (1–2 business days)', done: false },
              { label: `Approval email sent to ${form.email}`, done: false },
              { label: 'Full portal access granted', done: false },
            ].map(({ label, done }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <p className={`text-sm leading-snug ${done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> What happens next?
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              The SkillBridge team will verify your submitted documents and contact you at <strong>{form.email}</strong>. Once approved, you can log in and access the full employer portal.
            </p>
          </div>
          <Link to="/login" className="block w-full py-2.5 text-center rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  // ── Step 2: Employer company details ─────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Skill<span className="text-brand-500">Bridge</span>
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Employer Verification — Step 2 of 2</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            {/* Progress bar */}
            <div className="flex gap-2 mb-5">
              <div className="h-1.5 flex-1 rounded-full bg-brand-500" />
              <div className="h-1.5 flex-1 rounded-full bg-brand-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Company Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Provide your company info and upload a proof document (GST certificate, CIN, or business licence).
            </p>

            <form onSubmit={handleStep2} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Industry</label>
                  <select className="input-field" value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                  <input className="input-field" placeholder="e.g. Bangalore, India"
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Website</label>
                <input className="input-field" placeholder="https://yourcompany.com"
                  value={form.website} onChange={e => set('website', e.target.value)} />
              </div>

              {/* PDF Proof Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Proof Document <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-2">GST certificate, company registration (CIN), or business licence · PDF only · Max 5 MB</p>

                {proofFile ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{proofFile.name}</p>
                      <p className="text-xs text-slate-400">{(proofFile.size / 1024).toFixed(0)} KB · PDF</p>
                    </div>
                    <button type="button" onClick={() => setProofFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">Click to upload PDF</span>
                    <span className="text-xs text-slate-400">GST certificate, CIN, or business licence</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all disabled:opacity-60">
                  {loading
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">SkillBridge · Career Intelligence Platform</p>
        </div>
      </div>
    )
  }

  // ── Step 1: Basic info ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Skill<span className="text-brand-500">Bridge</span>
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Career intelligence platform</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Join thousands of students and employers on SkillBridge.</p>

          {/* Role toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { val: 'student',  icon: GraduationCap, label: 'Student'  },
              { val: 'employer', icon: Briefcase,      label: 'Employer' },
            ].map(({ val, icon: Icon, label }) => (
              <button key={val} type="button"
                onClick={() => { setRole(val); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === val
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Info banner */}
          {role === 'student' ? (
            <></>
          ) : (
            <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Employer verification required
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                After signup, you'll submit company details and a proof document (GST / CIN). Access is granted within 1–2 business days after our team reviews it.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
              <input type="text" required className="input-field"
                placeholder={role === 'student' ? 'Arjun Sharma' : 'Ravi Shankar (contact person)'}
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {role === 'employer' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Name *</label>
                <input type="text" required className="input-field"
                  placeholder="e.g. TechCorp Solutions Pvt. Ltd."
                  value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
              <input type="email" required className="input-field"
                placeholder={role === 'student' ? 'you@university.edu' : 'you@company.com'}
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required minLength={6} className="input-field pr-11"
                  placeholder="At least 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} />
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
                : <><span>{role === 'employer' ? 'Continue →' : 'Create Account'}</span>{role === 'student' && <ArrowRight className="w-4 h-4" />}</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">SkillBridge · Career Intelligence Platform</p>
      </div>
    </div>
  )
}
