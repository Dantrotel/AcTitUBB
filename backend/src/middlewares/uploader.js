import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ruta del directorio donde se guardarán los archivos
const uploadDir = 'uploads/propuestas';

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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

const upload = multer({ storage, fileFilter });

export const uploadPropuesta = upload.single('archivo');
