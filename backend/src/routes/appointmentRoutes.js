import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { recordAppointment, listAppointments, getAppointment } from '../controllers/appointmentController.js';

const router = express.Router();

router.use(protect);
router.post('/record', recordAppointment);
router.get('/', listAppointments);
router.get('/:id', getAppointment);

export default router;
