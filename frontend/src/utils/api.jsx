import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5000/api/',
    withCredentials: true, 
});

// Không cần interceptor nếu backend đọc token từ cookie
export const setupAuthInterceptor = (store) => {
    
    api.interceptors.request.use(
        (config) => {
            console.log('Request sent with cookies:', config.url);
            return config;
        },
        (error) => Promise.reject(error)
    );
};