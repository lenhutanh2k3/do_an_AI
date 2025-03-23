import { createSlice } from '@reduxjs/toolkit';
 import { api } from '../../utils/api';

const initialState = {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
    accessToken: null,
};

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
            state.accessToken = action.payload.token;
            state.isAuthenticated = true;
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
            state.accessToken = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.error = null;
        },
        loadUserRequest: (state) => {
            state.status = 'loading';
        },
        loadUserSuccess: (state, action) => {
            state.status = 'succeeded';
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        loadUserFailure: (state) => {
            state.status = 'failed';
            state.user = null;
            state.isAuthenticated = false;
        },
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
    loadUserRequest,
    loadUserSuccess,
    loadUserFailure,
} = authSlice.actions;

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

export const loadUser = () => async (dispatch) => {
    dispatch(loadUserRequest());
    try {
        const response = await api.get('/auth/me');
        dispatch(loadUserSuccess({ user: response.data.data.user }));
    } catch (error) {
        dispatch(loadUserFailure());
    }
};

export default authSlice.reducer;