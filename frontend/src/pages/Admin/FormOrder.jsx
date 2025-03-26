// src/pages/FormOrder.js
import React from 'react';
import OrderForm from '../../components/OrderForm';
import { useParams } from 'react-router-dom';

const FormOrder = () => {
    const { id } = useParams(); // Lấy ID từ URL
    return (
        <OrderForm orderId={id} />
    );
};

export default FormOrder;