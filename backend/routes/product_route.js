import express from 'express'
import ProductController from '../controllers/Product_controller.js';
import validateProduct from '../middleware/validateProduct.js';
import { verifyToken,verifyUser } from '../middleware/verify.js';
const RouterProduct = express.Router();

RouterProduct.get('/', verifyToken, verifyUser['admin','customer'],ProductController.getAllProduct)
RouterProduct.post('/', verifyToken, verifyUser['admin'],validateProduct,ProductController.createProduct);
RouterProduct.delete('/:id', verifyToken, verifyUser['admin'],ProductController.deleteProduct);
RouterProduct.put('/:id',verifyToken,verifyUser['admin'],validateProduct,ProductController.updateProduct);

export default RouterProduct;