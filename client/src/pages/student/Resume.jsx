import { useRef, useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import { studentService } from '../../services/api'
import { formatDate } from '../../utils/helpers'

export default function Resume() {
  const resumeRef = useRef()
  const [downloading, setDownloading] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentService.getResume()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const downloadPDF = async () => {
    if (!resumeRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const name = (data?.user?.name || 'Resume').replace(/\s+/g, '_')
      await html2pdf()
        .set({
          margin: 0,
          filename: `${name}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.99 },
          html2canvas: { scale: 3, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(resumeRef.current)
        .save()
    } finally { setDownloading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  const { user = {}, skills = [], projects = [], certifications = [] } = data || {}

  // Group skills by domain
  const skillGroups = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  // Contact string
  const contacts = [user.email, user.github?.replace('https://github.com/', 'github.com/'), user.linkedin?.replace('https://linkedin.com/in/', 'linkedin.com/in/')].filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {skills.length} skills · {projects.length} projects · {certifications.length} certifications
        </p>
        <Button onClick={downloadPDF} loading={downloading}>
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </div>

      {/* A4 Resume */}
      <div
        ref={resumeRef}
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
          fontSize: '10pt',
          lineHeight: '1.5',
          color: '#1a1a1a',
          padding: '18mm 18mm 14mm 18mm',
          boxSizing: 'border-box',
        }}
      >
        {/* ── NAME & CONTACT ── */}
        <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '8px', marginBottom: '14px' }}>
          <h1 style={{ fontSize: '22pt', fontWeight: '700', margin: '0 0 2px 0', letterSpacing: '-0.3px', color: '#0f172a' }}>
            {user.name || 'Your Name'}
          </h1>
          <p style={{ fontSize: '11pt', fontWeight: '600', color: '#0ea5e9', margin: '0 0 6px 0' }}>
            {user.department || 'Software Engineer'}
            {user.university ? ` · ${user.university}` : ''}
          </p>
          <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>
            {contacts.join('  |  ')}
          </p>
        </div>

        {/* ── SUMMARY ── */}
        {user.bio && (
          <div style={{ marginBottom: '14px' }}>
            <SectionTitle text="Profile" />
            <p style={{ fontSize: '10pt', color: '#333', margin: '4px 0 0 0', lineHeight: '1.6' }}>{user.bio}</p>
          </div>
        )}

        {/* ── EDUCATION ── */}
        {(user.university || user.cgpa) && (
          <div style={{ marginBottom: '14px' }}>
            <SectionTitle text="Education" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '10.5pt', margin: '0 0 2px 0', color: '#0f172a' }}>
                  {user.university || 'University'}
                </p>
                <p style={{ fontSize: '9.5pt', color: '#555', margin: 0 }}>
                  B.Tech — {user.department || 'Computer Science'}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {user.cgpa && (
                  <p style={{ fontWeight: '700', fontSize: '10pt', color: '#0ea5e9', margin: '0 0 2px 0' }}>
                    CGPA: {user.cgpa}
                  </p>
                )}
                <p style={{ fontSize: '9pt', color: '#888', margin: 0 }}>2021 – 2025</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TECHNICAL SKILLS ── */}
        {skills.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <SectionTitle text="Technical Skills" />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
              <tbody>
                {Object.entries(skillGroups).map(([domain, domainSkills]) => (
                  <tr key={domain} style={{ verticalAlign: 'top' }}>
                    <td style={{ width: '80px', fontWeight: '700', fontSize: '9.5pt', color: '#555', paddingBottom: '4px', paddingRight: '10px', whiteSpace: 'nowrap' }}>
                      {domain}
                    </td>
                    <td style={{ fontSize: '9.5pt', color: '#1a1a1a', paddingBottom: '4px' }}>
                      {domainSkills.map(s => `${s.name} (${s.level})`).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <SectionTitle text="Projects" />
            {projects.map((p, i) => (
              <div key={p._id} style={{ marginTop: i === 0 ? '6px' : '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '700', fontSize: '10.5pt', color: '#0f172a' }}>{p.title}</span>
                    {p.github && (
                      <span style={{ fontSize: '8.5pt', color: '#888', marginLeft: '8px' }}>
                        {p.github.replace('https://', '')}
                      </span>
                    )}
                    {p.live && (
                      <span style={{ fontSize: '8.5pt', color: '#0ea5e9', marginLeft: '6px' }}>
                        {p.live.replace('https://', '')}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '8.5pt', fontWeight: '600', flexShrink: 0, marginLeft: '10px',
                    color: p.status === 'Completed' ? '#059669' : '#d97706',
                  }}>
                    {p.status}
                  </span>
                </div>
                {p.description && (
                  <p style={{ fontSize: '9.5pt', color: '#444', margin: '3px 0', lineHeight: '1.5' }}>
                    {p.description}
                  </p>
                )}
                {p.tech?.length > 0 && (
                  <p style={{ fontSize: '9pt', color: '#666', margin: '2px 0 0 0' }}>
                    <span style={{ fontWeight: '600' }}>Tech:</span> {p.tech.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CERTIFICATIONS ── */}
        {certifications.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <SectionTitle text="Certifications" />
            {certifications.map((c, i) => (
              <div key={c._id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginTop: i === 0 ? '6px' : '6px',
                }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '10pt', color: '#0f172a', margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0 0' }}>
                    {c.issuer}{c.credentialId ? ` · Credential ID: ${c.credentialId}` : ''}
                  </p>
                </div>
                {c.date && (
                  <span style={{ fontSize: '9pt', color: '#888', flexShrink: 0, marginLeft: '10px' }}>
                    {formatDate(c.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
      <p style={{ fontSize: '10pt', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', margin: 0, flexShrink: 0 }}>
        {text}
      </p>
      <div style={{ flex: 1, height: '1px', background: '#d1d5db' }} />
    </div>
  )
}
