import express from 'express'
import UserController from '../controllers/User_controller.js';
import { verifyToken,verifyUpdateUser,verifyAdmin } from '../middleware/verify.js';
const RouterUser = express.Router();

RouterUser.get('/',  UserController.getAllUsers);
RouterUser.post('/',  UserController.createUser);
RouterUser.put('/:id', UserController.updateUser);
RouterUser.delete('/:id', UserController.deleteUser);
RouterUser.get('/count',UserController.countUser)
export default RouterUser;