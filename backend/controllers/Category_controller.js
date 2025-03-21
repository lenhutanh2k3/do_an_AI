import Category from '../models/category_model.js';
import response from '../utils/response.js';
const CategoryController = {
    getAllCategory: async (req, res) => {
        try {
            const data = await Category.find();
            if (!data || data.length === 0) {
                response(res, 401, "Not found");
            }
            response(res, 201,"",data)
        } catch (error) {
            console.error(error);
            response(res, 500);
        }
    },
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            console.log(req.body);
            const category = new Category({
                name,
                description
            })
            await category.save();
            response(res, 201, " Create successfully category", category)

        } catch (error) {
            console.log(error)
            response(res, 500);
        }
    },
    deleteCategory: async (req, res) => {
        try {

            const id = req.params.id;
            const result = await Category.findByIdAndDelete(id);
            console.log(result);
            if (!result) response(res, 401, "Not found");
            response(res, 201, "Delete successflly");

        } catch (error) {
            console.log(error)
            response(res, 500);
        }
    },
    updateCategory: async (req, res) => {
        try {

            const { id } = req.params;
            const data = req.body;
            console.log(data);
            const categoryUpdate = await Category.findByIdAndUpdate(id, data, { new: true });
            if (!categoryUpdate) response(res, 401, "No successfully");
            response(res, 201, "Update successfully", categoryUpdate)
        } catch (error) {
            console.log(error);
            response(res, 500);
        }
    }
};
export default CategoryController;
