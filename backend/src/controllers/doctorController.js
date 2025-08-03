import Doctor from '../models/Doctor.js';
import { firebaseAdmin } from '../config/firebase.js';

export const getProfile = (req, res) => {
  res.json(req.doctor);
};

export const updateProfile = async (req, res) => {
  const updates = (({ firstName, lastName, email, profession, template, signatureUrl }) => 
    ({ firstName, lastName, email, profession, template, signatureUrl }))(req.body);
  Object.assign(req.doctor, updates);
  await req.doctor.save();
  res.json(req.doctor);
};

// Upload signature image
export const uploadSignature = [
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const bucket = firebaseAdmin.storage().bucket();
      const firebaseFile = bucket.file(`signatures/${Date.now()}_${file.originalname}`);
      await firebaseFile.save(file.buffer, { contentType: file.mimetype });
      const url = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
      
      req.doctor.signatureUrl = url;
      await req.doctor.save();
      
      res.json({ signatureUrl: url });
    } catch (error) {
      console.error('Error uploading signature:', error);
      res.status(500).json({ message: 'Failed to upload signature' });
    }
  }
];

// List all doctors for chat selection
export const listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('_id firstName lastName name email profession');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
