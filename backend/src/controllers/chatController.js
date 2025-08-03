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
    .populate('participants', 'firstName lastName name email')
    .sort('-updatedAt');
  res.json(chats);
};

// Get single chat with messages
export const getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'firstName lastName name email')
    .populate('messages.sender', 'firstName lastName name');
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log('Send message request:', {
      chatId: req.params.id,
      body: req.body,
      doctorId: req.doctor._id
    });

    const { content, patientId, appointmentId, consultNoteId } = req.body;
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      console.log('Chat not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Chat not found' });
    }

    console.log('Found chat:', chat._id);

    const msg = {
      sender: req.doctor._id,
      content,
      patient: patientId,
      appointment: appointmentId,
      consultNoteId: consultNoteId // Store the appointment ID for consult note links
    };

    console.log('Adding message:', msg);
    chat.messages.push(msg);
    await chat.save();
    console.log('Message saved successfully');
    
    // Populate the sender information before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName name email')
      .populate('messages.sender', 'firstName lastName name');
    
    res.json(populatedChat);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: error.message });
  }
};
