# SkillBridge Client

**A modern SaaS-grade career intelligence platform** for students and employers.

## Tech Stack

- ⚡ **React 18** + **Vite**
- 🎨 **TailwindCSS** (dark mode, custom design tokens)
- 🔀 **React Router v6**
- 📊 **Recharts** (Radar, Bar, Area, Pie charts)
- 🔷 **Lucide React** icons
- 🌐 **Axios** for API calls

## Getting Started

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Login

- Select **Student** or **Employer** role
- Enter any email and password
- The app runs on **mock data** until you connect to the backend

## Folder Structure

```
src/
├── App.jsx                   # Routes & providers
├── index.css                 # Global styles & Tailwind layers
├── context/
│   ├── AuthContext.jsx       # Auth state (user, token, login/logout)
│   └── ThemeContext.jsx      # Dark/light mode toggle
├── services/
│   └── api.js                # Axios instance + all API calls
├── utils/
│   ├── helpers.js            # Formatting, color utils
│   └── mockData.js           # Demo data (replace with API)
├── layouts/
│   ├── StudentLayout.jsx     # Student page shell
│   ├── EmployerLayout.jsx    # Employer page shell
│   ├── StudentSidebar.jsx    # Student nav
│   ├── EmployerSidebar.jsx   # Employer nav
│   └── TopNav.jsx            # Top header bar
├── components/
│   ├── ui/
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── ProgressBar.jsx
│   │   └── StatCard.jsx
│   └── charts/
│       ├── ActivityLineChart.jsx
│       ├── SkillPieChart.jsx
│       ├── SkillProgressChart.jsx
│       └── SkillRadarChart.jsx
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── student/
    │   ├── StudentDashboard.jsx  # Stats, charts, AI recommendations
    │   ├── MySkills.jsx          # CRUD skills with categories
    │   ├── MyProjects.jsx        # Portfolio management
    │   ├── Certifications.jsx    # Certificates tracker
    │   ├── SkillGap.jsx          # Gap analysis vs target roles
    │   ├── Resume.jsx            # Generated resume + PDF download
    │   └── Profile.jsx           # Editable profile form
    └── employer/
        ├── EmployerDashboard.jsx # Platform stats & charts
        ├── SearchTalent.jsx      # Filter & browse students
        └── TalentAnalytics.jsx   # Deep analytics

```

## Connecting to Your Backend

Replace mock data calls in pages with real API calls from `src/services/api.js`.

Example:
```js
// Before (mock)
const [skills] = useState(MOCK_SKILLS)

// After (real API)
const [skills, setSkills] = useState([])
useEffect(() => {
  studentService.getSkills().then(res => setSkills(res.data))
}, [])
```

Set your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
```

## Features

| Feature | Description |
|---------|-------------|
| 🌙 Dark Mode | Global toggle via sidebar, persisted to localStorage |
| 📊 Charts | Radar, Bar, Area, Pie charts using Recharts |
| 📄 Resume PDF | Download resume using html2pdf.js |
| 🔒 Auth Guard | Role-based route protection |
| 📱 Responsive | Mobile-first with hamburger sidebar |
| ✨ Animations | Fade-in, slide-up, hover transitions |
| 🎯 Skill Gap | Visual gap analysis vs target roles |
| 🤖 AI Recs | Dynamic recommendation cards |
