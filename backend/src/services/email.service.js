import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar a otro si quieres
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  
});

export const sendConfirmationEmail = async (email, token) => {
  const confirmationUrl = `http://146.83.194.168:3000/api/v1/users/confirm/${token}`;

  const mailOptions = {
    from: `"AcTitUBB" <${process.env.EMAIL_USER}>`,
    to: email, // ✅ Usar el parámetro correcto
    subject: 'Confirma tu cuenta en AcTitUBB',
    html: `
      <h2>¡Bienvenido a AcTitUBB!</h2>
      <p>Para activar tu cuenta, confirma tu correo haciendo clic en el siguiente enlace:</p>
      <a href="${confirmationUrl}">Confirmar mi cuenta</a>
      <p>Si no fuiste tú, ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
