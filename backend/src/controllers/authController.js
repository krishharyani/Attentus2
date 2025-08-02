import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import { firebaseAdmin } from '../config/firebase.js';

// Signup: multipart form with fields name, email, password, profession, template and file field "voiceSample"
export const signup = async (req, res) => {
  try {
    const { name, email, password, profession, template } = req.body;
    
    // at the top of the signup function
    let voiceProfileUrl = '';
    if (req.file) {
      // existing upload logic
      const bucket = firebaseAdmin.storage().bucket();
      const file = bucket.file(`voiceProfiles/${Date.now()}_${req.file.originalname}`);
      await file.save(req.file.buffer, { contentType: req.file.mimetype });
      voiceProfileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    }

    const hashed = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({
      name,
      email,
      profession,
      password: hashed,
      template,
      voiceProfileUrl
    });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ doctor: { id: doctor._id, name, email, profession, template, voiceProfileUrl }, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login: JSON with email & password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) throw new Error('Invalid credentials');
    const match = await bcrypt.compare(password, doctor.password);
    if (!match) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ doctor: { id: doctor._id, name: doctor.name, email, profession: doctor.profession, template: doctor.template, voiceProfileUrl: doctor.voiceProfileUrl }, token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
