// Script temporal para generar hash bcrypt
import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'Password123!';
  const hash = await bcrypt.hash(password, 10);
  
  
}

generateHash();
