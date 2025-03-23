import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbconnect from './config/database.js';
import route from './routes/index.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Thêm cookieParser trước routes
dbconnect();
route(app); // Routes được áp dụng sau khi cookieParser đã chạy
app.use('/uploads', express.static('/uploads'));

app.listen(PORT, () => {
    console.log(`Server running with port ${PORT}`);
});