import { useState, useEffect } from "react";
import {
  Plus,
  Github,
  ExternalLink,
  Pencil,
  Trash2,
  FolderKanban,
  X,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { studentService } from "../../services/api";

const STATUS_VARIANT = {
  Completed: "green",
  "In Progress": "blue",
  Planned: "amber",
};
const STATUSES = ["In Progress", "Planned", "Completed"];

const EMPTY_FORM = {
  title: "",
  description: "",
  tech: "",
  github: "",
  live: "",
  status: "In Progress",
};

function ProjectForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Project Title *</label>
        <input
          className="input-field"
          placeholder="e.g. E-Commerce Platform"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="What does this project do?"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="label">
          Tech Stack{" "}
          <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <input
          className="input-field"
          placeholder="React.js, Node.js, MongoDB"
          value={form.tech}
          onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">GitHub URL</label>
          <input
            className="input-field"
            placeholder="https://github.com/..."
            value={form.github}
            onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Live URL</label>
          <input
            className="input-field"
            placeholder="https://..."
            value={form.live}
            onChange={(e) => setForm((f) => ({ ...f, live: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Status</label>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                form.status === s
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false); // 'add' | 'edit' | false
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    studentService
      .getProjects()
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setModal("add");
  };

  const openEdit = (project) => {
    setEditTarget(project._id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      tech: (project.tech || []).join(", "),
      github: project.github || "",
      live: project.live || "",
      status: project.status || "In Progress",
    });
    setError("");
    setModal("edit");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tech: form.tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (modal === "edit") {
        const res = await studentService.updateProject(editTarget, payload);
        setProjects((ps) =>
          ps.map((p) => (p._id === editTarget ? res.data : p)),
        );
      } else {
        const res = await studentService.addProject(payload);
        setProjects((ps) => [res.data, ...ps]);
      }
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id) => {
    setDeleting(id);
    try {
      await studentService.deleteProject(id);
      setProjects((ps) => ps.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
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
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {projects.length} project{projects.length !== 1 ? "s" : ""} in
          portfolio
        </p>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add projects to showcase your work and boost your readiness score"
          action={
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {projects.map((project) => (
            <Card key={project._id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={STATUS_VARIANT[project.status] || "blue"}>
                  {project.status}
                </Badge>
                <div className="flex items-center gap-1">
                  {/* Edit button */}
                  <button
                    onClick={() => openEdit(project)}
                    className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-all"
                    title="Edit project"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteProject(project._id)}
                    disabled={deleting === project._id}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                    title="Delete project"
                  >
                    {deleting === project._id ? (
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
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white text-[15px] mb-1">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.tech?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-auto pt-1">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-500 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-500 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Live
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(false)}
        title={modal === "edit" ? "Edit Project" : "Add Project"}
      >
        <ProjectForm form={form} setForm={setForm} />
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-4">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={save} loading={saving}>
            {modal === "edit" ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
