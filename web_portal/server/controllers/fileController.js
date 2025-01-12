import dotenv from "dotenv";
import { S3 } from "@aws-sdk/client-s3";
import path from "path";
import File from "../models/File.js";
dotenv.config();

// Initialize S3 client
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export const getFiles = async (req, res) => {
  try {
    // Query MongoDB
    const files = await File.find({})
      .select("collegeName program batch semester session result_path")
      .lean();

    if (!files || files.length === 0) {
      return res.status(200).json({
        success: true,
        files: [],
      });
    }

    console.log("files => ", files[0].batch);
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
      if (!acc[file.batch][file.program][file.semester])
        acc[file.batch][file.program][file.semester] = [];

      // fetch the file name from the path

      let file_details = [];

      for (const path of file.result_path) {
        file_details.push({
          file_name: path.split("/").pop(),
          file_path: path,
        });
      }

      acc[file.batch][file.program][file.semester].push({
        file: file_details,
      });

      return acc;
    }, {});

    console.log("formattedFiles => ", formattedFiles);

    res.status(200).json({
      success: true,
      files: formattedFiles,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const command = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    try {
      const fileStream = await s3.getObject(command);
      const file = await fileStream.Body.transformToByteArray();

      // Set appropriate headers
      res.setHeader("Content-Type", fileStream.ContentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${key.split("/").pop()}`
      );

      res.send(Buffer.from(file));
    } catch (s3Error) {
      console.error("S3 error:", s3Error);
      res.status(404).json({ error: "File not found in S3" });
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};

export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileName = req.file.originalname;

  const filePath = path.resolve(req.file.path)
  console.log("filePath => ", filePath);
   
  
  res.json({
    message: "File uploaded successfully",
    filePath: filePath, // Save shared path for analysis container
    fileName
  });
};

// check if the file is already uploaded and anaylzed

export const checkFile = async (req, res) => {
  console.log("Checking file...");
  console.log(req.body);
  const { collegeName, program, batch, semester, session } = req.body;

  try {
    const file = await File.findOne({
      collegeName,
      program,
      batch,
      semester,
      session,
    });

    if (file) {
      return res.status(400).json({
        success: false,
        message: "File already uploaded and analyzed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "File can be uploaded",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking file status",
      error: error.message,
    });
  }
};

export const saveFile = async (req, res) => {
  const { collegeName, program, batch, semester, session, result_path } =
    req.body;

  try {
    const file = await File.create({
      collegeName,
      program,
      batch,
      semester,
      session,
      result_path,
    });
    res.status(200).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;

    // Delete from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: decodeURIComponent(key),
    };

    // check if the file is deleted from s3
    const s3Delete = await s3.deleteObject(deleteParams);
    console.log("s3Delete => ", s3Delete);

    // Construct the full S3 URL that's stored in the database
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${
      process.env.AWS_REGION
    }.amazonaws.com/${decodeURIComponent(key)}`;

    // Update the document by removing the specific file path from result_path array
    const dbUpdate = await File.updateOne(
      { result_path: s3Url },
      { $pull: { result_path: s3Url } }
    );

    if (dbUpdate.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "File path not found in database",
      });
    }

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
    });
  }
};

export const synchronizeDatabase = async (req, res) => {
  try {
    // Get all files from database
    const files = await File.find({});
    let syncResults = {
      totalDocuments: files.length,
      totalPathsChecked: 0,
      pathsRemoved: 0,
      errors: [],
    };

    for (const file of files) {
      // Create a copy of result_path to track valid paths
      let validPaths = [...file.result_path];

      // Check each path in result_path
      for (const path of file.result_path) {
        syncResults.totalPathsChecked++;

        try {
          // Extract the key from the S3 URL
          const urlParts = path.split(".com/");
          if (urlParts.length !== 2) {
            validPaths = validPaths.filter((p) => p !== path);
            syncResults.pathsRemoved++;
            continue;
          }

          const key = decodeURIComponent(urlParts[1]);

          // Check if file exists in S3
          const command = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          };

          try {
            await s3.headObject(command);
          } catch (s3Error) {
            // If file doesn't exist in S3, remove it from validPaths
            if (s3Error.name === "NotFound") {
              validPaths = validPaths.filter((p) => p !== path);
              syncResults.pathsRemoved++;
            }
          }
        } catch (error) {
          syncResults.errors.push({
            path: path,
            error: error.message,
          });
        }
      }

      // Update document if paths were removed
      if (validPaths.length !== file.result_path.length) {
        // If no valid paths remain, delete the document
        if (validPaths.length === 0) {
          await File.deleteOne({ _id: file._id });
        } else {
          // Update the document with only valid paths
          await File.updateOne(
            { _id: file._id },
            { $set: { result_path: validPaths } }
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Database synchronized with S3 bucket",
      results: syncResults,
    });
  } catch (error) {
    console.error("Synchronization error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to synchronize database",
      error: error.message,
    });
  }
};
