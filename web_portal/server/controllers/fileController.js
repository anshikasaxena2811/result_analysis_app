import dotenv from 'dotenv';
import { S3 } from '@aws-sdk/client-s3';
import path from 'path';
import File from '../models/File.js';
dotenv.config();

// Initialize S3 client
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

export const getFiles = async (req, res) => {
  try {
    // Query MongoDB
    const files = await File.find({})
      .select('collegeName program batch semester session result_path')
      .lean();

    if (!files || files.length === 0) {
      return res.status(200).json({
        success: true,
        files: []
      });
    }
    
    console.log("files => ", files[0].batch)
    // Format the response, handling multiple batches, programs and semesters
    // {
    //   "2021-2025": {
    //     "BACHELOR OF COMPUTER APPLICATIONS": {
    //       "Third": [
    //         {
    //           "file_name": "top_five_students.xlsx",
    //           "key": "s3://bucket-name/path/to/file.xlsx"
    //         }
    //       ]
    //     }
    //   }
    // }

    const formattedFiles = files.reduce((acc, file) => {
      console.log(file);
      
      if (!acc[file.batch]) acc[file.batch] = {};
      if (!acc[file.batch][file.program]) acc[file.batch][file.program] = {};
      if (!acc[file.batch][file.program][file.semester]) acc[file.batch][file.program][file.semester] = [];

      // fetch the file name from the path 

      let file_details = []

      for (const path of file.result_path) {
        file_details.push({
          file_name: path.split('/').pop(),
          file_path: path
        })
      }


      acc[file.batch][file.program][file.semester].push({
        file: file_details
      });

      return acc;
    }, {});

    console.log("formattedFiles => ", formattedFiles)

    res.status(200).json({
      success: true,
      files: formattedFiles
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({
      success: false, 
      error: error.message
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    
    const command = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    try {
      const fileStream = await s3.getObject(command);
      const file = await fileStream.Body.transformToByteArray();

      // Set appropriate headers
      res.setHeader('Content-Type', fileStream.ContentType);
      res.setHeader('Content-Disposition', `attachment; filename=${key.split('/').pop()}`);
      
      // Send the file
      res.send(Buffer.from(file));
    } catch (s3Error) {
      console.error('S3 error:', s3Error);
      res.status(404).json({ error: 'File not found in S3' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const filePath = path.resolve(req.file.path) // Get absolute path
  
  res.json({ 
    message: 'File uploaded successfully',
    filePath: filePath
  })
}

// check if the file is already uploaded and anaylzed

export const checkFile = async(req, res) => {
  console.log("Checking file...")
  console.log(req.body)
  const { collegeName, program, batch, semester, session } = req.body;
  
  try {
    const file = await File.findOne({ collegeName, program, batch, semester, session });
    
    if (file) {
      return res.status(400).json({ 
        success: false, 
        message: 'File already uploaded and analyzed' 
      });
    }
    return res.status(200).json({ 
      success: true, 
      message: 'File can be uploaded' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking file status',
      error: error.message 
    });
  }
}

export const saveFile = async (req, res) => {
  const { collegeName, program, batch, semester, session, result_path } = req.body;
  
  try {
    const file = await File.create({ collegeName, program, batch, semester, session, result_path });
    res.status(200).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}