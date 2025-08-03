import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profession: { type: String, required: true },
  password: { type: String, required: true },
  template: { type: String, required: true },
  voiceProfileUrl: { type: String, required: false },
  signatureUrl:    { type: String },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
