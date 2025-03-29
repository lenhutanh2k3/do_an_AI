import express from 'express';
import ChatbotController from '../controllers/ChatbotController.js';    

const router = express.Router();

router.post('/chat', ChatbotController.handleWebhook);

export default router;
