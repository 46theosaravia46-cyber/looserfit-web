const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const upload = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const HomeContent = require('../models/HomeContent');
const User = require('../models/User');

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
        console.error('Error enviando notificación de lanzamiento:', err);
    }
}

router.get('/', async (_req, res) => {
    try {
        let doc = await HomeContent.findOne();
        if (!doc) {
            doc = await HomeContent.create({
                heroImages: ['/hero-1.jpg', '/hero-ver-todo.jpg', '/hero-3.jpg']
            });
        }

        if (doc.comingSoon?.enabled && doc.comingSoon?.launchDate && new Date(doc.comingSoon.launchDate) <= new Date()) {
            doc.comingSoon.enabled = false;
            await doc.save();
            sendLaunchNotification(doc.comingSoon.message, doc.comingSoon.subtitle, doc.comingSoon.emailMessage);
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener contenido home', error: error.message });
    }
});

router.put('/hero', protect, adminOnly, upload.array('newHeroImages', 10), async (req, res) => {
    try {
        let doc = await HomeContent.findOne();
        if (!doc) {
            doc = await HomeContent.create({});
        }

        let finalImages = [];
        if (req.body.heroData) {
            try {
                finalImages = typeof req.body.heroData === 'string' 
                    ? JSON.parse(req.body.heroData) 
                    : req.body.heroData;
            } catch (pErr) {
                console.error('Error parseando heroData:', pErr);
                finalImages = [];
            }
        }

        let fileIndex = 0;
        finalImages = finalImages.map(item => {
            if (item.startsWith('NEW_FILE_') && req.files && req.files[fileIndex]) {
                const path = req.files[fileIndex].path;
                fileIndex++;
                return path;
            }
            return item;
        });

        doc.heroImages = finalImages.slice(0, 3);
        await doc.save();
        res.json({ mensaje: 'Hero actualizado', home: doc });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar hero', error: error.message });
    }
});

router.put('/family', protect, adminOnly, upload.array('newFamilyImages', 20), async (req, res) => {
    try {
        let doc = await HomeContent.findOne();
        if (!doc) doc = await HomeContent.create({});

        let finalConfig = [];
        if (req.body.familyData) {
            try {
                finalConfig = typeof req.body.familyData === 'string' 
                    ? JSON.parse(req.body.familyData) 
                    : req.body.familyData;
            } catch (pErr) {
                console.error('Error parseando familyData:', pErr);
                finalConfig = [];
            }
        }

        let fileIndex = 0;
        const familyImages = finalConfig.map(item => {
            let src = item.src;
            if (src.startsWith('NEW_FILE_') && req.files && req.files[fileIndex]) {
                src = req.files[fileIndex].path;
                fileIndex++;
            }
            return {
                src,
                titulo: item.titulo || '',
                descripcion: item.descripcion || ''
            };
        });

        doc.familyImages = familyImages;
        await doc.save();
        res.json({ mensaje: 'Family actualizado', home: doc });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar family', error: error.message });
    }
});

router.put('/settings', protect, adminOnly, async (req, res) => {
    try {
        let doc = await HomeContent.findOne();
        if (!doc) doc = await HomeContent.create({});

        const { comingSoon } = req.body;
        if (!comingSoon || typeof comingSoon !== 'object') {
            return res.status(400).json({ mensaje: 'Falta la configuración de lanzamiento' });
        }

        const enabled = Boolean(comingSoon.enabled);
        let launchDate = null;
        if (enabled) {
            const durationMinutes = Number(comingSoon.durationMinutes || 0);
            if (durationMinutes <= 0) {
                return res.status(400).json({ mensaje: 'La duración debe ser mayor a 0 minutos' });
            }
            launchDate = new Date(Date.now() + durationMinutes * 60000);
        }

        doc.comingSoon = {
            enabled,
            launchDate,
            message: comingSoon.message?.trim() || 'Web prendida próximamente en:',
            subtitle: comingSoon.subtitle?.trim() || '',
            emailMessage: comingSoon.emailMessage?.trim() || ''
        };

        await doc.save();
        res.json({ mensaje: 'Configuración de lanzamiento actualizada', home: doc });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar configuración de lanzamiento', error: error.message });
    }
});

module.exports = router;
