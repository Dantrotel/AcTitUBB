const {models} = require('../libs/sequelize');

class personService {

    constructor() {}

    async find() {
        const persons = await models.Person.findAll();
        return persons;
    }

    async findById(id) {
        const person = await models.Person.findByPk(id);
        return person;
    }

    async create(data) {
        const person = await models.Person.create(data);
        return person;
    }

    async update(id, data) {
        const person = await models.Person.findByPk(id);
        await person.update(data);
        return person;
    }

    async delete(id) {
        const person = await models.Person.findByPk(id);
        await person.destroy();
        return person;
    }
}

module.exports = personService;