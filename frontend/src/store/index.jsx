import { configureStore } from '@reduxjs/toolkit';
import productSlice from '../features/product/productSlice';
import categorySlice from '../features/category/categorySlice';
 import authSlice from '../features/auth/authSlice'
import cartSlice from '../features/cart/cartSlice';
import orderSlice from '../features/order/orderSlice';

export const store = configureStore({
  reducer: {
    products: productSlice,
    category: categorySlice,
    auth: authSlice,  
    cart: cartSlice,
    orders: orderSlice,
  },
});
