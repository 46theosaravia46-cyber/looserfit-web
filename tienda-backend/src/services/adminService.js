const User = require('../models/User');
const nodemailer = require('nodemailer');

const enviarNewsletter = async (asunto, contenido) => {
    const users = await User.find({}, 'email');
    const emails = users.map(u => u.email).filter(Boolean);

    if (emails.length === 0) return { mensaje: 'No hay usuarios suscritos' };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"Looser Fit" <${process.env.EMAIL_USER}>`,
        to: emails,
        subject: asunto,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <div style="font-size: 16px; line-height: 1.6; color: #333;">
                    ${contenido.replace(/\n/g, '<br>')}
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    return { mensaje: `Noticia enviada correctamente a ${emails.length} usuarios.` };
};

module.exports = {
    enviarNewsletter
};
