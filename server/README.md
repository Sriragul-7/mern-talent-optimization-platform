# SkillBridge — Server

Express + MongoDB backend for the SkillBridge career intelligence platform.

## Quick Start

```bash
cd server
npm install
# Edit .env and replace MONGO_URI with your connection string
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on **http://localhost:5000**

---

## .env Setup

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillbridge
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## API Reference

### Auth  `POST /api/auth/`

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/register` | `name, email, password, role` | Register student or employer |
| POST | `/login` | `email, password` | Login and receive JWT token |
| GET  | `/me` | — (auth) | Get current user |

---

### Student  `GET|POST|PUT|DELETE /api/student/`
> All routes require `Authorization: Bearer <token>` and role = `student`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile fields |
| GET | `/skills` | List all skills |
| POST | `/skills` | Add skill `{name, category, level}` |
| DELETE | `/skills/:id` | Delete skill |
| GET | `/projects` | List all projects |
| POST | `/projects` | Add project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| GET | `/certifications` | List certifications |
| POST | `/certifications` | Add certification |
| DELETE | `/certifications/:id` | Delete certification |
| GET | `/dashboard` | Dashboard stats + chart data |
| GET | `/recommendations` | AI recommendations (dynamic) |
| GET | `/skill-gap?role=` | Skill gap analysis for a target role |
| GET | `/resume` | Full resume data |

---

### Employer  `GET /api/employer/`
> All routes require `Authorization: Bearer <token>` and role = `employer`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Platform stats and chart data |
| GET | `/search?q=&skill=&university=&minCgpa=&page=&limit=` | Search students |
| GET | `/student/:id` | Full student profile |
| GET | `/stats` | Platform-wide counts |

---

## Folder Structure

```
server/
├── index.js                   # Express app + server boot
├── .env                       # Environment variables (add your MONGO_URI)
├── config/
│   └── db.js                  # Mongoose connection
├── models/
│   ├── User.js                # Student + Employer schema
│   ├── Skill.js
│   ├── Project.js
│   └── Certification.js
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   └── employerController.js
├── routes/
│   ├── auth.js
│   ├── student.js
│   └── employer.js
├── middleware/
│   ├── auth.js                # JWT protect + requireRole
│   └── validate.js            # express-validator error handler
└── utils/
    ├── jwt.js                 # Token generation + user formatter
    └── recommendations.js     # Dynamic recommendation engine
```
