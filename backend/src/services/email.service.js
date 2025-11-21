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

// ============= NOTIFICACIONES DE ASIGNACIÓN DE PROFESOR =============

export const sendAsignacionProfesorEmail = async (estudianteEmail, estudianteNombre, propuestaTitulo, profesorNombre) => {
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: estudianteEmail,
    subject: '👨‍🏫 Profesor Asignado a tu Propuesta - AcTitUBB',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #004b8d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #004b8d; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>👨‍🏫 Profesor Asignado</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${estudianteNombre}</strong>,</p>
          <p>Te informamos que se ha asignado un profesor a tu propuesta de título:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: #004b8d;">📋 ${propuestaTitulo}</h3>
            <p><strong>Profesor Asignado:</strong> ${profesorNombre}</p>
          </div>
          <p>El profesor estará revisando tu propuesta y podrá contactarte para coordinar reuniones y darte seguimiento.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ============= NOTIFICACIONES DE ENTREGAS =============

export const sendEntregaRealizadaEmail = async (profesorEmail, profesorNombre, estudianteNombre, hitoNombre, proyectoTitulo) => {
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: profesorEmail,
    subject: '📤 Nueva Entrega Realizada - AcTitUBB',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📤 Nueva Entrega Realizada</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${profesorNombre}</strong>,</p>
          <p>El estudiante <strong>${estudianteNombre}</strong> ha realizado una nueva entrega:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: #28a745;">📚 ${proyectoTitulo}</h3>
            <p><strong>Hito/Entrega:</strong> ${hitoNombre}</p>
            <p><strong>Estudiante:</strong> ${estudianteNombre}</p>
          </div>
          <p>Por favor, revisa la entrega y proporciona retroalimentación al estudiante.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendEntregaRevisadaEmail = async (estudianteEmail, estudianteNombre, hitoNombre, proyectoTitulo, estado, comentarios) => {
  const estadoColor = estado === 'aprobado' ? '#28a745' : '#dc3545';
  const estadoTexto = estado === 'aprobado' ? '✅ Aprobada' : '❌ Requiere Correcciones';
  
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: estudianteEmail,
    subject: `📋 Entrega Revisada: ${estadoTexto} - AcTitUBB`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: ${estadoColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${estadoColor}; }
          .comentarios { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📋 Entrega Revisada</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${estudianteNombre}</strong>,</p>
          <p>Tu profesor ha revisado la siguiente entrega:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: ${estadoColor};">${estadoTexto}</h3>
            <p><strong>Proyecto:</strong> ${proyectoTitulo}</p>
            <p><strong>Hito/Entrega:</strong> ${hitoNombre}</p>
          </div>
          ${comentarios ? `
          <div class="comentarios">
            <h4 style="margin-top: 0;">💬 Comentarios del Profesor:</h4>
            <p>${comentarios}</p>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ============= NOTIFICACIONES DE FECHAS IMPORTANTES =============

export const sendFechaPublicadaEmail = async (destinatarios, titulo, descripcion, fecha, tipo) => {
  const tipoIcono = {
    'entrega': '📤',
    'reunion': '📅',
    'hito': '🎯',
    'evaluacion': '📝',
    'otro': '📌'
  };
  
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: destinatarios.join(', '),
    subject: `${tipoIcono[tipo] || '📌'} Nueva Fecha Importante - AcTitUBB`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #6f42c1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1; }
          .fecha-box { background: #e9ecef; padding: 15px; text-align: center; border-radius: 5px; margin: 15px 0; }
          .fecha { font-size: 24px; font-weight: bold; color: #6f42c1; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${tipoIcono[tipo] || '📌'} Nueva Fecha Importante</h2>
        </div>
        <div class="content">
          <p>Se ha publicado una nueva fecha importante:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: #6f42c1;">${titulo}</h3>
            ${descripcion ? `<p>${descripcion}</p>` : ''}
          </div>
          <div class="fecha-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Fecha:</p>
            <p class="fecha">${new Date(fecha).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <p>Por favor, toma nota de esta fecha en tu calendario.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ============= NOTIFICACIONES DE REUNIONES =============

export const sendSolicitudReunionEmail = async (profesorEmail, profesorNombre, estudianteNombre, proyectoTitulo, fechaPropuesta, mensaje) => {
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: profesorEmail,
    subject: '📅 Nueva Solicitud de Reunión - AcTitUBB',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8; }
          .mensaje { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📅 Solicitud de Reunión</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${profesorNombre}</strong>,</p>
          <p>Has recibido una solicitud de reunión de <strong>${estudianteNombre}</strong>:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: #17a2b8;">📚 ${proyectoTitulo}</h3>
            <p><strong>Fecha Propuesta:</strong> ${new Date(fechaPropuesta).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          ${mensaje ? `
          <div class="mensaje">
            <h4 style="margin-top: 0;">💬 Mensaje del Estudiante:</h4>
            <p>${mensaje}</p>
          </div>
          ` : ''}
          <p>Por favor, ingresa a la plataforma para aceptar o rechazar esta solicitud.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendRespuestaReunionEmail = async (estudianteEmail, estudianteNombre, profesorNombre, proyectoTitulo, estado, fechaReunion, comentarios) => {
  const estadoColor = estado === 'aceptada' ? '#28a745' : '#dc3545';
  const estadoTexto = estado === 'aceptada' ? '✅ Aceptada' : '❌ Rechazada';
  
  const mailOptions = {
    from: `"AcTitUBB - Notificaciones" <${process.env.EMAIL_USER}>`,
    to: estudianteEmail,
    subject: `📅 Reunión ${estadoTexto} - AcTitUBB`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: ${estadoColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${estadoColor}; }
          .comentarios { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📅 Respuesta a Solicitud de Reunión</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${estudianteNombre}</strong>,</p>
          <p>El profesor <strong>${profesorNombre}</strong> ha respondido a tu solicitud de reunión:</p>
          <div class="card">
            <h3 style="margin-top: 0; color: ${estadoColor};">${estadoTexto}</h3>
            <p><strong>Proyecto:</strong> ${proyectoTitulo}</p>
            ${estado === 'aceptada' ? `
            <p><strong>Fecha Confirmada:</strong> ${new Date(fechaReunion).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            ` : ''}
          </div>
          ${comentarios ? `
          <div class="comentarios">
            <h4 style="margin-top: 0;">💬 Comentarios del Profesor:</h4>
            <p>${comentarios}</p>
          </div>
          ` : ''}
          ${estado === 'aceptada' ? 
            '<p>¡No olvides asistir a la reunión en la fecha y hora acordadas!</p>' : 
            '<p>Por favor, coordina una nueva fecha con tu profesor.</p>'
          }
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Universidad del Bío-Bío - AcTitUBB</p>
        </div>
      </body>
      </html>
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
