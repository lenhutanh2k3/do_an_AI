import Product from '../models/product_model.js';
import response from '../utils/response.js';
import mongoose from 'mongoose';

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
                .populate('discount')
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

    // Tạo sản phẩm mới
    createProduct : async (req, res) => {
        try {
            const {
                name,
                price,
                category,
                sizes = '',
                colors = '',
                brand,
                material,
                stockQuantity,
                description,
                discount
            } = req.body;

            // Kiểm tra thông tin bắt buộc
            if (!name || !price || !category || !brand || !material || stockQuantity === undefined) {
                return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
            }

            // Lấy đường dẫn file ảnh từ Multer
            const uploadedImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
            if (uploadedImages.length === 0) {
                return res.status(400).json({ message: "Sản phẩm cần ít nhất một ảnh" });
            }

            // Xử lý sizes và colors
            const processedSizes = sizes ? sizes.split(',').map(s => s.trim()) : [];
            const processedColors = colors ? colors.split(',').map(c => c.trim()) : [];

            // Tạo dữ liệu sản phẩm
            const productData = {
                name,
                price: parseFloat(price),
                category,
                sizes: processedSizes,
                colors: processedColors,
                brand,
                material,
                stockQuantity: parseInt(stockQuantity),
                images: uploadedImages, // Lưu đường dẫn ảnh
                status: stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
                description,
                discount: discount || null
            };

            const product = new Product(productData);
            await product.save();

            res.status(201).json({ message: "Tạo sản phẩm thành công", data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
        }
    },
    // Cập nhật sản phẩm
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                price,
                category,
                sizes,
                colors,
                brand,
                material,
                stockQuantity,
                description,
                discount
            } = req.body;
            console.log(req.body);
            const updateData = {};

            if (name) updateData.name = name;
            if (price) updateData.price = parseFloat(price);
            if (category) updateData.category = category;
            if (brand) updateData.brand = brand;
            if (material) updateData.material = material;
            if (stockQuantity !== undefined) {
                updateData.stockQuantity = parseInt(stockQuantity);
                updateData.status = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
            }
            if (description) updateData.description = description;
            if (discount) updateData.discount = discount;
            else if (discount === null) updateData.discount = null;

            if (sizes) {
                updateData.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
            }
            if (colors) {
                updateData.colors = Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim());
            }

            if (req.files && req.files.length > 0) {
                updateData.images = req.files.map(file => `/uploads/${file.filename}`);
            }

            const product = await Product.findByIdAndUpdate(id, updateData, { new: true }).populate('category');
            if (!product) return response(res, 404, "Sản phẩm không tồn tại");

            response(res, 200, "Cập nhật sản phẩm thành công", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Xóa sản phẩm
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

    // Lấy sản phẩm theo ID
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id).populate('category').populate('discount');
            if (!product) return response(res, 404, "Sản phẩm không tồn tại");
            response(res, 200, "", product);
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Lọc sản phẩm theo danh mục
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

    // Lọc sản phẩm theo khoảng giá
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

    // Lấy sản phẩm có discount
    getProductDiscount: async (req, res) => {
        try {
            const data = await Product.find({ discount: { $ne: null } })
                .populate('discount')
                .exec();
            if (!data.length) {
                return response(res, 404, "Không có sản phẩm nào có discount");
            }
            response(res, 200, "", { products: data });
        } catch (error) {
            console.log(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Đếm số lượng sản phẩm
    countProduct: async (req, res) => {
        try {
            const productCount = await Product.countDocuments();
            res.status(200).json({
                success: true,
                count: productCount,
                message: 'Số lượng product được tính thành công!'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi tính số lượng product'
            });
        }
    }
};

export default ProductController;