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
      console.log('Received weight:', weight, 'type:', typeof weight);
      console.log('Received height:', height, 'type:', typeof height);
      console.log('Full request body:', req.body);
      console.log('Request body:', req.body);
      
      const appt = await Appointment.findById(req.params.id).populate('patient');
      if (!appt) return res.status(404).json({ message: 'Appointment not found' });
      
      console.log('Current appointment weight:', appt.weight, 'height:', appt.height);

      // upload raw audio
      const bucket = firebaseAdmin.storage().bucket();
      const filePath = `recordings/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(filePath);
      await file.save(req.file.buffer, { contentType: req.file.mimetype });
      
      // Create GCS URI for transcription (gs:// format)
      const gcsUri = `gs://${bucket.name}/${file.name}`;
      const recordingUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // transcription + AI note
      const transcript  = await transcribeAudio(gcsUri);
      const doctorName = `${req.doctor.firstName} ${req.doctor.lastName}`;
      const patientName = `${appt.patient.firstName} ${appt.patient.lastName}`;
      
      // Prepare patient and appointment information for AI
      const patientInfo = {
        sex: appt.patient.sex,
        weight: weight || appt.patient.weight || appt.weight,
        height: height || appt.patient.height || appt.height,
        dateOfBirth: appt.patient.dateOfBirth,
        age: appt.patient.dateOfBirth ? Math.floor((new Date() - new Date(appt.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null
      };
      
      console.log('Patient info for AI:', patientInfo);
      console.log('Patient weight from DB:', appt.patient.weight);
      console.log('Patient height from DB:', appt.patient.height);
      
      const appointmentInfo = {
        date: new Date(appt.date).toLocaleDateString(),
        time: new Date(appt.date).toLocaleTimeString(),
        title: appt.title
      };
      
      const consultNote = await generateConsultNote(
        transcript, 
        req.doctor.template, 
        doctorName, 
        patientName, 
        patientInfo, 
        appointmentInfo
      );

      // update appointment
      appt.recordingUrl = recordingUrl;
      appt.transcript   = transcript;
      appt.consultNote  = consultNote;
      // Handle weight and height conversion more robustly
      if (weight && weight.toString().trim() !== '') {
        const weightNum = parseFloat(weight);
        if (!isNaN(weightNum)) {
          appt.weight = weightNum;
        }
      }
      if (height && height.toString().trim() !== '') {
        const heightNum = parseFloat(height);
        if (!isNaN(heightNum)) {
          appt.height = heightNum;
        }
      }
      appt.status       = 'Completed';
      
      console.log('Saving appointment with weight:', appt.weight, 'height:', appt.height);
      console.log('Appointment object before save:', {
        weight: appt.weight,
        height: appt.height,
        weightType: typeof appt.weight,
        heightType: typeof appt.height
      });
      
      await appt.save();
      console.log('Appointment saved successfully');
      
      // Verify the saved data
      const savedAppt = await Appointment.findById(appt._id);
      console.log('Verified saved appointment:', {
        weight: savedAppt.weight,
        height: savedAppt.height,
        weightType: typeof savedAppt.weight,
        heightType: typeof savedAppt.height
      });

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
  }).populate('patient').populate('doctor', '-password');
  res.json(appts);
};

// Get all appointments for the doctor
export const getAllAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({
      doctor: req.doctor._id
    }).populate('patient').populate('doctor', '-password');
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    console.log('Fetching appointment with ID:', req.params.id);
    const appt = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor', '-password');
    
    if (!appt) return res.status(404).json({ message: 'Not found' });
    
    console.log('Raw appointment from DB:', {
      weight: appt.weight,
      height: appt.height,
      weightType: typeof appt.weight,
      heightType: typeof appt.height
    });
    
    console.log('Patient data from DB:', {
      patientId: appt.patient?._id,
      patientName: appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'No patient',
      patientWeight: appt.patient?.weight,
      patientHeight: appt.patient?.height,
      patientWeightType: typeof appt.patient?.weight,
      patientHeightType: typeof appt.patient?.height
    });
    
    console.log('Returning appointment with weight:', appt.weight, 'height:', appt.height);
    res.json(appt);
  } catch (err) {
    console.error('Error in getAppointment:', err);
    res.status(500).json({ message: err.message });
  }
};

// Edit an existing consult note (and optionally weight/height)
export const updateAppointment = async (req, res) => {
  try {
    const { consultNote, weight, height } = req.body;
    console.log('Update appointment - received weight:', weight, 'height:', height);
    
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (consultNote !== undefined) appt.consultNote = consultNote;
    
    // Handle weight and height conversion more robustly
    if (weight !== undefined) {
      if (weight && weight.toString().trim() !== '') {
        const weightNum = parseFloat(weight);
        if (!isNaN(weightNum)) {
          appt.weight = weightNum;
        }
      } else {
        appt.weight = undefined; // Clear the value if empty
      }
    }
    
    if (height !== undefined) {
      if (height && height.toString().trim() !== '') {
        const heightNum = parseFloat(height);
        if (!isNaN(heightNum)) {
          appt.height = heightNum;
        }
      } else {
        appt.height = undefined; // Clear the value if empty
      }
    }
    
    console.log('Saving updated appointment with weight:', appt.weight, 'height:', appt.height);
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
