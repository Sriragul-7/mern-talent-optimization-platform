import { useState, useEffect, useCallback } from 'react'
import {
  Clock, CheckCircle2, XCircle, FileText, Building2,
  Mail, Globe, MapPin, Briefcase, Eye, ChevronDown, RefreshCw, Download
} from 'lucide-react'
import api from '../../services/api'

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock        },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle      },
  { key: 'all',      label: 'All',      icon: Building2    },
]

const STATUS_STYLES = {
  pending:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
}

// ── Proof modal — fetches PDF as blob with auth header so iframe works ─────
function ProofModal({ employer, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let url = null
    const load = async () => {
      try {
        // Use axios (which carries the auth header) to download the PDF
        const res = await api.get(`/admin/employers/${employer._id}/proof`, {
          responseType: 'blob',
        })
        url = URL.createObjectURL(res.data)
        setBlobUrl(url)
      } catch (err) {
        setFetchError('Could not load PDF. File may be missing on server.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // cleanup object URL on unmount
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [employer._id])

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = employer.proofDocument || 'proof.pdf'
    a.click()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-500" />
            <span className="font-semibold text-slate-800 dark:text-white text-sm">
              {employer.companyName || employer.name} — Proof Document
            </span>
          </div>
          <div className="flex items-center gap-2">
            {blobUrl && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="flex-1 overflow-hidden rounded-b-2xl">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm">Loading PDF…</p>
            </div>
          )}
          {fetchError && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <FileText className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium text-red-400">{fetchError}</p>
              <p className="text-xs">Filename: {employer.proofDocument || 'not set'}</p>
            </div>
          )}
          {blobUrl && !loading && (
            <iframe
              src={blobUrl}
              title="Proof Document"
              className="w-full h-full rounded-b-2xl"
              style={{ border: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({ employer, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(employer._id, reason)
    setLoading(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Reject Employer</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Rejecting <strong>{employer.companyName || employer.name}</strong>. Optionally add a reason.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection (optional)..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Employer card ─────────────────────────────────────────────────────────────
function EmployerCard({ employer, onApprove, onReject }) {
  const [expanded, setExpanded]       = useState(false)
  const [loadingApprove, setLoadingApprove] = useState(false)
  const [showProof, setShowProof]     = useState(false)
  const [showReject, setShowReject]   = useState(false)

  const handleApprove = async () => {
    setLoadingApprove(true)
    await onApprove(employer._id)
    setLoadingApprove(false)
  }

  const joined = new Date(employer.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <>
      {showProof  && <ProofModal  employer={employer} onClose={() => setShowProof(false)} />}
      {showReject && <RejectModal employer={employer} onClose={() => setShowReject(false)} onConfirm={onReject} />}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {(employer.companyName || employer.name || 'E').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  {employer.companyName || employer.name || '—'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" /> {employer.email}
                </p>
                <p className="text-xs text-slate-400 mt-1">Registered {joined}</p>
              </div>
            </div>
            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[employer.employerStatus] || STATUS_STYLES.pending}`}>
              {(employer.employerStatus || 'pending').toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {employer.industry && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Briefcase className="w-3 h-3" /> {employer.industry}
              </span>
            )}
            {employer.location && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3" /> {employer.location}
              </span>
            )}
            {employer.website && (
              <a href={employer.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-600">
                <Globe className="w-3 h-3" /> Website
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setShowProof(true)}
              disabled={!employer.proofDocument}
              title={!employer.proofDocument ? 'No proof document uploaded' : 'View PDF'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                employer.proofDocument
                  ? 'border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50'
              }`}>
              <Eye className="w-3.5 h-3.5" />
              {employer.proofDocument ? 'View Proof PDF' : 'No Proof Uploaded'}
            </button>

            <button onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              Details
            </button>

            <div className="flex-1" />

            {employer.employerStatus === 'pending' && (
              <>
                <button onClick={() => setShowReject(true)}
                  className="px-4 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                  Reject
                </button>
                <button onClick={handleApprove} disabled={loadingApprove}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-60">
                  {loadingApprove ? 'Approving…' : '✓ Approve'}
                </button>
              </>
            )}
            {employer.employerStatus === 'rejected' && (
              <button onClick={handleApprove} disabled={loadingApprove}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-60">
                {loadingApprove ? '…' : 'Re-Approve'}
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Contact Name</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{employer.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{employer.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Industry</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{employer.industry || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Location</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{employer.location || '—'}</p>
              </div>
              {employer.description && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Description</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{employer.description}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-xs text-slate-400 mb-0.5">Proof Document</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 font-mono text-xs">
                  {employer.proofDocument || 'Not uploaded'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EmployerApprovals() {
  const [tab, setTab]             = useState('pending')
  const [employers, setEmployers] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async (status) => {
    setLoading(true)
    try {
      const res = await api.get('/admin/employers', { params: { status } })
      setEmployers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  const handleApprove = async (id) => {
    await api.put(`/admin/employers/${id}/approve`)
    if (tab === 'pending' || tab === 'rejected') {
      setEmployers(prev => prev.filter(e => e._id !== id))
    } else {
      setEmployers(prev => prev.map(e => e._id === id ? { ...e, employerStatus: 'approved' } : e))
    }
  }

  const handleReject = async (id, reason) => {
    await api.put(`/admin/employers/${id}/reject`, { reason })
    if (tab === 'pending' || tab === 'approved') {
      setEmployers(prev => prev.filter(e => e._id !== id))
    } else {
      setEmployers(prev => prev.map(e => e._id === id ? { ...e, employerStatus: 'rejected' } : e))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employer Approvals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review proof documents and approve or reject employer accounts.
          </p>
        </div>
        <button onClick={() => load(tab)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <svg className="animate-spin w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : employers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Building2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">No {tab === 'all' ? '' : tab} employers found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {employers.map(emp => (
            <EmployerCard key={emp._id} employer={emp} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  )
}
