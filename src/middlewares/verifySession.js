// src/middleware/verifySession.js
const Person = require('../db/models/person.model');

async function verifySession(req, res, next) {
  const { email, sessionToken } = req.headers;

  if (!email || !sessionToken) {
    return res.status(401).json({ error: 'No autorizado: faltan credenciales' });
  }

  const user = await Person.findOne({ where: { email } });
  if (!user || user.sessionToken !== sessionToken) {
    return res.status(401).json({ error: 'Sesión no válida o expirada' });
  }

  req.user = user; // Adjunta el usuario a la solicitud para usarlo en las rutas protegidas
  next();
}

module.exports = verifySession;
