const {Person, PersonSchema} = require('./person.model');

function setupModels(sequelize) {
    Person.init(PersonSchema, Person.config(sequelize));
}

module.exports = setupModels;