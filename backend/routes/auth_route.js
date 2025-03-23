import express from 'express'
import AuthController from '../controllers/Auth_controller.js';
import { verifyToken,verifyUser } from '../middleware/verify.js';
const RouterAuth = express.Router();

RouterAuth.post('/login', AuthController.login);
RouterAuth.post('/register', AuthController.register);
RouterAuth.post('/logout',AuthController.logout);
RouterAuth.post('/refreshToken',AuthController.refreshToken);
RouterAuth.get('/me', AuthController.getCurrentUser);
export default RouterAuth;