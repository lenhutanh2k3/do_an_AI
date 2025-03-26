// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

const initialState = {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
};

// Thêm loadUser thunk
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/auth/me');
        return response.data.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin người dùng');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.status = 'succeeded';
            state.user = action.payload.user;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', action.payload.token);
        },
        loginFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        registerRequest: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        registerSuccess: (state) => {
            state.status = 'succeeded';
        },
        registerFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            localStorage.removeItem('accessToken');
            localStorage.removeItem('cart');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loadUser.rejected, (state) => {
                state.status = 'failed';
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    registerRequest,
    registerSuccess,
    registerFailure,
    logoutSuccess,
} = authSlice.actions;

// Thêm token vào header của mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (credentials) => async (dispatch) => {
    dispatch(loginRequest());
    try {
        const response = await api.post('/auth/login', credentials);
        dispatch(loginSuccess({ user: response.data.data.user, token: response.data.data.token }));
        return response.data;
    } catch (error) {
        dispatch(loginFailure(error.response?.data?.message || 'Đăng nhập thất bại'));
        throw error;
    }
};

export const register = (userData) => async (dispatch) => {
    dispatch(registerRequest());
    try {
        const response = await api.post('/auth/register', userData);
        dispatch(registerSuccess());
        return response.data;
    } catch (error) {
        dispatch(registerFailure(error.response?.data?.message || 'Đăng ký thất bại'));
        throw error;
    }
};

export const logout = () => async (dispatch) => {
    try {
        await api.post('/auth/logout');
        dispatch(logoutSuccess());
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

export default authSlice.reducer;