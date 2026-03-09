import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { LevelBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'
import { dummySkills } from '../../data/dummy'

const categories = ["Frontend", "Backend", "Database", "Tools", "Mobile", "Cloud", "Other"]
const levels = ["Beginner", "Intermediate", "Pro"]

export default function Skills() {
  const [skills, setSkills] = useState(dummySkills)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: "", category: "Frontend", level: "Beginner" })

  const handleAdd = () => {
    if (!form.name.trim()) return
    setSkills([...skills, { id: Date.now(), ...form, dateAdded: new Date().toISOString().split("T")[0] }])
    setForm({ name: "", category: "Frontend", level: "Beginner" })
    setIsOpen(false)
  }

  const handleDelete = (id) => setSkills(skills.filter(s => s.id !== id))

  const categoryColor = { Frontend: "blue", Backend: "green", Database: "purple", Tools: "gray", Mobile: "yellow", Cloud: "blue", Other: "gray" }

  return (
    <Layout role="student">
      <Header title="My Skills" action={<Button onClick={() => setIsOpen(true)}>+ Add Skill</Button>} />
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {skills.map(skill => (
            <Card key={skill.id}>
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-text">{skill.name}</p>
                <button onClick={() => handleDelete(skill.id)} className="text-text-muted hover:text-red-500 text-lg cursor-pointer">×</button>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                <Badge label={skill.category} color={categoryColor[skill.category] || "gray"} />
                <LevelBadge level={skill.level} />
              </div>
              <p className="text-xs text-text-muted">Added {skill.dateAdded}</p>
            </Card>
          ))}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">No skills added yet</p>
            <p className="text-sm">Click "Add Skill" to get started</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Skill">
        <div className="flex flex-col gap-4">
          <Input label="Skill Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. React, Python, Docker" required />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select label="Level" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
            {levels.map(l => <option key={l}>{l}</option>)}
          </Select>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Skill</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}