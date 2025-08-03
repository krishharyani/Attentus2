import express from 'express';
import multer from 'multer';
import { signup, login } from '../controllers/authController.js';
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/signup', upload.single('voiceSample'), signup);
router.post('/login', login);
export default router;
