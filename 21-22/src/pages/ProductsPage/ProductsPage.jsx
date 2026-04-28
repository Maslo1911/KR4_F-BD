import React, { useEffect, useState } from "react";
import "./ProductsPage.css";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api";
import AuthModal from "../../components/AuthModal";
import AdminPanel from "../../components/AdminPanel";
export default function ProductsPage({ user, onLogout }) {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState("");
    const [searchError, setSearchError] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit
    const [editingProduct, setEditingProduct] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("");
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    useEffect(() => {
        loadProducts();
        }, []);

    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert("Сессия истекла. Пожалуйста, войдите снова.");
                handleLogout();
            }
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };
    const handleSearchById = async () => {
        if (!searchId.trim()) {
            setSearchError("Введите ID товара");
            setSearchResult(null);
            setFilteredProducts(products);
            return;
        }

        const id = searchId;

        try {
            setLoading(true);
            setSearchError("");

            const localProduct = products.find(p => p.id === id);

            if (localProduct) {
                setSearchResult(localProduct);
                setFilteredProducts([localProduct]);
            } else {
                const product = await api.getProductById(id);
                setSearchResult(product);
                setFilteredProducts([product]);
            }
        } catch (err) {
            console.error(err);
            setSearchError(`Товар с ID ${id} не найден`);
            setSearchResult(null);
            setFilteredProducts(products);
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setSearchId("");
        setSearchError("");
        setSearchResult(null);
        setFilteredProducts(products);
    };
    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };
    const openEdit = (product) => {setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };
    const openRegister = () => {
        setAuthModalMode("register");
        setAuthModalOpen(true);
    };
    const openLogin = () => {
        setAuthModalMode("login");
        setAuthModalOpen(true);
    };
    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setAuthModalMode("");
    };
    const handleLogout = () => {
        api.logoutUser();
        onLogout();
    };
    const handleDelete = async (id) => {
        if (!user) {
            alert("Необходимо авторизоваться");
            return;
        }

        const ok = window.confirm("Удалить товар?");
        if (!ok) return;

        try {
            await api.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
            if (searchResult && searchResult.id === id) {
                resetSearch();
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert("Сессия истекла. Пожалуйста, войдите снова.");
                handleLogout();
            } else {
                alert("Ошибка удаления товара");
            }
        }
    };
    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts((prev) => [ ... prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts((prev) =>
                    prev.map((p) => (p.id === payload.id ? updatedProduct : p))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert("Сессия истекла. Пожалуйста, войдите снова.");
                handleLogout();
            }
            alert("Ошибка сохранения товара");
        }
    };
    const handleSubmitAuthModal = async (payload) => {
        try {
            let response;

            if (authModalMode === "register") {
                // Регистрируемся
                await api.registerUser(payload);

                // И сразу входим с теми же данными
                response = await api.loginUser({
                    email: payload.email,
                    password: payload.password
                });
            } else {
                // Просто входим
                response = await api.loginUser(payload);
            }
            console.log("Response from login:", response);

            if (response.user && response.token) {
                closeAuthModal(); // Закрываем окно только после успешного входа
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error ||
                `Ошибка ${authModalMode === "register" ? "регистрации" : "входа"}`;
            alert(errorMessage);
        }
    };
    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Store707</div>
                    <div className="header__right">
                        {user ? (
                            <>
                                <span className="user-greeting">
                                    Привет, {user.first_name}!
                                </span>
                                <button className="btn btn--secondary" onClick={handleLogout}>
                                    Выход
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn--secondary" onClick={openLogin}>
                                    Вход
                                </button>
                                <button className="btn btn--secondary" onClick={openRegister}>
                                    Регистрация
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары</h1>
                        <div className="search-section">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Поиск по ID товара"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
                                    className="search-input"
                                />
                                <button
                                    className="btn btn--primary search-btn"
                                    onClick={handleSearchById}
                                >
                                    Найти
                                </button>
                                {searchResult && (
                                    <button
                                        className="btn btn--secondary reset-btn"
                                        onClick={resetSearch}
                                    >
                                        Сбросить
                                    </button>
                                )}
                            </div>
                            {searchError && (
                                <div className="search-error">{searchError}</div>
                            )}
                            {searchResult && (
                                <div className="search-result-info">
                                    Найден товар: {searchResult.name} (ID: {searchResult.id})
                                </div>
                            )}
                        </div>
                        {user?.role === 'admin' && (
                            <button
                                className="btn btn--primary"
                                onClick={() => setShowAdminPanel(true)}
                            >
                                Админ панель
                            </button>
                        )}
                        {user.role === 'seller' && (
                            <button className="btn btn--primary" onClick={openCreate}>
                                + Создать
                            </button>
                        )}
                    </div>
                    {showAdminPanel && (
                        <div className="admin-panel-overlay">
                            <AdminPanel onClose={() => setShowAdminPanel(false)} />
                        </div>
                    )}
                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : filteredProducts.length > 0 ? (
                        <ProductsList
                            products={filteredProducts}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            user={user} // Передаем user для проверки прав
                        />
                    ) : (
                        <div className="empty">
                            {searchId ? "Товары не найдены" : "Нет товаров"}
                        </div>
                    )}
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Store707
                </div>
            </footer>
            <ProductModal open={modalOpen}
                          mode={modalMode}
                          initialProduct={editingProduct}
                          onClose={closeModal}
                          onSubmit={handleSubmitModal}
            />
            <AuthModal open={authModalOpen}
                       mode={authModalMode}
                       onClose={closeAuthModal}
                       onSubmit={handleSubmitAuthModal}
            />
        </div>);
}
