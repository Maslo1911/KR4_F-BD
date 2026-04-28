const { Pool } = require('pg');
const express = require('express');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
const PORT = 3000;
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});

sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err))

const User = sequelize.define('User', {
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000),
    },
    updated_at: {
        type: DataTypes.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000),
    },
}, {
    tableName: 'users',
    timestamps: false,
});

app.use(express.json());
const nowUnix = () => Math.floor(Date.now() / 1000);

app.post('/api/users', async (req, res) => {
    const { first_name, last_name, age } = req.body;
    if (!first_name || !last_name || !age) {
        return res.status(400).json({ error: 'first_name, last_name и age обязательны' });
    }
    try {
        const user = await User.create({
            first_name,
            last_name,
            age,
            created_at: nowUnix(),
            updated_at: nowUnix(),
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['id', 'ASC']] });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        await user.update({
            ...req.body,
            updated_at: nowUnix(),
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        await user.destroy();
        res.json({ message: `Пользователь ${req.params.id} удалён` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

sequelize.sync({ alter: true })
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error('Ошибка подключения к БД:', err));