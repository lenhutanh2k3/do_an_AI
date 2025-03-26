import Category from '../models/category_model.js';
import response from '../utils/response.js';

const CategoryController = {
    getAllCategory: async (req, res) => {
        try {
            const data = await Category.find();
            if (!data || data.length === 0) {
                return response(res, 404, "Không tìm thấy danh mục");
            }
            response(res, 200, "", data);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return response(res, 400, "Danh mục đã tồn tại");
            }
            const category = new Category({ name, description });
            await category.save();
            response(res, 201, "Tạo danh mục thành công", category);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await Category.findByIdAndDelete(id);
            if (!result) {
                return response(res, 404, "Danh mục không tồn tại");
            }
            response(res, 200, "Xóa danh mục thành công");
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const categoryUpdate = await Category.findByIdAndUpdate(id, data, { new: true });
            if (!categoryUpdate) {
                return response(res, 404, "Danh mục không tồn tại");
            }
            response(res, 200, "Cập nhật danh mục thành công", categoryUpdate);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    countCategory: async (req, res) => {
        try {
            
            const categoryCount = await Category.countDocuments();
            console.log(categoryCount);
            // Trả về kết quả
            res.status(200).json({
                success: true,
                count: categoryCount,
                message: 'Số lượng category được tính thành công!'
            });
        } catch (error) {
            // Xử lý lỗi
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi tính số lượng category'
            });
        }
    }
};

export default CategoryController;