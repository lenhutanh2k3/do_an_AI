import Order_controller from '../controllers/Order_controller.js';
import { verifyToken, verifyAdmin, verifyCustomerOrAdmin } from '../middleware/verify.js';
import express from 'express';

const RouterOrder = express.Router();

RouterOrder.get('/',  Order_controller.getAllOrders);
RouterOrder.post('/',  Order_controller.createOrder);
RouterOrder.put('/:id',  Order_controller.updateOrderStatus);
RouterOrder.delete('/:id', Order_controller.deleteOrder);
RouterOrder.get('/:id',  Order_controller.getOrderById);

export default RouterOrder;