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
    Rut: {
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
};

module.exports = { Person, PersonSchema };
