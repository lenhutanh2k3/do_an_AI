import DiscountController from '../controllers/Discount_controller.js';
import { verifyToken, verifyAdmin } from '../middleware/verify.js';
import express from 'express';

const RouterDiscount = express.Router();

// Không yêu cầu xác thực
RouterDiscount.get('/', DiscountController.getAllDiscounts);
RouterDiscount.get('/:id', DiscountController.getDiscountById);
// RouterDiscount.post('/apply', DiscountController.applyDiscount);

// Yêu cầu quyền admin

RouterDiscount.post('/', DiscountController.createDiscount);
RouterDiscount.put('/:id', DiscountController.updateDiscount);
RouterDiscount.delete('/:id', DiscountController.deleteDiscount);

export default RouterDiscount;