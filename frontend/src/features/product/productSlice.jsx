import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  featured: [],          // Thêm featuredProducts để hiển thị ở trang Home
  status: 'idle',
  error: null,
};

// Action creators cho việc fetch sản phẩm
export const fetchProducts = () => async (dispatch) => {
  dispatch(fetchProductsPending());
  try {
    const response = await fetch('http://localhost:5000/api/product/');
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách sản phẩm');
    }
    const data = await response.json();
    const products = data.data.products;
    console.log(products);
    dispatch(fetchProductsSuccess(products));
    dispatch(setFeaturedProducts(products));
  } catch (error) {
    // Sử dụng đúng biến error trong catch
    dispatch(fetchProductsFailed(error.message));
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  dispatch(fetchProductByIdPending());
  try {
    const response = await fetch(`http://localhost:5000/api/product/${id}`);
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin sản phẩm');
    }
    const data = await response.json();
    dispatch(fetchProductByIdSuccess(data.data.products));
  } catch (error) {
    dispatch(fetchProductByIdFailed(error.message));
  }
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    fetchProductsPending(state) {
      state.status = 'loading';
    },
    fetchProductsSuccess(state, action) {
      state.status = 'succeeded';
      state.products = action.payload;
    },
    fetchProductsFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
    fetchProductByIdPending(state) {
      state.status = 'loading';
    },
    fetchProductByIdSuccess(state, action) {
      state.status = 'succeeded';
      state.currentProduct = action.payload;
    },
    fetchProductByIdFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
    setFeaturedProducts(state, action) {
      state.featured = action.payload;
    },
  },
});

// Export các action
export const {
  fetchProductsPending,
  fetchProductsSuccess,
  fetchProductsFailed,
  fetchProductByIdPending,
  fetchProductByIdSuccess,
  fetchProductByIdFailed,
  setFeaturedProducts,
} = productSlice.actions;

// Export reducer
export default productSlice.reducer;

// Selectors để truy cập state
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectFeaturedProducts = (state) => state.products.featured; // Thêm selector cho sản phẩm nổi bật
