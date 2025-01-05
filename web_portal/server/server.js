import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { S3 } from '@aws-sdk/client-s3'
import userRoutes from './routes/userRoutes.js'
import express from 'express'
import multer from 'multer'
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

// Configure S3
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Files will be stored in uploads directory
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept these MIME types for Excel files
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ]

    const filetypes = /xlsx|xls/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = validMimeTypes.includes(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else if (!extname) {
      cb('Error: File must have .xlsx or .xls extension')
    } else {
      cb(`Error: Invalid file type. Received mimetype: ${file.mimetype}`)
    }
  }
})

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const filePath = path.resolve(req.file.path) // Get absolute path
  
  res.json({ 
    message: 'File uploaded successfully',
    filePath: filePath
  })
})

// Add new route for file download
app.post('/api/files/download', async (req, res) => {
  try {
    const { fileUrl } = req.body
    
    // Extract bucket and key from S3 URL
    const url = new URL(fileUrl)
    const bucket = url.hostname.split('.')[0]
    const key = decodeURIComponent(url.pathname.substring(1))

    // Get the file from S3
    const command = {
      Bucket: bucket,
      Key: key
    }

    const fileStream = await s3.getObject(command)
    const file = await fileStream.Body.transformToByteArray()

    // Set appropriate headers
    res.setHeader('Content-Type', fileStream.ContentType)
    res.setHeader('Content-Disposition', `attachment; filename=${key.split('/').pop()}`)
    
    // Send the file
    res.send(Buffer.from(file))
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Failed to download file' })
  }
})

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