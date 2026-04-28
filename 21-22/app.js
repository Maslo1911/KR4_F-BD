const express = require('express');
const { nanoid } = require('nanoid');
const jwt = require("jsonwebtoken");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require("bcrypt");
const cors = require("cors");
const { createClient } = require("redis");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления товарами',
            version: '1.0.0',
            description: 'Простое API для управления товарами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";
// Время жизни токена
const ACCESS_EXPIRES_IN = "5m";
const REFRESH_EXPIRES_IN = "10m";

// Время хранения кэша
const USERS_CACHE_TTL = 60;       // 1 минута
const PRODUCTS_CACHE_TTL = 600;   // 10 минут

// Redis клиент
const redisClient = createClient({ url: "redis://127.0.0.1:6379" });
redisClient.on("error", (err) => console.error("Redis error:", err));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - cost
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         cost:
 *           type: number
 *           description: Цена товара
 *         quantity:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "d5fE_S"
 *         name: "iPhone 15"
 *         category: "Телефоны"
 *         description: "Самый приятный и удобный смартфон на рынке"
 *         cost: 50000
 *         quantity: 10
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Электронная почта (логин)
 *         first_name:
 *           type: string
 *           description: Имя
 *         last_name:
 *           type: string
 *           description: Фамилия
 *         hashedPassword:
 *           type: string
 *           description: Хеш пароля (bcrypt)
 *       example:
 *         id: "abc123"
 *         email: "ivan@example.com"
 *         first_name: "Иван"
 *         last_name: "Петров"
 *         hashedPassword: "$2b$10$k06Hq7ZkfV4cPzGm8u7mEuR7r4Xx2p9mP0q3t1yZbCq9Lh5a8b1Qw"
 */

let products = [
    {
        id: "123456",
        category: "Наушники",
        description: "Отличные наушники с активным шумоподавлением",
        name: 'AirPods',
        cost: 20000,
        quantity: 100,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Телефоны",
        description: "Мощный смартфон нового поколения для любых задач",
        name: 'Samsung Galaxy S24',
        cost: 40000,
        quantity: 50,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Чехлы",
        description: "Силиконовый чехол отлично защитить ваш телефон",
        name: 'Чехол для Samsung Galaxy S24',
        cost: 3000,
        quantity: 200,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Чехлы",
        description: "Силиконовый чехол отлично защитить ваш телефон",
        name: 'Чехол для iPhone 15',
        cost: 5000,
        quantity: 150,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Телефоны",
        description: "Самый приятный и удобный смартфон на рынке",
        name: 'iPhone 15',
        cost: 50000,
        quantity: 10,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Наушники",
        description: "Наушники для тех, кто ценит идеальный звук",
        name: 'Marshall Major IV',
        cost: 15000,
        quantity: 30,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Планшеты",
        description: "Выгодный баланс размера и мощности",
        name: 'iPad 5',
        cost: 25000,
        quantity: 20,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Игровые консоли",
        description: "Погружение в игры нового поколения с 4K",
        name: 'PlayStation 5 Slim',
        cost: 55000,
        quantity: 8,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Мониторы",
        description: "Изогнутый экран 144Гц для геймеров и дизайнеров",
        name: 'Samsung Odyssey G5',
        cost: 28000,
        quantity: 12,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
    {
        id: nanoid(6),
        category: "Фотокамеры",
        description: "Компактная беззеркалка для ведения влогов",
        name: 'Sony ZV-E10',
        cost: 72000,
        quantity: 5,
        image: "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    },
]

const refreshTokens = new Set();
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.email,
            role: user.role
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}
function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

// Middleware для парсинга JSON
app.use(express.json());

// Middleware чтения из кэша
function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cached = await redisClient.get(key);
            if (cached) {
                return res.json({ source: "cache", data: JSON.parse(cached) });
            }
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error("Cache read error:", err);
            next();
        }
    };
}

// Сохранение в кэш
async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error("Cache save error:", err);
    }
}

// Инвалидация кэша пользователей
async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del("users:all");
        if (userId) await redisClient.del(`users:${userId}`);
    } catch (err) {
        console.error("Users cache invalidate error:", err);
    }
}

// Инвалидация кэша товаров
async function invalidateProductsCache(productId = null) {
    try {
        await redisClient.del("products:all");
        if (productId) await redisClient.del(`products:${productId}`);
    } catch (err) {
        console.error("Products cache invalidate error:", err);
    }
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    // Ожидаем формат: Bearer <token>
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }
    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        // сохраняем данные токена в req
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}

// Инициализация пользователей
async function initializeUsers() {
    const adminPassword = await bcrypt.hash("admin", 10);
    const sellerPassword = await bcrypt.hash("seller", 10);

    users = [
        {
            id: "0",
            email: "admin@admin",
            first_name: "admin",
            last_name: "admin",
            hashedPassword: adminPassword,
            role: "admin"
        },
        {
            id: "1",
            email: "seller@seller",
            first_name: "Иван",
            last_name: "Иванов",
            hashedPassword: sellerPassword,
            role: "seller"
        },
    ];
}

// Запускаем инициализацию
let users = [];
initializeUsers().catch(console.error);

function findUserOr404(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Отсутствуют обязательные поля
 */

app.post("/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;
    if (!email || !password || !first_name || !last_name === undefined) {
        return res.status(400).json({ error: "email, password, last name and first name are required" });
        }
        const newUser = {
            id: nanoid(6),
            email: email,
            first_name: first_name,
            last_name: last_name,
            hashedPassword: await hashPassword(password),
            role: "user"
        };
        users.push(newUser);
        res.status(201).json(newUser);
    });

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: "email and password are required",
        });
    }
    const user = findUserOr404(email, res)
    if (!user) return;
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({
            error: "Invalid credentials",
        });
    }
