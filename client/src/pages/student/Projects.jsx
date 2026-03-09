import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input, { Textarea } from '../../components/ui/Input'
import { dummyProjects } from '../../data/dummy'
import { FiCalendar, FiUsers } from 'react-icons/fi'

export default function Projects() {
  const [projects, setProjects] = useState(dummyProjects)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", stack: "", startDate: "", endDate: "", teamMembers: "", github: "" })

  const handleAdd = () => {
    if (!form.name.trim()) return
    setProjects([...projects, {
      id: Date.now(),
      name: form.name,
      description: form.description,
      stack: form.stack.split(",").map(s => s.trim()).filter(Boolean),
      startDate: form.startDate,
      endDate: form.endDate,
      teamMembers: form.teamMembers.split(",").map(s => s.trim()).filter(Boolean),
      github: form.github,
    }])
    setForm({ name: "", description: "", stack: "", startDate: "", endDate: "", teamMembers: "", github: "" })
    setIsOpen(false)
  }

  const handleDelete = (id) => setProjects(projects.filter(p => p.id !== id))

  return (
    <Layout role="student">
      <Header title="My Projects" action={<Button onClick={() => setIsOpen(true)}>+ Add Project</Button>} />
      <div className="p-6 flex flex-col gap-4">
        {projects.map(proj => (
          <Card key={proj.id}>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-text">{proj.name}</h2>
              <button onClick={() => handleDelete(proj.id)} className="text-text-muted hover:text-red-500 text-lg cursor-pointer">×</button>
            </div>
            <p className="text-sm text-text-muted mb-3 leading-relaxed">{proj.description}</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {proj.stack.map((s, i) => <Badge key={i} label={s} color="blue" />)}
            </div>
            <div className="flex gap-6 text-xs text-text-muted flex-wrap">
              <span className="flex items-center gap-1.5"><FiCalendar /> {proj.startDate} → {proj.endDate || "Ongoing"}</span>
              <span className="flex items-center gap-1.5"><FiUsers /> {proj.teamMembers.join(", ")}</span>
              {proj.github && (
                <a href={proj.github} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  GitHub ↗
                </a>
              )}
            </div>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Add your first project to showcase your work</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Project">
        <div className="flex flex-col gap-4">
          <Input label="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="E-Commerce Platform" required />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the project..." />
          <Input label="Tech Stack (comma separated)" value={form.stack} onChange={e => setForm({ ...form, stack: e.target.value })} placeholder="React, Node.js, MongoDB" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Input label="Team Members (comma separated)" value={form.teamMembers} onChange={e => setForm({ ...form, teamMembers: e.target.value })} placeholder="Arjun Kumar, Priya Singh" />
          <Input label="GitHub URL (optional)" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Project</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}