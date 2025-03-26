import React from 'react';
import ProductForm from '../../components/ProductForm';
import { useParams } from 'react-router-dom';

const FormProduct = () => {
    const { id } = useParams(); // Lấy ID từ URL
    return (
        <ProductForm productId={id} /> 
    );
};

export default FormProduct;
