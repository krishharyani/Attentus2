import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/doctorController.js';

const router = express.Router();
router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;
