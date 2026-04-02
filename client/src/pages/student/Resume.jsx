import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import { studentService } from '../../services/api'
import { formatDate } from '../../utils/helpers'

const resumeShellStyle = {
  width: '210mm',
  minHeight: '294mm',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: '10.5pt',
  lineHeight: '1.42',
  color: '#111827',
  padding: '12mm 16mm',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}

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
    const resumeNode = resumeRef.current
    const originalBoxShadow = resumeNode.style.boxShadow
    const originalBorderRadius = resumeNode.style.borderRadius
    const originalOverflow = resumeNode.style.overflow
    const originalTransform = resumeNode.style.transform

    try {
      const html2pdf = (await import('html2pdf.js')).default
      const name = (data?.user?.name || 'Resume').replace(/\s+/g, '_')

      resumeNode.style.boxShadow = 'none'
      resumeNode.style.borderRadius = '0'
      resumeNode.style.overflow = 'hidden'
      resumeNode.style.transform = 'none'

      await html2pdf()
        .set({
          margin: [0, 0, 0, 0],
          filename: `${name}_Resume.pdf`,
          image: { type: 'jpeg', quality: 1 },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          html2canvas: {
            scale: 2.5,
            useCORS: true,
            logging: false,
            letterRendering: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: -window.scrollY,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true,
          },
        })
        .from(resumeNode)
        .save()
    } finally {
      resumeNode.style.boxShadow = originalBoxShadow
      resumeNode.style.borderRadius = originalBorderRadius
      resumeNode.style.overflow = originalOverflow
      resumeNode.style.transform = originalTransform
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  const { user = {}, skills = [], projects = [], certifications = [] } = data || {}

  const skillGroups = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill.name)
    return acc
  }, {})

  const educationMeta = [user.school, user.schoolPercentage].filter(Boolean).join(' - ')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {skills.length} skills - {projects.length} projects - {certifications.length} certifications
        </p>
        <Button onClick={downloadPDF} loading={downloading}>
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </div>

      <div ref={resumeRef} style={resumeShellStyle}>
        <div style={{ marginBottom: '2px' }}>
          <h1
            style={{
              fontSize: '24pt',
              fontWeight: '700',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px',
              color: '#0f172a',
              lineHeight: '1.15',
              textTransform: 'uppercase',
            }}
          >
            {user.name || 'YOUR NAME'}
          </h1>
          <p
            style={{
              fontSize: '11pt',
              fontWeight: '600',
              color: '#1d4ed8',
              margin: '0 0 8px 0',
            }}
          >
            {user.department || 'Full Stack Developer'}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px 16px',
              fontSize: '9.5pt',
              color: '#111827',
              borderBottom: '1px solid #cbd5e1',
              paddingBottom: '8px',
            }}
          >
            <span>{user.email || 'email@example.com'}</span>
            <span>{user.linkedin?.replace('https://www.linkedin.com/in/', '') || 'linkedin.com/in/username'}</span>
            <span>{user.github?.replace('https://github.com/', '') || 'github.com/username'}</span>
          </div>
        </div>

        {user.bio && (
          <section>
            <SectionTitle text="Career Objective" />
            <p
              style={{
                fontSize: '10pt',
                color: '#111827',
                margin: '6px 0 0 0',
                lineHeight: '1.5',
                textAlign: 'justify',
              }}
            >
              {user.bio}
            </p>
          </section>
        )}

        <section>
          <SectionTitle text="Education" />
          <div style={{ marginTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '2px',
              }}
            >
              <p style={{ fontWeight: '600', fontSize: '11pt', margin: 0, color: '#0f172a' }}>
                {user.university || 'University Name'}
              </p>
              <p style={{ fontSize: '10pt', color: '#1f2937', margin: 0, fontWeight: '500', flexShrink: 0 }}>
                {user.cgpa ? `CGPA - ${user.cgpa}` : ''}
              </p>
            </div>
            <p style={{ fontSize: '10.5pt', color: '#111827', margin: '2px 0' }}>
              BE - {user.department || 'Electronics and Communication Engineering'}
            </p>
            {educationMeta && (
              <p style={{ fontSize: '10pt', color: '#374151', margin: '2px 0 0 0' }}>
                {educationMeta}
              </p>
            )}
          </div>
        </section>

        {Object.keys(skillGroups).length > 0 && (
          <section>
            <SectionTitle text="Technical Skills" />
            <div style={{ marginTop: '6px' }}>
              {Object.entries(skillGroups).map(([category, skillsList]) => (
                <div
                  key={category}
                  style={{
                    marginBottom: '6px',
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <p
                    style={{
                      fontWeight: '600',
                      fontSize: '10.5pt',
                      color: '#0f172a',
                      margin: 0,
                      minWidth: '128px',
                    }}
                  >
                    {category}:
                  </p>
                  <p style={{ fontSize: '10.5pt', color: '#111827', margin: 0, flex: 1 }}>
                    {skillsList.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionTitle text="Projects" />
            <div style={{ marginTop: '6px' }}>
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  style={{
                    marginBottom: index === projects.length - 1 ? 0 : '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '4px',
                    }}
                  >
                    <p style={{ fontWeight: '600', fontSize: '11.5pt', margin: 0, color: '#0f172a' }}>
                      {project.title}
                    </p>
                    <span
                      style={{
                        fontSize: '9pt',
                        fontWeight: '600',
                        color: project.status === 'Completed' ? '#047857' : '#b45309',
                        flexShrink: 0,
                      }}
                    >
                      {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p
                      style={{
                        fontSize: '10pt',
                        color: '#111827',
                        margin: '0 0 4px 0',
                        lineHeight: '1.45',
                        textAlign: 'justify',
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                  {project.tech?.length > 0 && (
                    <p style={{ fontSize: '9.5pt', color: '#1f2937', margin: '0 0 2px 0' }}>
                      <span style={{ fontWeight: '700', color: '#111827' }}>Tech:</span> {project.tech.join(', ')}
                    </p>
                  )}

                  {project.github && (
                    <p
                      style={{
                        fontSize: '9pt',
                        color: '#1d4ed8',
                        margin: '2px 0 0 0',
                        fontFamily: 'monospace',
                      }}
                    >
                      {project.github.replace('https://', '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionTitle text="Certifications" />
            <div style={{ marginTop: '6px' }}>
              {certifications.map((certification, index) => (
                <div
                  key={certification._id}
                  style={{
                    marginBottom: index === certifications.length - 1 ? 0 : '8px',
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <p
                    style={{
                      fontWeight: '600',
                      fontSize: '10.5pt',
                      color: '#0f172a',
                      margin: 0,
                      minWidth: '120px',
                    }}
                  >
                    {certification.name}:
                  </p>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10.5pt', color: '#111827' }}>
                      {certification.issuer}
                      {certification.credentialId && ` - ID: ${certification.credentialId}`}
                    </span>
                    {certification.date && (
                      <span style={{ fontSize: '9.5pt', color: '#374151', marginLeft: '8px' }}>
                        {formatDate(certification.date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ text }) {
  return (
    <div style={{ marginBottom: '0' }}>
      <p
        style={{
          fontSize: '11.5pt',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          color: '#0f172a',
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  )
}
