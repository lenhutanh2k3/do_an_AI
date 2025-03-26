import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
    },
    addToCartLocal: (state, action) => {
      const { product, quantity, selectedSize, selectedColor } = action.payload;
      const existingItem = state.items.find((item) => item.product._id === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity,selectedColor,selectedSize });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantityLocal: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.product._id === id);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    removeFromCartLocal: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.product._id !== id);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { setCart, addToCartLocal, updateQuantityLocal, removeFromCartLocal, clearCart } = cartSlice.actions;
export default cartSlice.reducer;