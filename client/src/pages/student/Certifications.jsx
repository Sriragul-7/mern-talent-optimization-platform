import { useState, useEffect } from 'react'
import { Plus, Trash2, Award, ExternalLink, Calendar } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { studentService } from '../../services/api'
import { formatDate } from '../../utils/helpers'

export default function Certifications() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', issuer: '', date: '', credentialId: '', url: '' })

  useEffect(() => {
    studentService.getCertifications()
      .then(res => setCerts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const addCert = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await studentService.addCertification(form)
      setCerts(c => [res.data, ...c])
      setForm({ name: '', issuer: '', date: '', credentialId: '', url: '' })
      setModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const deleteCert = async (id) => {
    try {
      await studentService.deleteCertification(id)
      setCerts(c => c.filter(x => x._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{certs.length} certifications earned</p>
        <Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add Certification</Button>
      </div>

      {certs.length === 0 ? (
        <EmptyState icon={Award} title="No certifications yet" description="Add your professional certifications"
          action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map(cert => (
            <Card key={cert._id} hover className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <button onClick={() => deleteCert(cert._id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1 leading-snug">{cert.name}</h3>
              <p className="text-sm text-brand-500 font-semibold mb-3">{cert.issuer}</p>
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                {cert.date && <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDate(cert.date)}</div>}
                {cert.credentialId && <p className="font-mono text-[10px] text-slate-400">ID: {cert.credentialId}</p>}
              </div>
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noreferrer"
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Verify
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Certification">
        <div className="space-y-4">
          {[
            { key: 'name',         label: 'Certification Name',       placeholder: 'AWS Certified Developer' },
            { key: 'issuer',       label: 'Issuing Organization',     placeholder: 'Amazon Web Services' },
            { key: 'credentialId', label: 'Credential ID (optional)', placeholder: 'AWS-DEV-2024' },
            { key: 'url',          label: 'Verification URL (optional)', placeholder: 'https://...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input-field" placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="label">Date Earned</label>
            <input type="date" className="input-field" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={addCert} loading={saving}>Add Certification</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
