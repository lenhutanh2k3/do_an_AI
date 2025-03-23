// src/features/category/categorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],  // Danh sách danh mục
  status: 'idle',  // Trạng thái: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,     // Lỗi nếu có
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    fetchCategoriesStart(state) {
      state.status = 'loading';
    },
    fetchCategoriesSuccess(state, action) {
      state.status = 'succeeded';
      state.categories = action.payload;
    },
    fetchCategoriesFailure(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

// Export actions
export const { fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoriesFailure } = categorySlice.actions;

// Thunk thủ công để gọi API và cập nhật state
export const fetchCategories = () => async (dispatch) => {
  dispatch(fetchCategoriesStart()); // Bắt đầu gọi API, set trạng thái là 'loading'

  try {
    const response = await fetch('http://localhost:5000/api/category');
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách danh mục');
    }
    const data = await response.json();
    dispatch(fetchCategoriesSuccess(data.data));
  } catch (error) {
    dispatch(fetchCategoriesFailure(error.message)); 
  }
};

// Export reducer
export default categorySlice.reducer;

// Selector để truy cập state
export const selectCategories = (state) => state.category.categories;
export const selectCategoryStatus = (state) => state.category.status;
export const selectCategoryError = (state) => state.category.error;
