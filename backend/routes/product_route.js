import express from 'express';
import ProductController from '../controllers/Product_controller.js';
import validateProduct from '../middleware/validateProduct.js';
import { verifyToken, verifyAdmin, verifyCustomerOrAdmin } from '../middleware/verify.js';
import upload from '../utils/uploads.js';
const RouterProduct = express.Router();

RouterProduct.get('/',ProductController.getAllProduct);
RouterProduct.get('/product-discount',ProductController.getProductDiscount)
RouterProduct.post('/', upload.single('file'), ProductController.createProduct);
RouterProduct.delete('/:id', ProductController.deleteProduct);
RouterProduct.put('/:id', ProductController.updateProduct);

export default RouterProduct;