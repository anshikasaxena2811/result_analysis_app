import multer from 'multer';
import path from 'path';

const uploadPath = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath) // Files will be stored in uploads directory
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

export default upload;