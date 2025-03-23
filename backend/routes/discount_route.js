import DiscountController from '../controllers/Discount_controller.js';
import { verifyToken, verifyAdmin } from '../middleware/verify.js';
import express from 'express';

const RouterDiscount = express.Router();

RouterDiscount.get('/', DiscountController.getAllDiscounts);
RouterDiscount.post('/', DiscountController.createDiscount);
RouterDiscount.put('/:id',  DiscountController.updateDiscount);
RouterDiscount.delete('/:id',  DiscountController.deleteDiscount);
RouterDiscount.get('/:id',  DiscountController.getDiscountById);

export default RouterDiscount;