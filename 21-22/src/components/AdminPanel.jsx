import React, { useState, useEffect } from 'react';
import { api } from '../api/index';
import '../pages/ProductsPage/ProductsPage.css';

export default function AdminPanel({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Удалить пользователя?')) return;

        try {
            await api.deleteAdminUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert('Ошибка удаления пользователя');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            first_name: '',
            last_name: '',
            password: '',
            role: 'user'
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: '',
            role: user.role
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                const updatedUser = await api.updateAdminUser(editingUser.id, formData);
                setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
            } else {
                const newUser = await api.createAdminUser(formData);
                setUsers([...users, newUser]);
            }
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Ошибка сохранения');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="admin-panel">
            <div className="admin-panel__header">
                <h2>Управление пользователями</h2>
                <div className="admin-panel__actions">
                    <button className="btn btn--primary" onClick={openCreateModal}>
                        + Создать пользователя
                    </button>
                    <button className="btn btn--secondary" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>

            {error && <div className="admin-panel__error">{error}</div>}

            {loading ? (
                <div className="empty">Загрузка...</div>
            ) : (
                <div className="users-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Имя</th>
                            <th>Фамилия</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавец' : 'Пользователь'}
                                        </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn--small"
                                        onClick={() => openEditModal(user)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn--small btn--danger"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__header">
                            <h3>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</h3>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
                        </div>
                        <form className="form" onSubmit={handleSubmit}>
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label className="label">Имя</label>
                            <input
                                className="input"
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label">Фамилия</label>
                            <input
                                className="input"
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            <label
                                className="label">Пароль {editingUser && '(оставьте пустым, чтобы не менять)'}</label>
                            <input
                                className="input"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!editingUser}
                            />
                            <label className="label">Роль</label>
                            <select className="input" name="role" value={formData.role} onChange={handleChange}>
                                <option value="user">Пользователь</option>
                                <option value="seller">Продавец</option>
                                <option value="admin">Администратор</option>
                            </select>
                            <div className="form-actions">
                                <button type="submit" className="btn btn--primary">
                                    {editingUser ? 'Сохранить' : 'Создать'}
                                </button>
                                <button type="button" className="btn btn--secondary"
                                        onClick={() => setModalOpen(false)}>
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                )}
        </div>
    );
}