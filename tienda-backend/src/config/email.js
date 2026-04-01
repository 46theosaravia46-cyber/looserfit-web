const nodemailer = require('nodemailer');

// Configurar transporte de email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'looserfit2004@gmail.com',
        pass: process.env.EMAIL_PASS || ''
    },
    tls: {
       rejectUnauthorized: false
    },
    family: 4, // Forzar IPv4 para evitar errores ENETUNREACH en Render
    connectionTimeout: 10000, // 10 segundos de timeout
    greetingTimeout: 5000,
    socketTimeout: 15000
});

// Verificar la conexión
transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️  Error en configuración de email:', error.message);
    } else {
        console.log('✅ Servidor de email listo');
    }
});

async function enviarEmailPedido(datosEnvio, pedido) {
    try {
        const productosHTML = pedido.productos
            .map(p => `<li>${p.nombre} x${p.cantidad} - $${p.precio.toLocaleString('es-AR')}</li>`)
            .join('');

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
                <h2 style="color: #333;">¡Pedido recibido!</h2>
                <p>Hola <strong>${datosEnvio.nombreCompleto}</strong>,</p>
                <p>Tu pedido ha sido registrado exitosamente. Aquí están los detalles:</p>
                
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <p><strong>Número de orden:</strong> ${pedido.orderNumber}</p>
                    <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-AR')}</p>
                    <p><strong>Estado:</strong> ${pedido.estado}</p>
                    <h4>Productos:</h4>
                    <ul>${productosHTML}</ul>
                </div>
                
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <h4>Datos de envío:</h4>
                    <p><strong>Provincia:</strong> ${datosEnvio.provincia}</p>
                    <p><strong>Localidad:</strong> ${datosEnvio.localidad}</p>
                    ${datosEnvio.calleNumero ? `<p><strong>Dirección:</strong> ${datosEnvio.calleNumero}</p>` : ''}
                    ${datosEnvio.direccionSucursal ? `<p><strong>Sucursal:</strong> ${datosEnvio.direccionSucursal}</p>` : ''}
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Próximas instrucciones para realizar el pago serán enviadas a este email.
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'looserfit2004@gmail.com',
            to: datosEnvio.email,
            subject: `Pedido confirmado - Orden ${pedido.orderNumber}`,
            html
        });

        console.log(`✅ Email enviado a ${datosEnvio.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email de pedido:', error);
        return false;
    }
}

async function enviarEmailSeguimiento(datosEnvio, trackingNumber, orderNumber) {
    try {
        const correoLink = `https://www.correoargentino.com.ar/seguimiento-de-envios?codigoSeguimiento=${trackingNumber}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
                <h2 style="color: #333;">¡Tu pedido está en camino! 📦</h2>
                <p>Hola <strong>${datosEnvio.nombreCompleto}</strong>,</p>
                <p>Tu pedido ha sido enviado y ya está en manos de Correo Argentino.</p>
                
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <p><strong>Número de orden:</strong> ${orderNumber}</p>
                    <h3 style="color: #e74c3c;">Código de seguimiento: ${trackingNumber}</h3>
                    <p>Puedes rastrear tu paquete en el siguiente enlace:</p>
                    <a href="${correoLink}" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 10px 0;">
                        Ver estado del envío
                    </a>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Si tienes problemas, contáctanos por WhatsApp.
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'looserfit2004@gmail.com',
            to: datosEnvio.email,
            subject: `¡Tu pedido está en camino! Código de seguimiento: ${trackingNumber}`,
            html
        });

        console.log(`✅ Email de seguimiento enviado a ${datosEnvio.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email de seguimiento:', error);
        return false;
    }
}

async function enviarEmailNotificacionAdmin(pedido) {
    try {
        const productosHTML = pedido.productos
            .map(p => `<li>${p.nombre} (Talle: ${p.talle || 'N/A'}) x${p.cantidad} - $${p.precio.toLocaleString('es-AR')}</li>`)
            .join('');

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
                <h2 style="color: #333;">🛒 ¡Nuevo Pedido Recibido!</h2>
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <p><strong>Número de orden:</strong> ${pedido.orderNumber}</p>
                    <p><strong>Cliente:</strong> ${pedido.datosEnvio?.nombreCompleto}</p>
                    <p><strong>Email:</strong> ${pedido.datosEnvio?.email}</p>
                    <p><strong>Teléfono:</strong> ${pedido.datosEnvio?.telefono}</p>
                    <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-AR')}</p>
                    <p><strong>Tipo de envío:</strong> ${pedido.tipoEnvio === 'sucursal' ? 'Retiro en sucursal' : 'Envío a domicilio'}</p>
                    <h4>Productos:</h4>
                    <ul>${productosHTML}</ul>
                </div>
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <h4>Datos de envío:</h4>
                    <p><strong>Provincia:</strong> ${pedido.datosEnvio?.provincia}</p>
                    <p><strong>Localidad:</strong> ${pedido.datosEnvio?.localidad}</p>
                    ${pedido.datosEnvio?.calleNumero ? `<p><strong>Dirección:</strong> ${pedido.datosEnvio.calleNumero}</p>` : ''}
                    ${pedido.datosEnvio?.direccionSucursal ? `<p><strong>Sucursal:</strong> ${pedido.datosEnvio.direccionSucursal}</p>` : ''}
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'looserfit2004@gmail.com',
            to: process.env.EMAIL_USER || 'looserfit2004@gmail.com',
            subject: `🛒 Nuevo Pedido ${pedido.orderNumber} - ${pedido.datosEnvio?.nombreCompleto}`,
            html
        });

        console.log(`✅ Notificación de pedido enviada al admin`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar notificación al admin:', error);
        return false;
    }
}

module.exports = {
    transporter,
    enviarEmailPedido,
    enviarEmailSeguimiento,
    enviarEmailNotificacionAdmin
};
