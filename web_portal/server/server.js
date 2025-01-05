import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import userRoutes from './routes/userRoutes.js'
import { connectDB } from './config/db.js'

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config()

// Now you can use process.env.VARIABLE_NAME throughout your application

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 8000;

connectDB()

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/', userRoutes);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Files will be stored in uploads directory
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname)
  }
});

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
    ];

    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = validMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else if (!extname) {
      cb('Error: File must have .xlsx or .xls extension');
    } else {
      cb(`Error: Invalid file type. Received mimetype: ${file.mimetype}`);
    }
  }
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.resolve(req.file.path); // Get absolute path
  
  res.json({ 
    message: 'File uploaded successfully',
    filePath: filePath
  });
});

// Add new route for file download
app.get('/download', (req, res) => {
  const filePath = req.query.filePath;
  console.log("filePath => ", filePath);
  if (!filePath) {
    return res.status(400).json({ error: 'No file path provided' });
  }

  // Verify the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Send the file
  res.download(filePath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
  console.log(`File upload server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
}); 