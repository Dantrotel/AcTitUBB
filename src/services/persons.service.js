const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');

class PersonService {
    constructor() {}

    async find() {
        const persons = await models.Person.findAll();
        return persons;
    }

    async findById(id) {
        const person = await models.Person.findByPk(id);
        if (!person) {
            throw new Error('Persona no encontrada');
        }
        return person;
    }

    async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const person = await models.Person.create({ ...data, password: hashedPassword });
        return person;
    }

    async update(id, data) {
        const person = await this.findById(id);
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await person.update(data);
        return person;
    }

    async delete(id) {
        const person = await this.findById(id);
        await person.destroy();
        return person;
    }

    async login(email, password) {
        const person = await models.Person.findOne({
            where: {
                email,
                email: {
                    [Op.or]: ['@ubiobio.cl', '@alumnos.ubiobio.cl'].map(domain => {
                        return { [Op.like]: `%${domain}` };
                    })
                }
            }
        });

        if (!person) {
            throw new Error('Usuario no encontrado o dominio no permitido');
        }

        const isPasswordValid = await bcrypt.compare(password, person.password);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }

        // Generar sessionToken y actualizar el modelo con el nuevo token
        const sessionToken = jwt.sign({ id: person.id, email: person.email }, 'yourSecretKey', { expiresIn: '24h' });
        await person.update({ sessionToken });

        return { person, sessionToken };
    }

    async logout(email) {
        const person = await models.Person.findOne({ where: { email } });
        if (!person) {
            throw new Error('Usuario no encontrado');
        }

        // Elimina el sessionToken al cerrar sesión
        await person.update({ sessionToken: null });
        return { message: 'Sesión cerrada correctamente' };
    }

    async findOrCreateGoogleUser(profile) {
        const email = profile.emails[0].value;
        let user = await models.Person.findOne({ where: { email } });

        if (!user) {
            user = await models.Person.create({
                name: profile.displayName,
                email,
                role: 'student', // Define el rol por defecto o ajusta según tu lógica
                password: bcrypt.hashSync('google_oauth', 10) // Placeholder password
            });
        }
        return user;
    }
}

module.exports = PersonService;
