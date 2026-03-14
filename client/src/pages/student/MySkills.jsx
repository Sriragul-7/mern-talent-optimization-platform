import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Layers, Search, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import {
  SKILL_CATALOGUE,
  ALL_SKILL_NAMES,
  SKILL_LOOKUP,
} from "../../utils/skillCatalogue";
import { studentService } from "../../services/api";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const LEVEL_COLOR = {
  Beginner: "amber",
  Intermediate: "blue",
  Advanced: "purple",
  Expert: "green",
};
const LEVEL_NUM = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
  Master: 5,
};

const DOMAIN_COLORS = {
  Frontend: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Backend:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Database:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  "AI/ML":
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  DevOps:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  Mobile: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  Language: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  Design: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  Other: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

// Searchable combobox component
function SkillCombobox({ value, onChange, onCategoryChange }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const filtered =
    query.length < 1
      ? ALL_SKILL_NAMES.slice(0, 30)
      : ALL_SKILL_NAMES.filter((s) =>
          s.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 40);

  const select = (name) => {
    setQuery(name);
    onChange(name);
    const entry = SKILL_LOOKUP[name.toLowerCase()];
    if (entry) onCategoryChange(entry.category);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="input-field pl-9 pr-9"
          placeholder="Search skills — e.g. React, Docker, Python…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((name) => {
              const entry = SKILL_LOOKUP[name.toLowerCase()];
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => select(name)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="font-medium text-slate-800 dark:text-white">
                    {name}
                  </span>
                  {entry && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DOMAIN_COLORS[entry.category] || DOMAIN_COLORS.Other}`}
                    >
                      {entry.category}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] text-slate-400">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} · Or
              type a custom skill name
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Frontend",
    level: "Intermediate",
  });
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    studentService
      .getSkills()
      .then((res) => setSkills(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...Object.keys(SKILL_CATALOGUE).filter((c) =>
      skills.some((s) => s.category === c),
    ),
  ];
  const filtered =
    filter === "All" ? skills : skills.filter((s) => s.category === filter);

  const openModal = () => {
    setForm({ name: "", category: "Frontend", level: "Intermediate" });
    setError("");
    setModal(true);
  };

  const addSkill = async () => {
    if (!form.name.trim()) {
      setError("Please enter or select a skill name.");
      return;
    }
    // Prevent duplicate skill names (case-insensitive)
    const isDuplicate = skills.some(
      (s) => s.name.toLowerCase() === form.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError(`You already have "${form.name.trim()}" in your skills.`);
      return;
    }
    setSaving(true);
    try {
      const res = await studentService.addSkill(form);
      setSkills((s) => [res.data, ...s]);
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add skill.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id) => {
    setDeleting(id);
    try {
      await studentService.deleteSkill(id);
      setSkills((s) => s.filter((sk) => sk._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {skills.length} skills tracked
        </p>
        <Button onClick={openModal}>
          <Plus className="w-4 h-4" /> Add Skill
        </Button>
      </div>

      {/* Domain filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === cat
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin w-7 h-7 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={filter === "All" ? "No skills yet" : `No ${filter} skills`}
          description="Add your first skill to improve your readiness score"
          action={
            <Button onClick={openModal}>
              <Plus className="w-4 h-4" /> Add Skill
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => {
            const domainColor =
              DOMAIN_COLORS[skill.category] || DOMAIN_COLORS.Other;
            return (
              <Card key={skill._id} hover className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${domainColor}`}
                  >
                    {skill.category}
                  </div>
                  <button
                    onClick={() => deleteSkill(skill._id)}
                    disabled={deleting === skill._id}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                  >
                    {deleting === skill._id ? (
                      <svg
                        className="animate-spin w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-0.5 text-[15px]">
                  {skill.name}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={LEVEL_COLOR[skill.level] || "blue"}>
                    {skill.level}
                  </Badge>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-5 h-1.5 rounded-full ${n <= (LEVEL_NUM[skill.level] || 2) ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"}`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add skill modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Skill">
        <div className="space-y-4">
          {/* Searchable dropdown */}
          <div>
            <label className="label">Skill Name</label>
            <SkillCombobox
              value={form.name}
              onChange={(name) => setForm((f) => ({ ...f, name }))}
              onCategoryChange={(cat) =>
                setForm((f) => ({ ...f, category: cat }))
              }
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Start typing to search 250+ skills. Category auto-fills.
            </p>
          </div>

          {/* Category — auto-filled but editable */}
          <div>
            <label className="label">Domain / Category</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              {Object.keys(SKILL_CATALOGUE).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Level picker */}
          <div>
            <label className="label">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, level }))}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.level === level
                      ? "bg-brand-500 border-brand-500 text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={addSkill} loading={saving}>
              Add Skill
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}