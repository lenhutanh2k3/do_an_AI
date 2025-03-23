import Cart from '../models/cart_model.js';
import Product from '../models/product_model.js';

const CartController = {
    // Lấy giỏ hàng
    getCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
            console.log({ "giohang": cart });
            if (!cart) return res.status(200).json({ products: [] });
            res.status(200).json({ products: cart.products });
        } catch (error) {
            console.error('Error in getCart:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // Thêm sản phẩm
    addToCart: async (req, res) => {
        try {
            if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });

            const { productId, quantity } = req.body;
            console.log('Request body:', req.body);

            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            if (product.stockQuantity < quantity) return res.status(400).json({ message: 'Số lượng vượt quá tồn kho' });

            let cart = await Cart.findOne({ user: req.user.id });
            if (!cart) {
                cart = new Cart({ user: req.user.id, products: [] });
            }

            const existingItem = cart.products.find((item) => item.product.toString() === productId);
            if (existingItem) {
                if (product.stockQuantity < existingItem.quantity + quantity) {
                    return res.status(400).json({ message: 'Số lượng vượt quá tồn kho' });
                }
                existingItem.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            await cart.populate('products.product');
            res.status(200).json({ products: cart.products });
        } catch (error) {
            console.error('Error in addToCart:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // Cập nhật số lượng
    updateQuantity: async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            if (quantity <= 0) return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });

            const cart = await Cart.findOne({ user: req.user.id });
            if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

            const item = cart.products.find((item) => item.product.toString() === productId);
            if (item) {
                item.quantity = quantity;
                await cart.save();
                await cart.populate('products.product');
                res.status(200).json({ products: cart.products });
            } else {
                res.status(404).json({ message: 'Sản phẩm không tìm thấy trong giỏ hàng' });
            }
        } catch (error) {
            console.error('Error in updateQuantity:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // Xóa sản phẩm
    removeFromCart: async (req, res) => {
        try {
            const { productId } = req.body;

            const cart = await Cart.findOne({ user: req.user.id });
            if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

            cart.products = cart.products.filter((item) => item.product.toString() !== productId);
            await cart.save();
            await cart.populate('products.product');
            res.status(200).json({ products: cart.products });
        } catch (error) {
            console.error('Error in removeFromCart:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
};

export default CartController;