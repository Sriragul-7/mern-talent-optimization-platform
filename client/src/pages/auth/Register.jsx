import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'

export default function Register() {
  const [role, setRole] = useState("student")
  const navigate = useNavigate()

  const [student, setStudent] = useState({ name: "", email: "", password: "", age: "", university: "", department: "", cgpa: "", github: "", linkedin: "" })
  const [employer, setEmployer] = useState({ name: "", email: "", password: "", company: "", website: "", industry: "", size: "1-10" })

  const handleRegister = () => {
    if (role === "student") navigate("/student/dashboard")
    else navigate("/employer/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="rounded-2xl p-8 shadow-sm w-full max-w-md" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">TalentOpt</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your account</p>
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

        {role === "student" ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" value={student.name} onChange={e => setStudent({ ...student, name: e.target.value })} placeholder="Arjun Kumar" required />
              <Input label="Age" type="number" value={student.age} onChange={e => setStudent({ ...student, age: e.target.value })} placeholder="21" />
            </div>
            <Input label="Email" type="email" value={student.email} onChange={e => setStudent({ ...student, email: e.target.value })} placeholder="arjun@uni.edu" required />
            <Input label="Password" type="password" value={student.password} onChange={e => setStudent({ ...student, password: e.target.value })} placeholder="••••••••" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="University" value={student.university} onChange={e => setStudent({ ...student, university: e.target.value })} placeholder="Anna University" />
              <Input label="Department" value={student.department} onChange={e => setStudent({ ...student, department: e.target.value })} placeholder="CS" />
            </div>
            <Input label="CGPA" type="number" value={student.cgpa} onChange={e => setStudent({ ...student, cgpa: e.target.value })} placeholder="8.5" />
            <Input label="GitHub URL" value={student.github} onChange={e => setStudent({ ...student, github: e.target.value })} placeholder="https://github.com/you" />
            <Input label="LinkedIn URL" value={student.linkedin} onChange={e => setStudent({ ...student, linkedin: e.target.value })} placeholder="https://linkedin.com/in/you" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input label="Full Name" value={employer.name} onChange={e => setEmployer({ ...employer, name: e.target.value })} placeholder="Meera Nair" required />
            <Input label="Email" type="email" value={employer.email} onChange={e => setEmployer({ ...employer, email: e.target.value })} placeholder="meera@company.com" required />
            <Input label="Password" type="password" value={employer.password} onChange={e => setEmployer({ ...employer, password: e.target.value })} placeholder="••••••••" required />
            <Input label="Company Name" value={employer.company} onChange={e => setEmployer({ ...employer, company: e.target.value })} placeholder="TechCorp Solutions" required />
            <Input label="Company Website" value={employer.website} onChange={e => setEmployer({ ...employer, website: e.target.value })} placeholder="https://company.com" />
            <Input label="Industry" value={employer.industry} onChange={e => setEmployer({ ...employer, industry: e.target.value })} placeholder="Software Development" />
            <Select label="Company Size" value={employer.size} onChange={e => setEmployer({ ...employer, size: e.target.value })}>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>200+</option>
            </Select>
          </div>
        )}

        <Button onClick={handleRegister} className="w-full justify-center mt-6 mb-4">
          Create Account
        </Button>

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}