import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import userRoutes from './routes/userRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config()

const app = express()
const port = 8000

// Connect to MongoDB
connectDB()

// CORS configuration - place this BEFORE other middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Access-Control-Allow-Credentials'
  ]
}))

// Middleware
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Pre-flight requests
app.options('*', cors())

// Routes
app.use('/', userRoutes)
app.use('/', fileRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

app.listen(port, () => {
  console.log(`File upload server running on port ${port}`)
  console.log(`Upload directory: ${uploadDir}`)
}) 