import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  title:         { type: String, required: true },
  date:          { type: Date,   required: true },
  weight:        { type: Number },
  height:        { type: Number },
  recordingUrl:  { type: String },
  transcript:    { type: String },
  consultNote:   { type: String },
  status:        { type: String, enum: ['Pending','Transcribed','Completed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
