import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sb-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sb-token')
      localStorage.removeItem('sb-user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  // Employer registration with multipart/form-data (includes PDF proof)
  registerEmployer: formData => api.post('/auth/register-employer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  me: () => api.get('/auth/me'),
}

// ── Student ───────────────────────────────────────────────────────────────────
export const studentService = {
  // Profile
  getProfile:   ()     => api.get('/student/profile'),
  updateProfile: data  => api.put('/student/profile', data),

  // Skills
  getSkills:    ()     => api.get('/student/skills'),
  addSkill:     data   => api.post('/student/skills', data),
  deleteSkill:  id     => api.delete(`/student/skills/${id}`),

  // Projects
  getProjects:    ()         => api.get('/student/projects'),
  addProject:     data       => api.post('/student/projects', data),
  updateProject:  (id, data) => api.put(`/student/projects/${id}`, data),
  deleteProject:  id         => api.delete(`/student/projects/${id}`),

  // Certifications
  getCertifications:   ()   => api.get('/student/certifications'),
  addCertification:    data => api.post('/student/certifications', data),
  deleteCertification: id   => api.delete(`/student/certifications/${id}`),

  // Intelligence features
  getSkillGap:      (role = 'Full Stack Developer') => api.get('/student/skill-gap', { params: { role } }),
  getReadiness:     (role = 'Full Stack Developer') => api.get('/student/readiness', { params: { role } }),
  getActionPlan:    (role = 'Full Stack Developer') => api.get('/student/action-plan', { params: { role } }),
  getRecommendations: () => api.get('/student/recommendations'),
  getDashboardStats:  () => api.get('/student/dashboard'),
  getResume:          () => api.get('/student/resume'),
  getCompare:         () => api.get('/student/compare'),
}

// ── Employer ──────────────────────────────────────────────────────────────────
export const employerService = {
  getDashboard:     ()           => api.get('/employer/dashboard'),
  searchTalent:     params       => api.get('/employer/search', { params }),
  getStudentProfile: (id, role)  => api.get(`/employer/student/${id}`, { params: { role } }),
  getPlatformStats: ()           => api.get('/employer/stats'),

  // Employer profile (company info)
  getProfile:    () => api.get('/employer/profile'),
  updateProfile: data => api.put('/employer/profile', data),
}

export default api