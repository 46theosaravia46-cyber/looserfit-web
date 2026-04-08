const HomeContent = require('../models/HomeContent');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const createTransport = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
}

const sendLaunchNotification = async (message, subtitle, emailMessage) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
        const users = await User.find({}, 'email');
        const emails = users.map(u => u.email).filter(Boolean);
        if (!emails.length) return;

        const transporter = createTransport();
        const mailOptions = {
            from: `"Looser Fit" <${process.env.EMAIL_USER}>`,
            to: emails,
            subject: 'Looser Fit ya está disponible',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h1 style="color: #111;">Looser Fit está de nuevo en vivo</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">${emailMessage || message || 'La tienda está disponible nuevamente.'}</p>
                    ${subtitle ? `<p style="font-size: 15px; line-height: 1.6; color: #555;">${subtitle}</p>` : ''}
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">Ingresá ahora a ver los nuevos productos.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending launch notification:', err);
    }
}

const getHomeContent = async () => {
    let doc = await HomeContent.findOne();
    if (!doc) {
        doc = await HomeContent.create({
            heroImages: ['/hero-1.jpg', '/hero-ver-todo.jpg', '/hero-3.jpg']
        });
    }

    if (doc.comingSoon?.enabled && doc.comingSoon?.launchDate && new Date(doc.comingSoon.launchDate) <= new Date()) {
        doc.comingSoon.enabled = false;
        await doc.save();
        await sendLaunchNotification(doc.comingSoon.message, doc.comingSoon.subtitle, doc.comingSoon.emailMessage);
    }
    return doc;
};

const updateHero = async (images) => {
    // Ya no obligamos a que sean 3
    const home = await getHomeContent();
    home.heroImages = images;
    return await home.save();
};

const updateFamily = async (familyImages) => {
    let doc = await HomeContent.findOne();
    if (!doc) doc = await HomeContent.create({});
    doc.familyImages = familyImages;
    return await doc.save();
};

const updateSettings = async (comingSoon) => {
    let doc = await HomeContent.findOne();
    if (!doc) doc = await HomeContent.create({});
    
    const enabled = Boolean(comingSoon.enabled);
    let launchDate = null;
    if (enabled) {
        const durationMinutes = Number(comingSoon.durationMinutes || 0);
        if (durationMinutes <= 0) throw new Error('La duración debe ser mayor a 0 minutos');
        launchDate = new Date(Date.now() + durationMinutes * 60000);
    }

    doc.comingSoon = {
        enabled,
        launchDate,
        message: comingSoon.message?.trim() || 'Web prendida próximamente en:',
        subtitle: comingSoon.subtitle?.trim() || '',
        emailMessage: comingSoon.emailMessage?.trim() || ''
    };

    return await doc.save();
};

module.exports = {
    getHomeContent,
    updateHero,
    updateFamily,
    updateSettings
};
