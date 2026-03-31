const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const EMAIL_TO_PROMOTE = process.argv[2];

if (!EMAIL_TO_PROMOTE) {
    console.log('Uso: node promoteAdmin.js <email>');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ email: EMAIL_TO_PROMOTE.toLowerCase() });
        if (!user) {
            console.log('Usuario no encontrado.');
            process.exit(1);
        }
        user.isAdmin = true;
        await user.save();
        console.log(`✅ Usuario ${EMAIL_TO_PROMOTE} ahora es administrador.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
