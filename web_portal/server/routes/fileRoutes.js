import express from 'express';
import { getFiles, downloadFile } from '../controllers/fileController.js';

const fileRouter = express.Router();

// Route to get all files for a specific program and session
fileRouter.get('/api/files/get-files', getFiles);

// Route to download a specific file
fileRouter.get('/download/:key', downloadFile);


export default fileRouter; 