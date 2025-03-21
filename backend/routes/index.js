import express from 'express';
import RouterProduct from './product_route.js';
import RouterCategory from './category_route.js';
import RouterUser from './user_route.js';
import RouterAuth from './auth_route.js';
const app =express();
const route =(app)=>
{
    app.use('/api/product',RouterProduct);
    app.use('/api/category',RouterCategory);
    app.use('/api/user',RouterUser);
    app.use('/api/auth',RouterAuth)

}
export default route;