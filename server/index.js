require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/student',  require('./routes/student'))
app.use('/api/employer', require('./routes/employer'))
app.use('/api/admin',    require('./routes/admin'))

// Serve uploaded proof PDFs (protected via admin route, but also direct for dev)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))




//tar --exclude=node_modules --exclude=.git --exclude=dist --exclude=.env -czf skillbridge-current.zip .