import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import { getProfile, updateProfile, uploadSignature, listDoctors } from '../controllers/doctorController.js';

const router = express.Router();
const upload = multer();

router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/signature', upload.single('signature'), uploadSignature);
router.get('/', listDoctors);

export default router;
