import { useState, useEffect } from 'react'
import { Building2, Mail, Globe, Save } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { employerService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function EmployerProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', companyName: '', website: '', industry: '', location: '', description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    employerService.getProfile()
      .then(res => {
        const u = res.data
        setForm({
          name:        u.name        || '',
          email:       u.email       || '',
          companyName: u.companyName || '',
          website:     u.website     || '',
          industry:    u.industry    || '',
          location:    u.location    || '',
          description: u.description || '',
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await employerService.updateProfile(form)
      updateUser(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  const initials = (form.companyName || form.name || 'E').charAt(0).toUpperCase()

  return (
    <div className="space-y-5 max-w-2xl mx-auto px-4">

      {/* Avatar + company header */}
      <Card className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {form.companyName || form.name || 'Your Company'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{form.email}</p>
          {form.industry && (
            <p className="text-xs text-slate-400 mt-0.5">{form.industry}{form.location ? ` · ${form.location}` : ''}</p>
          )}
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Company Information</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name *</label>
              <input className="input-field" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input className="input-field" placeholder="e.g. TechCorp Solutions"
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input-field bg-slate-50 dark:bg-slate-800/50" value={form.email} disabled
              style={{ cursor: 'not-allowed', opacity: 0.7 }} />
            <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Industry</label>
              <input className="input-field" placeholder="e.g. Software / Fintech"
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" placeholder="e.g. Bangalore, India"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Website</label>
            <input className="input-field" placeholder="https://yourcompany.com"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>

          <div>
            <label className="label">Company Description</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Briefly describe your company and what you're hiring for..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Profile saved successfully
          </div>
        )}

        <div className="flex justify-end mt-5">
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </div>
      </Card>
    </div>
  )
}
