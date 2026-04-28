import React, { useState } from 'react';
import { api } from "../../api";
import './AuthPage.css';

export default function AuthPage({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Очищаем ошибки при вводе
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                // Вход
                const response = await api.loginUser({
                    email: formData.email,
                    password: formData.password
                });

                if (response.user && response.token) {
                    setSuccess('Вход выполнен успешно!');
                    setTimeout(() => {
                        onAuthSuccess(response.user);
                    }, 1000);
                }
            } else {
                // Регистрация
                if (!formData.first_name || !formData.last_name) {
                    throw new Error('Имя и фамилия обязательны');
                }

                await api.registerUser({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name
                });

                setSuccess('Регистрация успешна! Выполняем вход...');

                // Автоматический вход после регистрации
                const loginResponse = await api.loginUser({
                    email: formData.email,
                    password: formData.password
                });

                if (loginResponse.user && loginResponse.token) {
                    setTimeout(() => {
                        onAuthSuccess(loginResponse.user);
                    }, 1500);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(
                err.response?.data?.error ||
                err.message ||
                'Произошла ошибка. Попробуйте снова.'
            );
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
        setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: ''
        });
    };

    return (
        <div className="auth-page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Store707</div>
                </div>
            </header>

            <main className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">
                        {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
                    </h2>

                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="name-row">
                                <div className="auth-field">
                                    <label className="auth-label">Имя</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="auth-input"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="Иван"
                                        disabled={loading}
                                        required={!isLogin}
                                    />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Фамилия</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="auth-input"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="Петров"
                                        disabled={loading}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="auth-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                        <button onClick={switchMode} disabled={loading}>
                            {isLogin ? 'Создать аккаунт' : 'Войти'}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Store707
                </div>
            </footer>
        </div>
    );
}