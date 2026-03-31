const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- ENVIAR NEWSLETTER ---
router.post('/newsletter', protect, adminOnly, async (req, res) => {
    try {
        const { asunto, contenido } = req.body;

        if (!asunto || !contenido) {
            return res.status(400).json({ error: 'Asunto y contenido son obligatorios' });
        }

        // 1. Obtener todos los emails
        const users = await User.find({}, 'email');
        const emails = users.map(u => u.email);

        if (emails.length === 0) {
            return res.status(200).json({ mensaje: 'No hay usuarios registrados para enviar noticias' });
        }

        // 2. Configurar el transportador (Placeholder: El usuario debe poner sus credenciales reales en .env)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Ej: looserfit.tienda@gmail.com
                pass: process.env.EMAIL_PASS, // Contraseña de aplicación
            }
        });

        const mailOptions = {
            from: `"Looser Fit" <${process.env.EMAIL_USER}>`,
            to: emails, // Envío masivo (mejor usar BCC en producción real, pero para 10-100 sirve)
            subject: asunto,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <div style="font-size: 16px; line-height: 1.6; color: #333;">
                        ${contenido.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `
        };

        // 3. Enviar (Opcional: hacerlo async sin esperar si son miles, pero para pocos está bien)
        await transporter.sendMail(mailOptions);

        res.json({ mensaje: `Noticia enviada correctamente a ${emails.length} usuarios.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al enviar la noticia. Verifica las credenciales de Gmail.' });
    }
});

module.exports = router;