// Создание access-токена
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken)
    res.json({
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        }
    });
});

app.get("/auth/me", authMiddleware, (req, res) => {
    // sub мы положили в токен при login
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({
            error: "User not found",
        });
    }
    // никогда не возвращаем passwordHash
    res.json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.email,
        role: user.role
    });
});

app.post("/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        });
    }
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find((u) => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({
                error: "User not found",
            });
        }
        // Ротация refresh-токена:
        // старый удаляем, новый создаём
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            refresh_expired: false
        });
    } catch (err) {
        return res.status(401).json({
            refresh_expired: false,
            error: "Invalid or expired refresh token",
    });
    }
});

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Функция-помощник для получения пользователя из списка
function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// Главная страница
app.get('/', (req, res) => {
    res.send('Главная страница');
});
// CRUD

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */

app.post('/products', authMiddleware, roleMiddleware(["seller"]), async (req, res) => {
    const {name, cost, category, description, quantity, image} = req.body;
    const newProduct = {
        id: nanoid(6),
        name: name ? name.trim() : "Без названия",
        cost: Number(cost) || 0,
        category: category || "Общее",
        description: description || "",
        quantity: Number(quantity) || 0,
        image: image ? image : "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
    };
    products.push(newProduct);
    await invalidateProductsCache();
    res.status(201).json(newProduct);
});
app.get('/products', authMiddleware, roleMiddleware(["user", "seller", "admin"]),
    cacheMiddleware(() => "products:all", PRODUCTS_CACHE_TTL),
    async (req, res) => {
        await saveToCache(req.cacheKey, products, req.cacheTTL);
        res.json({ source: "server", data: products });
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *
 *   put:
 *     summary: Обновляет данные товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Обновленный товар
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 *
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */

app.get('/products/:id', authMiddleware, roleMiddleware(["user", "seller", "admin"]),
    cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
    async (req, res) => {
        const product = findProductOr404(req.params.id, res);
        if (!product) return;
        await saveToCache(req.cacheKey, product, req.cacheTTL);
        res.json({ source: "server", data: product });
    }
);
app.put('/products/:id', authMiddleware, roleMiddleware(["seller", "admin"]), async (req, res) => {

    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    // Проверяем наличие хотя бы одного поля для обновления
    const {name, cost, category, description, quantity, image} = req.body;

    if (!name && cost === undefined && !category && !description && quantity === undefined) {
        return res.status(400).json({error: "Nothing to update"});
    }

    // Обновляем только те поля, которые пришли в запросе
    if (name !== undefined) product.name = name.trim();
    if (cost !== undefined) product.cost = Number(cost);
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (image !== undefined) product.image = image;

    await invalidateProductsCache(product.id);
    res.json(product);
});
app.delete('/products/:id', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const id = req.params.id;
    const exists = products.some((p) => p.id === id);
    if (!exists) return res.status(404).json({error: "product not found"});
    products = products.filter((p) => p.id !== id);
    await invalidateProductsCache(id);
    // Правильнее 204 без тела
    res.status(204).send();
});

// ============= АДМИН ПАНЕЛЬ - УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =============

// Получить всех пользователей (только для админа)
app.get('/admin/users', authMiddleware, roleMiddleware(["admin"]),
    cacheMiddleware(() => "users:all", USERS_CACHE_TTL),
    async (req, res) => {
        const data = users.map(({ hashedPassword, ...u }) => u);
        await saveToCache(req.cacheKey, data, req.cacheTTL);
        res.json({ source: "server", data });
    }
);

// Получить пользователя по ID (только для админа)
app.get('/admin/users/:id', authMiddleware, roleMiddleware(["admin"]),
    cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
    async (req, res) => {
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        const { hashedPassword, ...data } = user;
        await saveToCache(req.cacheKey, data, req.cacheTTL);
        res.json({ source: "server", data });
    }
);

// Создать пользователя (только для админа)
app.post('/admin/users', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        hashedPassword,
        role: role || "user"
    };

    users.push(newUser);

    await invalidateUsersCache();
    const { hashedPassword: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

// Обновить пользователя (только для админа)
app.put('/admin/users/:id', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { email, first_name, last_name, role, password } = req.body;

    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role) user.role = role;
    if (password) {
        user.hashedPassword = await bcrypt.hash(password, 10);
    }

    const { hashedPassword, ...userWithoutPassword } = user;
    await invalidateUsersCache(userId);
    res.json(userWithoutPassword);
});

// Удалить пользователя (только для админа)
app.delete('/admin/users/:id', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const userId = req.params.id;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({error: "User not found"});
    }

    // Нельзя удалить самого себя
    if (userId === req.user.sub) {
        return res.status(400).json({error: "Cannot delete yourself"});
    }

    users.splice(userIndex, 1);
    await invalidateUsersCache(userId);
    res.status(204).send();
});

    // 404 для всех остальных маршрутов
    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });
    // Глобальный обработчик ошибок (чтобы сервер не падал)
    app.use((err, req, res, next) => {
        console.error("Unhandled error:", err);
        res.status(500).json({ error: "Internal server error" });
    });

// Запуск сервера
redisClient.connect().then(() => {
    console.log("Redis connected");
    app.listen(port, () => {
        console.log(`Сервер запущен на http://localhost:${port}`);
    });
});