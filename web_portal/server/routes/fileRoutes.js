import express from 'express';
import { getFiles, downloadFile, uploadFile, checkFile, saveFile, deleteFile } from '../controllers/fileController.js';
import upload from '../utils/multer.js';
const fileRouter = express.Router();

// Route to get all files for a specific program and session
fileRouter.get('/api/files/get-files', getFiles);

// Route to download a specific file
fileRouter.get('/api/files/download/:key', downloadFile);

fileRouter.post('/api/files/upload',upload.single('file'), uploadFile);

// check if the file is already uploaded and anaylzed
fileRouter.post('/api/files/check-file', checkFile);

// save the file details in the database
fileRouter.post('/api/files/save-file', saveFile);

fileRouter.delete('/api/files/delete/:key', deleteFile);

export default fileRouter; 