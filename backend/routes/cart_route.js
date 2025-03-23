import CartController from '../controllers/Cart_controller.js';
import express from 'express';
import { verifyToken } from '../middleware/verify.js';

const RouterCart = express.Router();

RouterCart.get('/', verifyToken, CartController.getCart);
RouterCart.post('/', verifyToken, CartController.addToCart);
RouterCart.put('/', verifyToken, CartController.updateQuantity);
RouterCart.delete('/', verifyToken, CartController.removeFromCart);

export default RouterCart;