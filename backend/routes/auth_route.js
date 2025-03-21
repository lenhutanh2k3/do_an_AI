import express from 'express'
import AuthController from '../controllers/Auth_controller.js';
import { verifyToken,verifyUser } from '../middleware/verify.js';
const RouterAuth = express.Router();

RouterAuth.post('/login',verifyToken,verifyUser['admin','customer'],AuthController.login);
RouterAuth.post('/register',verifyToken,verifyUser['admin','customer'],AuthController.register);
RouterAuth.post('/logout', verifyToken, verifyUser['admin', 'customer'],AuthController.logout);

export default RouterAuth;