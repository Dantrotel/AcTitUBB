// Script temporal para generar hash bcrypt
import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash para "password123":');
  console.log(hash);
}

generateHash();
