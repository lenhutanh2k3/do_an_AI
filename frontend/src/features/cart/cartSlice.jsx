import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';
// Trạng thái ban đầu
const initialState = {
  items: [], 
  status: 'idle',
  error: null, 
};

// Lấy giỏ hàng từ server
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data.products;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
  }
});

// Thêm sản phẩm vào giỏ hàng
export const addToCartAsync = createAsyncThunk('cart/addToCart', async (product, { rejectWithValue }) => {
  try {
    console.log(product);
    const response = await api.post('cart', { productId: product._id, quantity: 1 });
    return response.data.products;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
  }
});

// Cập nhật số lượng
export const updateQuantityAsync = createAsyncThunk('cart/updateQuantity', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put('/cart', { productId: id, quantity });
    return response.data.products;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật số lượng');
  }
});

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCartAsync = createAsyncThunk('cart/removeFromCart', async (id, { rejectWithValue }) => {
  try {
    await api.delete('/cart', { data: { productId: id } });
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Lấy giỏ hàng
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Sử dụng action.payload
      })
      // Thêm sản phẩm
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || state.items;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Sử dụng action.payload
      })
      // Cập nhật số lượng
      .addCase(updateQuantityAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || state.items;
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Sử dụng action.payload
      })
      // Xóa sản phẩm
      .addCase(removeFromCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter((item) => item?.product?._id !== action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Sử dụng action.payload
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
