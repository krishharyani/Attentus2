import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  content:     { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  consultNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }],
  messages:     [messageSchema]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
