const mongoose = require('mongoose');
require('dotenv').config();

const familyImageSchema = new mongoose.Schema({
    src: String,
    titulo: String,
    descripcion: String,
}, { _id: false });

const homeContentSchema = new mongoose.Schema({
    heroImages: [String],
    familyImages: [familyImageSchema]
});

const HomeContent = mongoose.model('HomeContent', homeContentSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/looserfit');
        const doc = await HomeContent.findOne();
        console.log('--- HomeContent Data ---');
        console.log(JSON.stringify(doc.familyImages, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
