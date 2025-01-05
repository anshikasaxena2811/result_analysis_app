import dotenv from 'dotenv';
import { S3 } from '@aws-sdk/client-s3';

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
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      MaxKeys: 1000,
    };

    const data = await s3.listObjectsV2(params);
    
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(200).json({
        success: true,
        files: []
      });
    }

    // Parse and format the files data
    const files = data.Contents.map(file => {
      // Split the key by '/'
      const [sessionFolder, programName, semester, fileName] = file.Key.split('/');
      
      // Format session (e.g., "2021-22" to "2021-2022")
      const [startYear, endYear] = sessionFolder.split('-');
      const formattedSession = `${startYear}-20${endYear}`;

      return {
        session: formattedSession,
        program: programName,
        semester: semester,
        file_name: fileName,
        lastModified: file.LastModified,
        size: file.Size,
        key: file.Key // keeping the original key for reference if needed
      };
    }).filter(file => file.file_name); // Only include files that have a filename (filters out folders)

    res.status(200).json({
      success: true,
      files,
      isTruncated: data.IsTruncated
    });
  } catch (error) {
    console.error('S3 Error:', error); // Temporary debug log
    res.status(500).json({
      success: false, 
      error: error.message
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { key } = req.params;
    
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    const fileStream = s3.getObject(params).createReadStream();
    res.attachment(key);
    fileStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

