import Product from '../models/product_model.js';
import response from '../utils/response.js';
import mongoose from 'mongoose';

const ProductController = {
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
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    createProduct: async (req, res) => {
        try {
            const { name, price, category, sizes, colors, brand, material, stockQuantity } = req.body;

            if (!name || !price || !category || !sizes || !colors || !brand || !material || stockQuantity === undefined) {
                return response(res, 400, "Thiếu thông tin sản phẩm");
            }

            // Validate price và stockQuantity
            if (price < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
                return response(res, 400, "Giá và số lượng không hợp lệ");
            }

            const images = req.file ? `/uploads/${req.file.filename}` : null;

            const status = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
            const product = new Product({
                name,
                price,
                category,
                sizes,
                colors,
                brand,
                material,
                stockQuantity,
                images,
                status
            });

            await product.save();
            response(res, 201, "Tạo sản phẩm thành công", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndDelete(id);
            if (!product) return response(res, 404, "Sản phẩm không tồn tại");
            response(res, 200, "Xóa sản phẩm thành công");
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            if (data.stockQuantity !== undefined) {
                data.status = data.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
            }
            const product = await Product.findByIdAndUpdate(id, data, { new: true }).populate('category');
            if (!product) return response(res, 404, "Sản phẩm không tồn tại");
            response(res, 200, "Cập nhật sản phẩm thành công", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id).populate('category');
            if (!product) return response(res, 404, "Sản phẩm không tồn tại");
            response(res, 200, "", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    filterByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return response(res, 400, "ID danh mục không hợp lệ");
            }
            const products = await Product.find({ category: categoryId }).populate('category');
            if (!products.length) return response(res, 404, "Không tìm thấy sản phẩm cho danh mục này");
            response(res, 200, "", products);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    filterByPriceRange: async (req, res) => {
        try {
            const { minPrice, maxPrice } = req.query;
            if (isNaN(minPrice) || isNaN(maxPrice) || parseFloat(minPrice) > parseFloat(maxPrice)) {
                return response(res, 400, "Khoảng giá không hợp lệ");
            }
            const products = await Product.find({
                price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
            }).populate('category');
            if (!products.length) return response(res, 404, "Không tìm thấy sản phẩm trong khoảng giá này");
            response(res, 200, "", products);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    getProductDiscount: async (req, res) => {
        try {
            // Tìm những sản phẩm có discount (giá trị không null)
            const data = await Product.find({ discount: { $ne: null } })
                .populate('discount') 
                .exec();

            if (!data.length) {
                return response(res, 404, "Không có sản phẩm nào có discount");
            }

            response(res, 200, "", {
                products: data,
            });
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    }

};

export default ProductController;