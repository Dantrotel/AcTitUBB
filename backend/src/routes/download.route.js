import path from 'path';
import fs from 'fs';
import express from 'express';
import { verifySession } from '../middlewares/verifySession.js';
const router = express.Router();

router.get('/descargar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve('uploads/propuestas', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error al descargar archivo:', err);
      res.status(500).send('Error al descargar el archivo');
    }
  });
});

export default router;
