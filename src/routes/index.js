
const express = require('express');
const router = require('./src/routes'); // Asegúrate de la ruta según tu estructura de carpetas
const app = express();
const PORT = process.env.PORTmiddleware;

app.use(express.json()); // Para que pueda recibir JSON en las solicitudes

// Configuración de rutas
router(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

