import ProductController from '../controllers/Product_controller.js';
import express from 'express'
import validateProduct from '../middleware/validateProduct.js';
import { verifyToken, verifyAdmin, verifyCustomerOrAdmin } from '../middleware/verify.js';
import upload from '../utils/uploads.js';
const RouterProduct = express.Router();

RouterProduct.get('/', ProductController.getAllProduct);
RouterProduct.get('/product-discount', ProductController.getProductDiscount)
RouterProduct.post('/', upload.array('images',10), ProductController.createProduct);
RouterProduct.delete('/:id', ProductController.deleteProduct);
RouterProduct.put('/:id', upload.array('images', 10), ProductController.updateProduct);
RouterProduct.get('/count', ProductController.countProduct);
RouterProduct.get('/:id',ProductController.getProductById);
export default RouterProduct;