require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')

const app = express()

const normalizedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  ...(process.env.FRONTEND_URLS || '').split(','),
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://localhost:3000',
]
  .map(origin => origin?.trim())
  .filter(Boolean)

const allowedOrigins = new Set(normalizedOrigins)

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true

  if (
    process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
    /^https:\/\/[a-z0-9-]+-git-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/i.test(origin)
  ) {
    return true
  }

  return false
}

connectDB()

app.set('trust proxy', 1)
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/student', require('./routes/student'))
app.use('/api/employer', require('./routes/employer'))
app.use('/api/admin', require('./routes/admin'))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
