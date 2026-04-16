const mongoose = require('mongoose');
const HomeContent = require('../src/models/HomeContent');
require('dotenv').config();

async function fixSpelling() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const home = await HomeContent.findOne();
        if (home && home.comingSoon && home.comingSoon.message) {
            const oldMsg = home.comingSoon.message;
            if (oldMsg.includes('lanzara')) {
                home.comingSoon.message = oldMsg.replace('lanzara', 'lanzará');
                await home.save();
                console.log('✅ Ortografía corregida en la base de datos.');
            } else {
                console.log('ℹ️ No se encontró el error de ortografía en la base de datos.');
            }
        }
    } catch (err) {
        console.error('❌ Error al conectar o guardar:', err);
    } finally {
        mongoose.connection.close();
    }
}

fixSpelling();
