import React, { useState, useEffect } from 'react';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import AuthPage from './pages/AuthPage/AuthPage';
import { api } from './api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = api.getCurrentUser();
        const token = api.getToken();

        if (savedUser && token) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        api.logoutUser();
        setUser(null);
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            {user ? (
                // Передаем user и onLogout в ProductsPage
                <ProductsPage user={user} onLogout={handleLogout} />
            ) : (
                <AuthPage onAuthSuccess={handleAuthSuccess} />
            )}
        </>
    );
}

export default App;