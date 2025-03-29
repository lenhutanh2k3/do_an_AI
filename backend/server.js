import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbconnect from './config/database.js';
import route from './routes/index.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser()); 
app.use(session({
    secret: 'nhutanhle2k3',
    resave: false,
    saveUninitialized: true
}));
dbconnect();
route(app); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server running with port ${PORT}`);
});