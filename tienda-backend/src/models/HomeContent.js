const mongoose = require('mongoose');

const familyImageSchema = new mongoose.Schema({
    src: { type: String, required: true },
    titulo: { type: String, default: '' },
    descripcion: { type: String, default: '' },
}, { _id: false });

const homeContentSchema = new mongoose.Schema({
    heroImages: [{ type: String }],
    familyImages: { type: [familyImageSchema], default: [] },
    comingSoon: {
        enabled: { type: Boolean, default: false },
        launchDate: { type: Date },
        message: { type: String, default: 'Web prendida próximamente en:' },
        subtitle: { type: String, default: '' },
        emailMessage: { type: String, default: '' }
    },
    featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('HomeContent', homeContentSchema);
