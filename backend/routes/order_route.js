import Order_controller from '../controllers/Order_controller.js';
import { verifyToken, verifyAdmin, verifyCustomerOrAdmin } from '../middleware/verify.js';
import express from 'express';

const RouterOrder = express.Router();

// Routes cần xác thực customer hoặc admin
RouterOrder.post('/', verifyCustomerOrAdmin, Order_controller.createOrder);
RouterOrder.get('/:id', verifyCustomerOrAdmin, Order_controller.getOrderById);

// Routes chỉ dành cho admin
RouterOrder.get('/', verifyAdmin, Order_controller.getAllOrders);
RouterOrder.put('/:id', verifyAdmin, Order_controller.updateOrderStatus);
RouterOrder.delete('/:id', verifyAdmin, Order_controller.deleteOrder);
RouterOrder.get('/count', verifyAdmin, Order_controller.countOrder);

export default RouterOrder;