// Script de depuración para el problema de propuestas
// Ejecuta este endpoint para ver exactamente qué datos están llegando

export const debugPropuestaController = async (req, res) => {
  try {
    console.log('=== DEBUG PROPUESTA ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file);
    console.log('User from token:', {
      rut: req.rut,
      rol: req.rol,
      rol_id: req.rol_id,
      role_id: req.role_id
    });

    // Validar qué campos están llegando
    const camposRequeridos = ['titulo', 'descripcion', 'fecha_envio'];
    const camposFaltantes = [];

    camposRequeridos.forEach(campo => {
      if (!req.body[campo] || req.body[campo].trim() === '') {
        camposFaltantes.push(campo);
      }
    });

    console.log('Campos faltantes:', camposFaltantes);

    // Validar fecha
    if (req.body.fecha_envio) {
      const fecha = new Date(req.body.fecha_envio);
      console.log('Fecha original:', req.body.fecha_envio);
      console.log('Fecha parseada:', fecha);
      console.log('Fecha válida:', !isNaN(fecha));
    }

    // Mostrar estructura esperada vs recibida
    const estructuraEsperada = {
      titulo: 'string (requerido)',
      descripcion: 'string (requerido)', 
      fecha_envio: 'date (requerido)',
      modalidad: 'string (opcional)',
      archivo: 'file (opcional)'
    };

    console.log('Estructura esperada:', estructuraEsperada);
    
    res.json({
      success: true,
      debug: {
        method: req.method,
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.filename
        } : null,
        user: {
          rut: req.rut,
          rol: req.rol_id
        },
        camposFaltantes,
        estructuraEsperada,
        sugerencias: camposFaltantes.length > 0 ? [
          `Faltan estos campos: ${camposFaltantes.join(', ')}`,
          'Verifica que el frontend esté enviando todos los campos requeridos',
          'Asegúrate de que fecha_envio tenga formato YYYY-MM-DD'
        ] : ['Todos los campos requeridos están presentes']
      }
    });

  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
};