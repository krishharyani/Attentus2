import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { scheduleAppointment, listAppointments, getAllAppointments, getAppointment, recordAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';

const router = express.Router();
router.use(protect);

// 1) Schedule (no audio)
router.post('/', scheduleAppointment);

// 2) List appointments
router.get('/', getAllAppointments);

// 3) Record & generate notes on an existing appointment
router.post('/:id/record', recordAppointment);

// 4) Delete/cancel appointment (must come before generic :id routes)
router.delete('/:id', deleteAppointment);

// 5) Update appointment
router.put('/:id', updateAppointment);

// 6) Get single appointment (must come last)
router.get('/:id', getAppointment);

export default router;
