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

// Filtro para tipos de archivo permitidos (extensión Y MIME type)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.ppt', '.pptx', '.zip', '.rar'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();

  // Validar extensión
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Extensión no permitida. Solo se permiten: .pdf, .docx, .doc, .ppt, .pptx, .zip, .rar'));
  }

  // Validar MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido. El contenido del archivo no corresponde a un documento válido'));
  }

  cb(null, true);
};

// Configuración de almacenamiento para versiones
const storageVersiones = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/versiones';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Configuración de almacenamiento para plantillas
const storagePlantillas = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/plantillas';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadPropuestas = multer({ storage: storagePropuestas, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadDocumentos = multer({ storage: storageDocumentos, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVersiones = multer({ storage: storageVersiones, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadPlantillas = multer({ storage: storagePlantillas, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadPropuesta = uploadPropuestas.single('archivo');
export const uploadRevision = uploadPropuestas.single('archivo_revision'); // Para archivos de revisión
export const uploadDocumento = uploadDocumentos.single('archivo');
export const upload = uploadVersiones; // Exportar el objeto multer, no el middleware
export const uploadVersion = uploadVersiones;
export const uploadPlantilla = uploadPlantillas;
