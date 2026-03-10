import { useRef, useState, useEffect } from 'react'
import { Download, Mail, Phone, Github, Linkedin } from 'lucide-react'
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
          margin: [0, 0, 0, 0],
          filename: `${name}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          },
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

  // Group skills by their actual categories from the data
  const skillGroups = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill.name)
    return acc
  }, {})

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
          height: '297mm',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: '10.5pt',
          lineHeight: '1.5',
          color: '#2c3e50',
          padding: '15mm 20mm 15mm 20mm',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header - Name */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ 
            fontSize: '24pt', 
            fontWeight: '600', 
            margin: '0 0 4px 0', 
            letterSpacing: '0.5px',
            color: '#1e293b',
            lineHeight: '1.2',
            textTransform: 'uppercase'
          }}>
            {user.name || 'YOUR NAME'}
          </h1>
          <p style={{ 
            fontSize: '11pt', 
            fontWeight: '400', 
            color: '#2563eb', 
            margin: '0 0 8px 0'
          }}>
            {user.department || 'Full Stack Developer'}
          </p>
          
          {/* Contact Info */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: '9.5pt',
            color: '#4b5563',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '10px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={11} /> {user.email || 'email@example.com'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={11} /> {user.phone || '123-456-7890'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Linkedin size={11} /> {user.linkedin?.replace('https://www.linkedin.com/in/', '') || 'linkedin.com/in/username'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Github size={11} /> {user.github?.replace('https://github.com/', '') || 'github.com/username'}
            </span>
          </div>
        </div>

        {/* Main Content - Full width with proper spacing */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Career Objective */}
          {user.bio && (
            <div>
              <SectionTitle text="CAREER OBJECTIVE" />
              <p style={{ 
                fontSize: '10pt', 
                color: '#3a4a5c', 
                margin: '8px 0 0 0', 
                lineHeight: '1.6',
                textAlign: 'justify'
              }}>
                {user.bio}
              </p>
            </div>
          )}

          {/* Education */}
          <div>
            <SectionTitle text="EDUCATION" />
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline',
                marginBottom: '2px'
              }}>
                <p style={{ 
                  fontWeight: '600', 
                  fontSize: '11pt', 
                  margin: 0,
                  color: '#1e293b'
                }}>
                  {user.university || 'University Name'}
                </p>
                <p style={{ 
                  fontSize: '10pt', 
                  color: '#5f6b7a', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {user.cgpa ? `CGPA - ${user.cgpa}` : ''}
                </p>
              </div>
              <p style={{ 
                fontSize: '10.5pt', 
                color: '#4a5a6e', 
                margin: '2px 0'
              }}>
                BE - {user.department || 'Electronics and Communication Engineering'}
              </p>
              <p style={{ 
                fontSize: '10pt', 
                color: '#5f6b7a', 
                margin: '2px 0 0 0'
              }}>
                {user.school || 'Additional School Information'} · {user.schoolPercentage || 'Percentage'}
              </p>
            </div>
          </div>

          {/* Technical Skills - Using dynamic categories */}
          {Object.keys(skillGroups).length > 0 && (
            <div>
              <SectionTitle text="TECHNICAL SKILLS" />
              <div style={{ marginTop: '8px' }}>
                {Object.entries(skillGroups).map(([category, skillsList]) => (
                  <div key={category} style={{ 
                    marginBottom: '8px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <p style={{ 
                      fontWeight: '600', 
                      fontSize: '10.5pt', 
                      color: '#1e293b',
                      margin: 0,
                      minWidth: '150px'
                    }}>
                      {category}:
                    </p>
                    <p style={{ 
                      fontSize: '10.5pt', 
                      color: '#4a5a6e', 
                      margin: 0,
                      flex: 1
                    }}>
                      {skillsList.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <SectionTitle text="PROJECTS" />
              <div style={{ marginTop: '8px' }}>
                {projects.map((p, i) => (
                  <div key={p._id} style={{ 
                    marginBottom: i === projects.length - 1 ? 0 : '18px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <p style={{ 
                        fontWeight: '600', 
                        fontSize: '11.5pt', 
                        margin: 0,
                        color: '#1e293b'
                      }}>
                        {p.title}
                      </p>
                      <span style={{
                        fontSize: '9pt',
                        fontWeight: '500',
                        color: p.status === 'Completed' ? '#059669' : '#b45309',
                      }}>
                        {p.status}
                      </span>
                    </div>
                    
                    {p.description && (
                      <p style={{ 
                        fontSize: '10pt', 
                        color: '#4a5a6e', 
                        margin: '0 0 4px 0',
                        lineHeight: '1.5',
                        textAlign: 'justify'
                      }}>
                        {p.description}
                      </p>
                    )}
                    
                    {p.tech?.length > 0 && (
                      <p style={{ 
                        fontSize: '9.5pt', 
                        color: '#5f6b7a', 
                        margin: '0 0 2px 0'
                      }}>
                        <span style={{ fontWeight: '600', color: '#3a4a5c' }}>Tech:</span> {p.tech.join(' - ')}
                      </p>
                    )}
                    
                    {p.github && (
                      <p style={{ 
                        fontSize: '9pt',
                        color: '#2563eb',
                        margin: '2px 0 0 0',
                        fontFamily: 'monospace'
                      }}>
                        {p.github.replace('https://', '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements / Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginTop: 'auto' }}>
              <SectionTitle text="CERTIFICATIONS" />
              <div style={{ marginTop: '8px' }}>
              
                {/* Certifications */}
                {certifications.map((c, i) => (
                  <div key={c._id} style={{ 
                    marginBottom: i === certifications.length - 1 ? 0 : '10px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <p style={{ 
                      fontWeight: '600', 
                      fontSize: '10.5pt', 
                      color: '#1e293b',
                      margin: 0,
                      minWidth: '120px'
                    }}>
                      {c.name}:
                    </p>
                    <div style={{ flex: 1 }}>
                      <span style={{ 
                        fontSize: '10.5pt', 
                        color: '#4a5a6e', 
                      }}>
                        {c.issuer}
                        {c.credentialId && ` - ID: ${c.credentialId}`}
                      </span>
                      {c.date && (
                        <span style={{ 
                          fontSize: '9.5pt', 
                          color: '#6b7a8c', 
                          marginLeft: '8px'
                        }}>
                          {formatDate(c.date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ text }) {
  return (
    <div style={{ 
      marginBottom: '2px'
    }}>
      <p style={{ 
        fontSize: '12pt', 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px', 
        color: '#1e293b', 
        margin: '0 0 4px 0',
        borderBottom: '2px solid #2563eb',
        paddingBottom: '3px',
        display: 'inline-block'
      }}>
        {text}
      </p>
    </div>
  )
}