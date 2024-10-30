const express = require('express');
const router = express.Router();
const personController = require('../controllers/person.controller');

router.get('/', personController.find);
router.get('/:id', personController.findById);
router.post('/', personController.create);
router.put('/:id', personController.update);
router.delete('/:id', personController.remove);

module.exports = router;
