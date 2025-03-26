import express from 'express';
import CategoryController from '../controllers/Category_controller.js';
import validateCategory from '../middleware/validateCategory.js';
import { verifyToken, verifyAdmin } from '../middleware/verify.js';

const RouterCategory = express.Router();

RouterCategory.get('/', CategoryController.getAllCategory);
RouterCategory.get('/count', CategoryController.countCategory)
RouterCategory.post('/',  validateCategory, CategoryController.createCategory);
RouterCategory.delete('/:id', CategoryController.deleteCategory);
RouterCategory.put('/:id',  validateCategory, CategoryController.updateCategory);

export default RouterCategory;