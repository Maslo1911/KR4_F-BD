require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

const nowUnix = () => Math.floor(Date.now() / 1000);

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    age:        { type: Number, required: true },
    created_at: { type: Number, default: nowUnix },
    updated_at: { type: Number, default: nowUnix },
});

const User = mongoose.model('User', userSchema);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname))); // раздаёт index.html

// POST /api/users — создание
app.post('/api/users', async (req, res) => {
    const { first_name, last_name, age } = req.body;
    if (!first_name || !last_name || !age) {
        return res.status(400).json({ error: 'first_name, last_name и age обязательны' });
    }
    try {
        const user = await User.create({ first_name, last_name, age });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users — список всех
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ _id: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id — один пользователь
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/users/:id — обновление
app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: nowUnix() },
            { new: true, runValidators: true } // new: true — вернуть обновлённый документ
        );
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/users/:id — удаление
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json({ message: `Пользователь удалён` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));