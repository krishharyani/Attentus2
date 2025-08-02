import Doctor from '../models/Doctor.js';

export const getProfile = (req, res) => {
  res.json(req.doctor);
};

export const updateProfile = async (req, res) => {
  const updates = (({ name, email, profession, template, signatureUrl }) => 
    ({ name, email, profession, template, signatureUrl }))(req.body);
  Object.assign(req.doctor, updates);
  await req.doctor.save();
  res.json(req.doctor);
};
