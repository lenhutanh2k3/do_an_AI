import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import dbconnect from './config/database.js';
import route from './routes/index.js';
import cookieParser from 'cookie-parser';
dotenv.config();
// -------------------------------------------------
const PORT = process.env.PORT || 5000;
const app =express();
app.use(cors())
app.use(express.json());
dbconnect();
route(app);
app.use(cookieParser());
//--------------------------------------------------
app.listen(PORT,()=>
{
    console.log(`Server running with port ${PORT}`)
})