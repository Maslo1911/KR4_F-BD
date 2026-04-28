import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
}
});

apiClient.interceptors.request.use(
    (config) => {
        let accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');
        let originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (!accessToken || !refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(error);
            }
            try {
                let response = await api.refresh(refreshToken);
                let isRefreshExpired = response.data.refresh_expired;
                if (isRefreshExpired) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    return Promise.reject(error);
                }
                let newAccessToken = response.data.accessToken;
                let newRefreshToken = response.data.refreshToken;
                originalRequest.headers.Authorization = `Bearer${newAccessToken}`;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                return apiClient(originalRequest);
            }
            catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error)
    }
);

export const api = {
    createProduct: async (product) => {
        let response = await apiClient.post("/products", product);
        return response.data;
    },
    getProducts: async () => {
        let response = await apiClient.get("/products");
        return response.data;
    },
    getProductById: async (id) => {
        let response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product);
        return response.data
    },
    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },
    // Авторизация
    registerUser: async (userData) => {
        const response = await apiClient.post("/auth/register", userData);

        // Если сервер возвращает токены при регистрации
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    },

    loginUser: async (credentials) => {
        const response = await apiClient.post("/auth/login", credentials);

        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);

            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }

            // Получаем данные пользователя
            const userResponse = await apiClient.get("/auth/me");

            if (userResponse.data) {
                localStorage.setItem('user', JSON.stringify(userResponse.data));
                return {
                    user: userResponse.data,
                    token: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
            }
        }

        return response.data;
    },

    refresh: async (refreshToken, accessToken) => {
        return await apiClient.post("/auth/refresh", {
            accessToken: accessToken,
            refreshToken: refreshToken,
            refresh_expired: false
        });
    },
    logoutUser: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    getToken: () => {
        return localStorage.getItem('accessToken');
    },
    // Админ панель
    getAdminUsers: async () => {
        const response = await apiClient.get("/admin/users");
        return response.data;
    },

    getAdminUserById: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    createAdminUser: async (userData) => {
        const response = await apiClient.post("/admin/users", userData);
        return response.data;
    },

    updateAdminUser: async (id, userData) => {
        const response = await apiClient.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    deleteAdminUser: async (id) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    },
}
