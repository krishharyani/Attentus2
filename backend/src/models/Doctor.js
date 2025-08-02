import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profession: { type: String, required: true },
  password: { type: String, required: true },
  template: { type: String, required: true },
  voiceProfileUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
