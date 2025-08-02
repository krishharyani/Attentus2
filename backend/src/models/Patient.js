import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  dateOfBirth: { type: Date,   required: true },
  sex:         { type: String, enum: ['Male','Female','Other'], required: true },
  weight:      { type: Number },
  height:      { type: Number },
  contactInfo: {
    phone:    { type: String },
    email:    { type: String }
  },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
