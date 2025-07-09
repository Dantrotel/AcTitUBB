import path from 'path';
import express from 'express';

const router = express.Router();

router.get('/descargar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve('uploads/propuestas', filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error al descargar archivo:', err);
      res.status(404).send('Archivo no encontrado');
    }
  });
});

export default router;
