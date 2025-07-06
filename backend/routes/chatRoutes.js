import express from 'express';
import {
    createRoom,
    getRoom,
    createMessage,
    getMessages,
    getUserMessages
} from '../controllers/chatController.js'

const router = express.Router();

router.post('/create', createRoom);
router.get('/:ngo', getRoom);
router.post('/save', createMessage);
router.get('/history/:room', getMessages);
router.get('/user/:userId',getUserMessages)
export default router;
