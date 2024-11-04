const { Model, DataTypes } = require('sequelize');

const PERSON_MODEL = 'person';

class Person extends Model {
    static config(sequelize) {
        return {
            sequelize,
            modelName: 'Person',
            tableName: PERSON_MODEL,
            timestamps: true,
        };
    }
}

// Definición del esquema de la tabla
const PersonSchema = {
    rut: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'rut',
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name',
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'age',
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'email',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password',
    },
    role: {
        type: DataTypes.ENUM(
            'admin',
            'guide professor',
            'student',
            'head career',
            'professor room',
            'informant professor',
            'professor',
            'secretary',
            'head department'
        ),
        allowNull: false,
        field: 'role',
    },
    sessionToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'session_token',
    },
};

module.exports = { Person, PersonSchema };
