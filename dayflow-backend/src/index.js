import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes        from './routes/auth.js'
import employeeRoutes    from './routes/employees.js'
import attendanceRoutes  from './routes/attendance.js'
import timeoffRoutes     from './routes/timeoff.js'
import allocationRoutes  from './routes/allocations.js'
import salaryRoutes      from './routes/salary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files (sick leave certificates, logos)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth',                  authRoutes)
app.use('/employees',             employeeRoutes)
app.use('/attendance',            attendanceRoutes)
app.use('/timeoff',               timeoffRoutes)
app.use('/timeoff/allocations',   allocationRoutes)
app.use('/salary',                salaryRoutes)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  // Don't leak stack traces to the client
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Dayflow backend running on http://localhost:${PORT}`)
})
