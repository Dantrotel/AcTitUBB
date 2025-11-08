import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ruta del directorio donde se guardarán los archivos
const uploadDirPropuestas = 'uploads/propuestas';
const uploadDirDocumentos = 'uploads/documentos';

// Crear las carpetas si no existen
if (!fs.existsSync(uploadDirPropuestas)) {
  fs.mkdirSync(uploadDirPropuestas, { recursive: true });
}

if (!fs.existsSync(uploadDirDocumentos)) {
  fs.mkdirSync(uploadDirDocumentos, { recursive: true });
}

// Configuración de almacenamiento para propuestas
const storagePropuestas = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirPropuestas);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Configuración de almacenamiento para documentos
const storageDocumentos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirDocumentos);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF y Word (.pdf, .docx, .doc)'));
  }
};

const uploadPropuestas = multer({ storage: storagePropuestas, fileFilter });
const uploadDocumentos = multer({ storage: storageDocumentos, fileFilter });

export const uploadPropuesta = uploadPropuestas.single('archivo');
export const uploadDocumento = uploadDocumentos.single('archivo');
