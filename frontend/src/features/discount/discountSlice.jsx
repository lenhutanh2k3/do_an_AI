// src/features/discount/discountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  discounts: [],
  appliedDiscount: null,
  status: 'idle',
  error: null,
};

// Thunk để lấy danh sách giảm giá
export const fetchDiscounts = createAsyncThunk('discount/fetchDiscounts', async () => {
  const response = await fetch('/api/discounts');
  if (!response.ok) {
    throw new Error('Không thể lấy danh sách giảm giá');
  }
  const data = await response.json();
  return data;
});

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    applyDiscount: (state, action) => {
      state.appliedDiscount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.discounts = action.payload;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { applyDiscount } = discountSlice.actions;
export default discountSlice.reducer;