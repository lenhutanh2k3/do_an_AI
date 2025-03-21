import express from 'express'
import UserController from '../controllers/User_controller.js';
const RouterUser = express.Router();

RouterUser.get('/',UserController.getAllUsers);
RouterUser.post('/',UserController.createUser);
RouterUser.put('/:id',UserController.updateUser);
RouterUser.delete('/:id',UserController.deleteUser);

export default RouterUser;