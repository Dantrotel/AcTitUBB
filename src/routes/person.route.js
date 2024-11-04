const express = require('express');
const passport = require('passport');
require('../config/passport');
const personController = require('../controllers/person.controller');

const router = express.Router();

router.post('/create', personController.create);
router.get('/', personController.find);
router.get('/:id', personController.findById);
router.put('/:id', personController.update);
router.delete('/:id', personController.remove);
router.post('/login', personController.login);
router.post('/logout', personController.logout);

// Rutas de autenticación con Google
router.get('/auth/google', personController.googleAuth);
router.get('/auth/google/callback', personController.googleAuthCallback);
module.exports = router;
