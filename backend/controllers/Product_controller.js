import Product from '../models/product_model.js';
import response from '../utils/response.js';

const ProductController = {

    // Lấy tất cả sản phẩm với phân trang và tìm kiếm
    getAllProduct: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};

            const data = await Product.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate('category')
                .exec();

            const total = await Product.countDocuments(query);

            response(res, 200, "", {
                products: data,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Tạo mới sản phẩm
    createProduct: async (req, res) => {
        try {
            const data = req.body;
            if (!data) return response(res, 400, "Invalid data");

            const product = new Product(data);
            await product.save();

            response(res, 201, "Create product successfully", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Xóa sản phẩm theo ID
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndDelete(id);
            if (!product) return response(res, 404, "Product not found");

            response(res, 200, "Delete product successfully");
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Cập nhật sản phẩm theo ID
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const product = await Product.findByIdAndUpdate(id, data, { new: true }).populate('category');
            if (!product) return response(res, 404, "Product not found");

            response(res, 200, "Update product successfully", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Lấy chi tiết sản phẩm theo ID
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id).populate('category');
            if (!product) return response(res, 404, "Product not found");

            response(res, 200, "", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Lọc sản phẩm theo danh mục
    filterByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const products = await Product.find({ category: categoryId }).populate('category');
            if (!products.length) return response(res, 404, "No products found for this category");

            response(res, 200, "", products);
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Lọc sản phẩm theo giá
    filterByPriceRange: async (req, res) => {
        try {
            const { minPrice, maxPrice } = req.query;
            const products = await Product.find({
                price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
            }).populate('category');

            if (!products.length) return response(res, 404, "No products found in this price range");

            response(res, 200, "", products);
        } catch (error) {
            console.log(error);
            response(res, 500, "Internal Server Error");
        }
    }
};

export default ProductController;
