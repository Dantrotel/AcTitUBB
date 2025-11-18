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
  const confirmationUrl = `http://localhost:3000/api/v1/users/confirm/${token}`;

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

export const sendPasswordResetEmail = async (email, nombre, passwordTemporal, rut) => {
  const loginUrl = `http://localhost:4200/login`; // URL del frontend

  const mailOptions = {
    from: `"AcTitUBB - Administración" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Contraseña Temporal - AcTitUBB',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #004b8d 0%, #0066cc 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .password-box {
            background: white;
            border: 2px dashed #004b8d;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border-radius: 8px;
          }
          .password {
            font-size: 24px;
            font-weight: bold;
            color: #004b8d;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            background: #004b8d;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .steps {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .step {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
          }
          .step:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔑 Reseteo de Contraseña</h1>
          <p>Universidad del Bío-Bío</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          
          <p>Tu contraseña ha sido reseteada por un administrador. A continuación encontrarás tu contraseña temporal:</p>
          
          <div class="password-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Tu contraseña temporal es:</p>
            <p class="password">${passwordTemporal}</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Por seguridad, deberás cambiar esta contraseña temporal al iniciar sesión por primera vez.
          </div>
          
          <div class="steps">
            <h3 style="margin-top: 0; color: #004b8d;">📋 Pasos para acceder:</h3>
            <div class="step">Copia la contraseña temporal mostrada arriba</div>
            <div class="step">Haz clic en el botón "Iniciar Sesión"</div>
            <div class="step">Ingresa tu RUT: <strong>${rut}</strong></div>
            <div class="step">Pega la contraseña temporal</div>
            <div class="step">Serás redirigido para crear tu nueva contraseña</div>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Iniciar Sesión</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Nota:</strong> Esta contraseña temporal solo funcionará hasta que la cambies por una de tu elección.
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - Sistema AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
