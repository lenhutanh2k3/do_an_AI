import express from 'express'
import CategoryController from '../controllers/Category_controller.js';
import validateCategory from '../middleware/validateCategory.js';
import { verifyToken,verifyUser } from '../middleware/verify.js';
const RouterCategory = express.Router();
RouterCategory.get('/',CategoryController.getAllCategory);
RouterCategory.post('/',verifyToken,verifyUser['admin'],validateCategory,CategoryController.createCategory);
RouterCategory.delete('/:id',verifyToken,verifyUser['admin'],CategoryController.deleteCategory)
RouterCategory.put('/:id',verifyToken,verifyUser['admin'],validateCategory,CategoryController.updateCategory)
export default RouterCategory;