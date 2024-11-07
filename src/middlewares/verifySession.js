import jwt from 'jsonwebtoken';

export const verifySession = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({message: "Unauthorized"});
  }

  token = token.split(" ")[1];

  try {
    const { email, rol_id} = jwt.verify(token, process.env.JWT_SECRET);
    req.email = email;
    req.rol_id = rol_id;  
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({message: "Unauthorized"});
  }
};

// admin verify
export const verifyAdmin = (req, res, next) => {
  if (req.nombre === 'admin') {
    return next();
  }

  return res.status(403).json({message: "access denied"});
};

// student verify
export const verifyStudent = (req, res, next) => {
  if (req.nombre === 'estudiante' || req.nombre === 'profesor' || req.nombre === 'jefe_carrera' || req.nombre === 'admin') {
    return next();
  }

  return res.status(403).json({message: "access denied"});
};

// teacher verify
export const verifyTeacher = (req, res, next) => {
  if (req.nombre === 'profesor' || req.nombre === 'admin') {
    return next();
  }

  return res.status(403).json({message: "access denied"});
}

// headcareers verify
export const verifyHeadcareers = (req, res, next) => {
  if (req.nombre === 'jefe de carrera' || req.nombre === 'admin') {
    return next();
  }

  return res.status(403).json({message: "access denied"});
}
