import express from 'express';
import RouterProduct from './product_route.js';
import RouterCategory from './category_route.js';
import RouterUser from './user_route.js';
import RouterAuth from './auth_route.js';
import RouterDiscount from './discount_route.js';
import RouterCart from './cart_route.js';
import RouterOrder from './order_route.js';
const route =(app)=>
{
    app.use('/api/product',RouterProduct);
    app.use('/api/category',RouterCategory);
    app.use('/api/user',RouterUser);
    app.use('/api/auth',RouterAuth);
    app.use('/api/discount',RouterDiscount);
    app.use('/api/cart',RouterCart);
    app.use('/api/order',RouterOrder);

}
export default route;