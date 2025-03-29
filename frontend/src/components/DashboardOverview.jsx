import React, { useEffect, useState } from 'react';

const DashboardOverview = () => {
    const [stats, setStats] = useState({ users: 0, categories: 0, products: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch user count
                const usersResponse = await fetch('/api/user/count');
                const usersData = await usersResponse.json();

                // Fetch category count
                const categoriesResponse = await fetch('/api/category/count');
                const categoriesData = await categoriesResponse.json();

                // Fetch product count
                const productsResponse = await fetch('/api/product/count');
                const productsData = await productsResponse.json();

                // Set the stats after receiving all responses
                setStats({
                    users: usersData.count || 0,
                    categories: categoriesData.count || 0,
                    products: productsData.count || 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">Total Users</h3>
                <p className="text-4xl">{stats.users}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">Total Categories</h3>
                <p className="text-4xl">{stats.categories}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">Total Products</h3>
                <p className="text-4xl">{stats.products}</p>
            </div>
        </div>
    );
};

export default DashboardOverview;
