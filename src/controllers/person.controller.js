const personService = require('../services/persons.service');
const service = new personService();

const create = async (req, res) => {
    try {
        const person = await service.create(req.body);
        res.json({success: true, data: person});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const find = async (req, res) => {
    try {
        const persons = await service.find();
        res.json({success: true, data: persons});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const findById = async (req, res) => {
    try {
        const person = await service.findById(req.params.id);
        res.json({success: true, data: person});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const update = async (req, res) => {
    try {
        const person = await service.update(req.params.id, req.body);
        res.json({success: true, data: person});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const remove = async (req, res) => {
    try {
        const person = await service.delete(req.params.id);
        res.json({success: true, data: person});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

module.exports = {create, find, findById, update, remove};