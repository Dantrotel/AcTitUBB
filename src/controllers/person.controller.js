const PersonService = require('../services/persons.service');
const service = new PersonService();
const passport = require('passport');

const create = async (req, res) => {
    try {
        const person = await service.create(req.body);
        res.json({ success: true, data: person });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const find = async (req, res) => {
    try {
        const persons = await service.find();
        res.json({ success: true, data: persons });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const findById = async (req, res) => {
    try {
        const person = await service.findById(req.params.id);
        res.json({ success: true, data: person });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const person = await service.update(req.params.id, req.body);
        res.json({ success: true, data: person });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const person = await service.delete(req.params.id);
        res.json({ success: true, data: person });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Método para el login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { person, sessionToken } = await service.login(email, password);
        res.json({ success: true, data: { person, sessionToken } });
    } catch (error) {
        res.status(401).send({ success: false, message: error.message });
    }
};

// Método para el logout
const logout = async (req, res) => {
    try {
        const { email } = req.body;
        await service.logout(email);
        res.json({ success: true, message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Ruta para redirigir a Google
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Ruta de callback de Google
const googleAuthCallback = passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
}, (req, res) => {
    const user = req.user;
    res.json({ success: true, data: { user } });
});

module.exports = { create, find, findById, update, remove, login, logout, googleAuth, googleAuthCallback };
