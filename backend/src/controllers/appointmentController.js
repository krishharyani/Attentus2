import multer from 'multer';
import { firebaseAdmin } from '../config/firebase.js';
import Appointment from '../models/Appointment.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { generateConsultNote } from '../services/aiService.js';

const upload = multer();

// Schedule a future appointment (no audio/transcript/notes yet)
export const scheduleAppointment = async (req, res) => {
  try {
    const { patientId, title, date } = req.body;
    const appt = await Appointment.create({
      doctor:  req.doctor._id,
      patient: patientId,
      title,
      date,
      status: 'Pending'
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Upload recording & kick off transcription + AI note
export const recordAppointment = [
  upload.single('audio'),
  async (req, res) => {
    try {
      const { weight, height } = req.body;
      const appt = await Appointment.findById(req.params.id);
      if (!appt) return res.status(404).json({ message: 'Appointment not found' });

      // upload raw audio
      const bucket = firebaseAdmin.storage().bucket();
      const filePath = `recordings/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(filePath);
      await file.save(req.file.buffer, { contentType: req.file.mimetype });
      const recordingUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // transcription + AI note
      const transcript  = await transcribeAudio(recordingUrl);
      const consultNote = await generateConsultNote(transcript, req.doctor.template);

      // update appointment
      appt.recordingUrl = recordingUrl;
      appt.transcript   = transcript;
      appt.consultNote  = consultNote;
      appt.weight       = weight || appt.weight;
      appt.height       = height || appt.height;
      appt.status       = 'Completed';
      await appt.save();

      res.json(appt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// List upcoming & recent appointments
export const listAppointments = async (req, res) => {
  const now = new Date();
  const threeDays = new Date(now);
  threeDays.setDate(now.getDate() + 3);
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(now.getDate() - 1);
  const appts = await Appointment.find({
    doctor: req.doctor._id,
    date: { $gte: oneDayAgo, $lte: threeDays }
  }).populate('patient');
  res.json(appts);
};

// Get single appointment
export const getAppointment = async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor', '-password');
  if (!appt) return res.status(404).json({ message: 'Not found' });
  res.json(appt);
};

// Edit an existing consult note (and optionally weight/height)
export const updateAppointment = async (req, res) => {
  try {
    const { consultNote, weight, height } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (consultNote !== undefined) appt.consultNote = consultNote;
    if (weight       !== undefined) appt.weight       = weight;
    if (height       !== undefined) appt.height       = height;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete/cancel appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    
    // Check if the appointment belongs to the current doctor
    if (appt.doctor.toString() !== req.doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
