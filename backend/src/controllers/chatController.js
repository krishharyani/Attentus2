import Chat from '../models/Chat.js';

// Start or fetch existing 1:1 chat
export const createChat = async (req, res) => {
  const { doctorId } = req.body;
  const me = req.doctor._id;
  let chat = await Chat.findOne({ participants: { $all: [me, doctorId] } });
  if (!chat) {
    chat = await Chat.create({ participants: [me, doctorId], messages: [] });
  }
  res.status(200).json(chat);
};

// List all chats for this doctor
export const getChats = async (req, res) => {
  const chats = await Chat.find({ participants: req.doctor._id })
    .populate('participants', 'name email')
    .sort('-updatedAt');
  res.json(chats);
};

// Get single chat with messages
export const getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name email')
    .populate('messages.sender', 'name');
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
};

// Send a message
export const sendMessage = async (req, res) => {
  const { content, patientId, appointmentId } = req.body;
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });

  const msg = {
    sender: req.doctor._id,
    content,
    patient: patientId,
    appointment: appointmentId
  };
  chat.messages.push(msg);
  await chat.save();
  res.json(chat);
};
