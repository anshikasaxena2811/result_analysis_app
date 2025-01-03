const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(cors());

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
  console.log(`File upload server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
}); 