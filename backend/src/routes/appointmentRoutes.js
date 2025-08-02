import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { scheduleAppointment, listAppointments, getAppointment, recordAppointment, updateAppointment } from '../controllers/appointmentController.js';

const router = express.Router();
router.use(protect);

// 1) Schedule (no audio)
router.post('/', scheduleAppointment);

// 2) List & fetch
router.get('/', listAppointments);
router.get('/:id', getAppointment);

// 3) Record & generate notes on an existing appointment
router.post('/:id/record', recordAppointment);
router.put('/:id', updateAppointment);

export default router;
