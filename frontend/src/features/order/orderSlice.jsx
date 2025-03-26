import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  status: 'idle',
  error: null,
};

// Thunk để đặt hàng
export const placeOrder = createAsyncThunk('order/placeOrder', async (orderData) => {
  const response = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    throw new Error('Đặt hàng thất bại');
  }
  const data = await response.json();
  return data;
});

// Thunk để lấy lịch sử đơn hàng
export const fetchOrders = createAsyncThunk('order/fetchOrders', async () => {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Không thể lấy lịch sử đơn hàng');
  }
  const data = await response.json();
  return data;
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;