import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createChat,
  getChats,
  getChatById,
  sendMessage
} from '../controllers/chatController.js';

const router = express.Router();
router.use(protect);

router.post('/', createChat);
router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/:id/message', sendMessage);

export default router;
