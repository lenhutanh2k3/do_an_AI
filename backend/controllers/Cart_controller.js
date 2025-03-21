import Cart from '../models/cart_model.js'; // Model giỏ hàng
import Product from '../models/product_model.js'; // Model sản phẩm
import response from '../utils/response.js';

const CartController = {
    // Lấy giỏ hàng của người dùng
    getCart: async (req, res) => {
        try {
            const userId = req.user._id; // Lấy ID của người dùng từ token hoặc session
            const cart = await Cart.findOne({ user: userId }).populate('products.product');

            if (!cart) {
                return response(res, 404, "Cart not found");
            }

            response(res, 200, "", cart);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user._id;

            // Kiểm tra sản phẩm có tồn tại không
            const product = await Product.findById(productId);
            if (!product) {
                return response(res, 404, "Product not found");
            }

            let cart = await Cart.findOne({ user: userId });

            // Nếu chưa có giỏ hàng, tạo mới
            if (!cart) {
                cart = new Cart({ user: userId, products: [] });
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            const productIndex = cart.products.findIndex(p => p.product.equals(productId));

            if (productIndex > -1) {
                // Nếu sản phẩm đã có, tăng số lượng
                cart.products[productIndex].quantity += quantity;
            } else {
                // Nếu chưa có, thêm sản phẩm mới vào giỏ
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            response(res, 201, "Product added to cart", cart);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user._id;

            let cart = await Cart.findOne({ user: userId });
            if (!cart) return response(res, 404, "Cart not found");

            // Tìm sản phẩm trong giỏ hàng
            const productIndex = cart.products.findIndex(p => p.product.equals(productId));

            if (productIndex === -1) {
                return response(res, 404, "Product not found in cart");
            }

            // Cập nhật số lượng
            cart.products[productIndex].quantity = quantity;

            await cart.save();
            response(res, 200, "Cart updated successfully", cart);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (req, res) => {
        try {
            const { productId } = req.body;
            const userId = req.user._id;

            let cart = await Cart.findOne({ user: userId });
            if (!cart) return response(res, 404, "Cart not found");

            // Xóa sản phẩm khỏi giỏ
            cart.products = cart.products.filter(p => !p.product.equals(productId));

            await cart.save();
            response(res, 200, "Product removed from cart", cart);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: async (req, res) => {
        try {
            const userId = req.user._id;
            let cart = await Cart.findOneAndDelete({ user: userId });

            if (!cart) {
                return response(res, 404, "Cart not found");
            }

            response(res, 200, "Cart cleared successfully");
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    }
};

export default CartController;
